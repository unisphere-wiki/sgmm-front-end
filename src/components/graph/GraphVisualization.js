import React, { useEffect, useRef, useMemo, useState } from 'react';
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
  const containerRef = useRef(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
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

  // Define colors for each layer that match the node colors in the graph
  const layerColors = {
    0: '#4F46E5', // Indigo for layer 0
    1: '#059669', // Green for layer 1
    2: '#B45309', // Amber for layer 2
    3: '#DC2626'  // Red for layer 3
  };

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
        // Create a new object with only essential properties
        const x = node.x || Math.random() * 800 - 400;
        const y = node.y || Math.random() * 800 - 400;
        
        // Create a fresh object to avoid extensibility issues
        return Object.create(Object.prototype, {
          id: { value: String(node.id), writable: true, enumerable: true, configurable: true },
          name: { value: String(node.name || node.title), writable: true, enumerable: true, configurable: true },
          description: { value: node.description, writable: true, enumerable: true, configurable: true },
          layer: { value: node.layer, writable: true, enumerable: true, configurable: true },
          relevance: { value: node.relevance, writable: true, enumerable: true, configurable: true },
          val: { value: Number(node.relevance || 5), writable: true, enumerable: true, configurable: true },
          color: { value: layerColors[node.layer] || '#4F46E5', writable: true, enumerable: true, configurable: true },
          x: { value: x, writable: true, enumerable: true, configurable: true },
          y: { value: y, writable: true, enumerable: true, configurable: true },
          fx: { value: null, writable: true, enumerable: true, configurable: true },
          fy: { value: null, writable: true, enumerable: true, configurable: true },
          // Additional properties needed
          graphId: { value: node.graphId, writable: true, enumerable: true, configurable: true },
          group: { value: node.group || node.layer, writable: true, enumerable: true, configurable: true }
        });
      });

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
            value: Number(link.value || 1),
            color: link.color || '#CBD5E0'
          }))
      : [];

    return {
      nodes: filteredNodes,
      links: filteredLinks
    };
  }, [nodes, links, currentLayer, showConnections]);

  // Update dimensions based on container size
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: width || 500, 
          height: height || 500 
        });
      }
    };

    // Initial update
    updateDimensions();

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    // Also listen for window resize as a fallback
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Create animation state for pulsing effect
  const [pulseScale, setPulseScale] = useState(1);
  
  // Pulse animation effect for selected nodes
  useEffect(() => {
    let animationFrameId;
    let scale = 1;
    let increasing = true;
    
    const animate = () => {
      if (increasing) {
        scale += 0.015;
        if (scale >= 1.2) increasing = false;
      } else {
        scale -= 0.015;
        if (scale <= 1) increasing = true;
      }
      
      setPulseScale(scale);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    if (selectedNodes && selectedNodes.length > 0) {
      animate();
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [selectedNodes]);

  // Handle node click
  const handleNodeClick = (node) => {
    if (!node) return;
    
    console.log('Node clicked:', node);
    // Clone the node to ensure it's extensible
    const nodeData = {
      id: node.id,
      name: node.name,
      description: node.description,
      layer: node.layer,
      relevance: node.relevance,
      graphId: node.graphId,
      color: node.color
    };
    
    dispatch(setSelectedNodes([nodeData]));
    dispatch(setSelectedNode(nodeData));
  };

  // Handle node drag start
  const handleNodeDragStart = (node) => {
    if (!node) return;
    // Store a reference to the dragged node
    setDraggedNode({
      id: node.id,
      startX: node.x,
      startY: node.y
    });
  };

  // Handle node hover
  const handleNodeHover = (node) => {
    document.body.style.cursor = node ? 'pointer' : 'default';
  };

  // Handle node drag end
  const handleNodeDragEnd = (node) => {
    if (!node || !draggedNode || draggedNode.id !== node.id) return;
    
    const updatedNodes = nodes.map(n => 
      n.id === node.id ? { ...n, x: node.x, y: node.y } : n
    );
    
    dispatch(setGraphData({ nodes: updatedNodes, links }));
    setDraggedNode(null);
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

  // Set up the graph when component mounts
  useEffect(() => {
    if (graphRef.current) {
      // Initial zoom
      graphRef.current.zoom(1.5); // Set a closer initial zoom
      graphRef.current.centerAt(0, 0);
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full flex-grow"
      style={{ minHeight: '400px' }}
    >
      {/* Layer Controls */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 bg-white p-1 sm:p-2 rounded shadow-sm">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {/* Only show layer buttons for layers that have nodes */}
          {[0, 1, 2, 3].filter(layer => 
            // Check if there are any nodes for this layer
            nodes.some(node => node.layer === layer)
          ).map((layer) => {
            // Generate dynamic ring color classes based on layer
            const ringColorClasses = {
              0: 'ring-indigo-600',
              1: 'ring-emerald-600',
              2: 'ring-amber-600',
              3: 'ring-red-600'
            };
            
            return (
              <button
                key={layer}
                onClick={() => handleLayerChange(layer)}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium flex items-center ${
                  currentLayer === layer
                    ? `bg-gray-200 text-gray-900 ring-2 ring-offset-1 ${ringColorClasses[layer]}`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div 
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-1 sm:mr-2 flex-shrink-0"
                  style={{ backgroundColor: layerColors[layer] }}
                ></div>
                <span>L{layer}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Connection Toggle */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
        <button
          onClick={handleToggleConnections}
          className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium ${
            showConnections
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showConnections ? 'Hide Connections' : 'Show Connections'}
        </button>
      </div>

      {/* Graph Visualization */}
      <div className="flex-grow relative flex items-center justify-center h-full">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="text-indigo-600 text-lg font-medium">Loading graph...</div>
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">No graph data available</div>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel="name"
            nodeRelSize={8}
            linkWidth={1}
            linkColor="#CBD5E0"
            linkOpacity={0.6}
            linkDirectionalParticles={1}
            linkDirectionalParticleSpeed={0.002}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor="#CBD5E0"
            onNodeClick={handleNodeClick}
            onNodeDragStart={handleNodeDragStart}
            onNodeDrag={node => { /* No-op to avoid extensibility error */ }}
            onNodeDragEnd={handleNodeDragEnd}
            onZoom={handleZoom}
            onCenterChange={handleCenterChange}
            onNodeHover={handleNodeHover}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              
              // Check if this node is the selected node
              const isSelected = selectedNodes && 
                selectedNodes.length > 0 && 
                selectedNodes[0].id === node.id;
              
              // Calculate node size - make selected node bigger
              const baseSize = 5;
              const nodeSize = isSelected ? baseSize * 1.5 : baseSize;
              
              // Draw node glow effect for selected node
              if (isSelected) {
                // Outer glow with pulsing effect
                const glowSize = nodeSize + 3 * pulseScale;
                
                // Draw outer glow circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, glowSize, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(255, 255, 204, 0.6)'; // Light yellow glow
                ctx.fill();
                
                // Draw mid glow circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeSize + 2, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fill();
                
                // Draw border
                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeSize + 2, 0, 2 * Math.PI);
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
              
              // Draw main node circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
              ctx.fillStyle = node.color || layerColors[node.layer] || '#4F46E5';
              ctx.fill();
              
              // Add text label - position it slightly lower for selected nodes
              const labelYOffset = isSelected ? nodeSize + 8 : nodeSize + 5;
              ctx.fillStyle = '#000000';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(label, node.x, node.y + labelYOffset);
            }}
            backgroundColor="#ffffff"
            width={dimensions.width}
            height={dimensions.height}
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
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-10 bg-white p-2 rounded shadow-sm flex space-x-1">
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
  );
};

export default GraphVisualization; 