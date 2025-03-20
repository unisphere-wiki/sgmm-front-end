import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setSelectedNode,
  setNodeDetails,
  setRelatedNodes,
  setSourceCitations,
  setExamples,
} from '../../store/slices/nodeSlice';
import { toggleChat } from '../../store/slices/chatSlice';
import nodeServiceFactory from '../../services/nodeServiceFactory';

const NodeDetailsPanel = () => {
  const dispatch = useDispatch();
  const nodeService = nodeServiceFactory.getService();
  const {
    selectedNode,
    nodeDetails,
    relatedNodes,
    sourceCitations,
    examples,
    isLoading,
  } = useSelector((state) => state.node);
  const { isOpen: isChatOpen } = useSelector((state) => state.chat);

  const [activeTab, setActiveTab] = useState('details');

  // Reset to details tab when a new node is selected
  useEffect(() => {
    setActiveTab('details');
  }, [selectedNode?.id]);

  useEffect(() => {
    const loadNodeData = async () => {
      if (selectedNode) {
        try {
          const [details, related, citations, examples] = await Promise.all([
            nodeService.getNodeDetails(selectedNode.graphId, selectedNode.id),
            nodeService.getRelatedNodes(selectedNode.graphId, selectedNode.id),
            nodeService.getSourceCitations(selectedNode.graphId, selectedNode.id),
            nodeService.getExamples(selectedNode.graphId, selectedNode.id)
          ]);

          dispatch(setNodeDetails(details));
          dispatch(setRelatedNodes(related));
          dispatch(setSourceCitations(citations));
          dispatch(setExamples(examples));
        } catch (error) {
          console.error('Error loading node data:', error);
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
  };

  const handleRelatedNodeClick = (node) => {
    if (!node || !node.id) return;
    
    // Create a fresh copy of the node data to avoid extensibility issues
    const nodeData = {
      id: node.id,
      name: node.name,
      description: node.description,
      layer: node.layer,
      relevance: node.relevance,
      graphId: node.graphId || selectedNode.graphId, // Inherit graph ID if not present
      color: node.color
    };
    
    dispatch(setSelectedNode(nodeData));
  };

  if (!selectedNode) {
    return (
      <div className="bg-white shadow rounded-lg p-4 sm:p-6 h-full flex items-center justify-center">
        <p className="text-gray-500">Select a node to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate max-w-[80%]">
            {selectedNode.name}
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <nav className="flex -mb-px">
          {['details', 'connections', 'citations', 'examples'].map((tab) => (
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
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-indigo-600">Loading...</div>
          </div>
        ) : (
          <>
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Description</h3>
                  <p className="mt-2 text-gray-600">{nodeDetails?.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Relevance</h3>
                  <div className="mt-2">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                            {nodeDetails?.relevance}/10
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                        <div
                          style={{ width: `${(nodeDetails?.relevance / 10) * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Related Nodes</h3>
                <div className="space-y-2">
                  {relatedNodes.length > 0 ? (
                    relatedNodes.map((node) => (
                      <div
                        key={node.id}
                        className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleRelatedNodeClick(node)}
                      >
                        <div className="font-medium text-gray-900">{node.name}</div>
                        <div className="text-sm text-gray-500">
                          Connection strength: {node.connectionStrength}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No related nodes found</p>
                  )}
                </div>
              </div>
            )}

            {/* Citations Tab */}
            {activeTab === 'citations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Source Citations</h3>
                <div className="space-y-4">
                  {sourceCitations.length > 0 ? (
                    sourceCitations.map((citation, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-md">
                        <blockquote className="text-gray-600 italic">
                          "{citation.text}"
                        </blockquote>
                        <div className="mt-2 text-sm text-gray-500">
                          Source: {citation.source}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No citations available</p>
                  )}
                </div>
              </div>
            )}

            {/* Examples Tab */}
            {activeTab === 'examples' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Examples</h3>
                <div className="space-y-4">
                  {examples.length > 0 ? (
                    examples.map((example, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-gray-900">{example.title}</h4>
                        <p className="mt-2 text-gray-600">{example.description}</p>
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
                    ))
                  ) : (
                    <p className="text-gray-500">No examples available</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
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