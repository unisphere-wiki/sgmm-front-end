import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setSelectedNode,
  setNodeDetails,
  setRelatedNodes,
  setExamples,
  setLoading,
} from '../../store/slices/nodeSlice';
import { toggleChat } from '../../store/slices/chatSlice';
import nodeServiceFactory from '../../services/nodeServiceFactory';

// Constants for caching
const CACHE_KEY_PREFIX = 'node_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const NodeDetailsPanel = () => {
  const dispatch = useDispatch();
  const nodeService = nodeServiceFactory.getService();
  const {
    selectedNode,
    nodeDetails,
    relatedNodes,
    examples,
    isLoading,
  } = useSelector((state) => state.node);
  const { isOpen: isChatOpen } = useSelector((state) => state.chat);

  const [activeTab, setActiveTab] = useState('details');
  const [randomExampleIndex, setRandomExampleIndex] = useState(0);

  // Generate a cache key for a node
  const getCacheKey = (graphId, nodeId) => `${CACHE_KEY_PREFIX}${graphId}_${nodeId}`;

  // Get cached data for a node if it exists and is not expired
  const getCachedNode = (graphId, nodeId) => {
    try {
      const cacheKey = getCacheKey(graphId, nodeId);
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) return null;
      
      const parsedData = JSON.parse(cachedData);
      
      // Check if cache has expired
      if (parsedData.timestamp && (Date.now() - parsedData.timestamp) < CACHE_EXPIRY) {
        console.log(`Loading cached data for node ${nodeId}`);
        return parsedData.data;
      } else {
        // Clean up expired cache
        localStorage.removeItem(cacheKey);
        return null;
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  };

  // Save node data to cache
  const cacheNodeData = (graphId, nodeId, data) => {
    try {
      const cacheKey = getCacheKey(graphId, nodeId);
      const cacheData = {
        timestamp: Date.now(),
        data: data
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`Cached data for node ${nodeId}`);
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  };

  // Reset to details tab when a new node is selected
  useEffect(() => {
    setActiveTab('details');
    // Generate a new random index for examples when node changes
    if (examples && examples.length > 0) {
      setRandomExampleIndex(Math.floor(Math.random() * examples.length));
    }
  }, [selectedNode?.id, examples]);

  useEffect(() => {
    const loadNodeData = async () => {
      if (selectedNode) {
        // Set loading state immediately when node changes
        dispatch(setLoading(true));
        
        try {
          // Try to get data from cache first
          const cachedData = getCachedNode(selectedNode.graphId, selectedNode.id);
          
          if (cachedData) {
            // Use cached data
            dispatch(setNodeDetails(cachedData.details));
            dispatch(setRelatedNodes(cachedData.related));
            dispatch(setExamples(cachedData.examples));
          } else {
            // Fetch fresh data from API
            const [details, related, examples] = await Promise.all([
              nodeService.getNodeDetails(selectedNode.graphId, selectedNode.id),
              nodeService.getRelatedNodes(selectedNode.graphId, selectedNode.id),
              nodeService.getExamples(selectedNode.graphId, selectedNode.id)
            ]);

            // Update Redux state
            dispatch(setNodeDetails(details));
            dispatch(setRelatedNodes(related));
            dispatch(setExamples(examples));
            
            // Cache the data for future use
            cacheNodeData(selectedNode.graphId, selectedNode.id, {
              details,
              related,
              examples
            });
          }
        } catch (error) {
          console.error('Error loading node data:', error);
        } finally {
          // Set loading state to false when done
          dispatch(setLoading(false));
        }
      }
    };

    if (selectedNode?.id) {
      loadNodeData();
    }
  }, [selectedNode, dispatch]);

  const handleSetActiveTab = (tab) => {
    if (!selectedNode) return;
    setActiveTab(tab);
    
    // If switching to examples tab, generate a new random example index
    if (tab === 'examples' && examples && examples.length > 0) {
      setRandomExampleIndex(Math.floor(Math.random() * examples.length));
    }
  };

  const handleRelatedNodeClick = (node) => {
    if (!node || !node.id) return;
    
    // Create a fresh copy of the node data to avoid extensibility issues
    const nodeData = {
      id: node.id,
      name: node.name || node.title,
      description: node.description,
      layer: node.layer,
      relevance: node.relevance,
      graphId: node.graphId || selectedNode.graphId, // Inherit graph ID if not present
      color: getLayerColor(node.layer)
    };
    
    dispatch(setSelectedNode(nodeData));
  };

  // Get color based on layer
  const getLayerColor = (layer) => {
    const colors = {
      0: '#4F46E5', // Indigo for layer 0
      1: '#059669', // Green for layer 1
      2: '#B45309', // Amber for layer 2
      3: '#DC2626'  // Red for layer 3
    };
    return colors[layer] || '#4F46E5';
  };

  if (!selectedNode) {
    return (
      <div className="bg-white shadow rounded-lg p-4 sm:p-6 h-full flex items-center justify-center">
        <p className="text-gray-500">Select a node to view details</p>
      </div>
    );
  }

  // Format path for breadcrumb (if available)
  const pathNodes = nodeDetails?.path || [];
  
  return (
    <div className="bg-white shadow rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate max-w-[90%]">
            {selectedNode.name || selectedNode.title}
          </h2>
        </div>
        {/* Layer indicator */}
        <div className="mt-1 text-xs text-gray-500 flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: selectedNode.color || getLayerColor(selectedNode.layer) }}
          ></div>
          Layer {selectedNode.layer}
        </div>
      </div>

      {/* Path / Breadcrumb (if exists) */}
      {!isLoading && pathNodes && pathNodes.length > 0 && (
        <div className="px-4 sm:px-6 py-2 border-b border-gray-100 bg-gray-50">
          <nav className="flex items-center overflow-x-auto scrollbar-hide text-xs">
            {pathNodes.map((path, index) => (
              <React.Fragment key={path.id}>
                {index > 0 && (
                  <svg className="mx-1 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <button 
                  className="text-gray-600 hover:text-indigo-600 whitespace-nowrap" 
                  onClick={() => handleRelatedNodeClick({
                    id: path.id,
                    title: path.title,
                    description: path.description,
                    layer: path.layer,
                    relevance: path.relevance,
                    graphId: selectedNode.graphId
                  })}
                >
                  {path.title}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <nav className="flex -mb-px">
          {['details', 'examples'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleSetActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm capitalize`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6 relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-3"></div>
              <div className="text-indigo-600 font-medium">Loading details...</div>
            </div>
          </div>
        )}

        {/* Content area - Only render content when not loading or when we explicitly want to */}
        {!isLoading ? (
          <>
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-white rounded-md">
                  <h3 className="text-lg font-medium text-gray-900">Description</h3>
                  <p className="mt-2 text-gray-600">{nodeDetails?.description}</p>
                </div>
                
                {/* Relevance */}
                <div className="bg-white rounded-md">
                  <h3 className="text-lg font-medium text-gray-900">Relevance</h3>
                  <div className="mt-2">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-100">
                            {nodeDetails?.relevance}/10
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
                        <div
                          style={{ width: `${(nodeDetails?.relevance / 10) * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Nodes / Connections */}
                {relatedNodes && relatedNodes.length > 0 && (
                  <div className="bg-white rounded-md">
                    <h3 className="text-lg font-medium text-gray-900">Connected Concepts</h3>
                    <div className="mt-3 grid gap-3">
                      {relatedNodes.map((node) => (
                        <div
                          key={node.id}
                          className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer border border-gray-200 transition-all"
                          onClick={() => handleRelatedNodeClick(node)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900 flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                                style={{ backgroundColor: getLayerColor(node.layer) }}
                              ></div>
                              {node.name}
                            </div>
                            <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-100">
                              Relevance: {node.relevance}/10
                            </div>
                          </div>
                          {node.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {node.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Examples Tab */}
            {activeTab === 'examples' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Real-World Example</h3>
                <div>
                  {examples.length > 0 ? (
                    (() => {
                      // Use the stored random index
                      const example = examples[randomExampleIndex];
                      
                      return (
                        <div className="p-5 bg-gray-50 rounded-md border border-gray-200">
                          <h4 className="font-medium text-gray-900 text-lg">{example.title}</h4>
                          <p className="mt-3 text-gray-600">{example.description}</p>
                          {example.learnings && (
                            <div className="mt-3">
                              <h5 className="text-sm font-medium text-gray-900">
                                Key Learnings:
                              </h5>
                              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                                {example.learnings.map((learning, i) => (
                                  <li key={i}>{learning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-md text-center">
                      <p className="text-gray-500">No examples available for this concept</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Chat Button - Fixed at bottom */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => dispatch(toggleChat())}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          Chat with Node
        </button>
      </div>
    </div>
  );
};

export default NodeDetailsPanel; 