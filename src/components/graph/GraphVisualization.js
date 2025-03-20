import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ForceGraph2D from 'react-force-graph-2d';
import {
  setGraphData,
  setSelectedNodes,
  setCurrentLayer,
  toggleConnections,
  setZoom,
  setCenter,
} from '../../store/slices/graphSlice';
import { setSelectedNode } from '../../store/slices/nodeSlice';

const GraphVisualization = () => {
  const dispatch = useDispatch();
  const graphRef = useRef();
  const {
    nodes,
    links,
    selectedNodes,
    currentLayer,
    showConnections,
    zoom,
    center,
    isLoading,
  } = useSelector((state) => state.graph);

  // Create a memoized graph data object
  const graphData = useMemo(() => {
    console.log('Creating graph data with:', { nodes, links, currentLayer, showConnections });
    
    if (!nodes || !links) {
      return { nodes: [], links: [] };
    }

    // Create new node objects to ensure they're mutable
    const filteredNodes = nodes
      .filter((node) => node.layer <= currentLayer) // Show nodes up to current layer
      .map(node => {
        console.log('Processing node for graph:', node);
        // Create a new object with only essential properties
        const x = node.x || Math.random() * 800 - 400;
        const y = node.y || Math.random() * 800 - 400;
        
        return {
          ...node,
          // Ensure basic properties are properly typed
          id: String(node.id),
          name: String(node.name),
          val: Number(node.relevance),
          x,
          y,
          // Initialize position properties needed by force-graph
          fx: null,
          fy: null,
          initPos: { x, y }
        };
      });

    console.log('Filtered nodes:', filteredNodes);

    // Create a Set of node IDs in the current layer for faster lookup
    const currentLayerNodeIds = new Set(filteredNodes.map(node => node.id));

    // Create new link objects, only including links where both source and target exist in current layer
    const filteredLinks = showConnections
      ? links
          .filter(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
            return currentLayerNodeIds.has(sourceId) && currentLayerNodeIds.has(targetId);
          })
          .map(link => ({
            source: link.source,
            target: link.target,
            value: Number(link.value),
            color: link.color || '#CBD5E0'
          }))
      : [];

    console.log('Filtered links:', filteredLinks);

    return {
      nodes: filteredNodes,
      links: filteredLinks
    };
  }, [nodes, links, currentLayer, showConnections]);

  // Handle node click
  const handleNodeClick = (node) => {
    console.log('Node clicked:', node);
    // Pass the original node data to maintain all properties
    dispatch(setSelectedNodes([node]));
    dispatch(setSelectedNode(node));
  };

  // Handle node drag end
  const handleNodeDragEnd = (node, translate) => {
    if (node) {
      const updatedNode = {
        ...node,
        x: translate.x,
        y: translate.y
      };
      
      const updatedNodes = nodes.map(n => 
        n.id === node.id ? { ...n, ...updatedNode } : n
      );
      dispatch(setGraphData({ nodes: updatedNodes, links }));
    }
  };

  // Handle zoom
  const handleZoom = (zoom) => {
    dispatch(setZoom(zoom));
  };

  // Handle center change
  const handleCenterChange = (center) => {
    dispatch(setCenter(center));
  };

  // Layer controls
  const handleLayerChange = (layer) => {
    dispatch(setCurrentLayer(layer));
  };

  // Connection toggle
  const handleToggleConnections = () => {
    dispatch(toggleConnections());
  };

  // Set initial zoom when component mounts
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.zoom(1.5); // Set a closer initial zoom
      graphRef.current.centerAt(0, 0);
    }
  }, []);

  return (
    <div className="relative bg-white lg h-[calc(100vh-200px)]">
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white p-2">
        <div className="flex space-x-2">
          {[0, 1, 2, 3].map((layer) => (
            <button
              key={layer}
              onClick={() => handleLayerChange(layer)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentLayer === layer
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Layer {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Connection Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleToggleConnections}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            showConnections
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showConnections ? 'Hide Connections' : 'Show Connections'}
        </button>
      </div>

      {/* Graph Visualization */}
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="group"
        nodeRelSize={8}
        linkWidth={1}
        linkColor="#CBD5E0"
        linkOpacity={0.6}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.002}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor="#CBD5E0"
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          
          // Add text label
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, node.x, node.y + 10);
        }}
        onNodeClick={handleNodeClick}
        onNodeDragEnd={handleNodeDragEnd}
        onZoom={handleZoom}
        onCenterChange={handleCenterChange}
        backgroundColor="#ffffff"
        width={window.innerWidth * 0.5}
        height={window.innerHeight - 200}
        cooldownTicks={50}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        onEngineStop={() => {
          // Ensure nodes have positions after force simulation
          if (graphRef.current) {
            const nodes = graphData.nodes;
            nodes.forEach(node => {
              if (!node.x) node.x = 0;
              if (!node.y) node.y = 0;
            });
          }
        }}
        d3Force={(d3) => ({
          center: d3.forceCenter(),
          charge: d3.forceManyBody().strength(-100),
          collide: d3.forceCollide(30),
          link: d3.forceLink().id(d => d.id).distance(100),
          x: d3.forceX(0).strength(0.01),
          y: d3.forceY(0).strength(0.01)
        })}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-10 bg-white p-2 rounded-md shadow-md">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const currentZoom = graphRef.current?.zoom();
              graphRef.current?.zoom(currentZoom * 1.2);
            }}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            +
          </button>
          <button
            onClick={() => {
              const currentZoom = graphRef.current?.zoom();
              graphRef.current?.zoom(currentZoom * 0.8);
            }}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            -
          </button>
          <button
            onClick={() => {
              graphRef.current?.zoom(1.5); // Reset to closer zoom
              graphRef.current?.centerAt(0, 0);
            }}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-indigo-600 text-lg font-medium">Loading graph...</div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization; 