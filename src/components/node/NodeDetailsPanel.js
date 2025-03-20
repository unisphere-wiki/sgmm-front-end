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

    loadNodeData();
  }, [selectedNode, dispatch]);

  if (!selectedNode) {
    return (
      <div className="bg-white shadow rounded-lg p-6 h-full flex items-center justify-center">
        <p className="text-gray-500">Select a node to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedNode.name}
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {['details', 'connections', 'citations', 'examples'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm capitalize`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
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
                  {relatedNodes.map((node) => (
                    <div
                      key={node.id}
                      className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                      onClick={() => dispatch(setSelectedNode(node))}
                    >
                      <div className="font-medium text-gray-900">{node.name}</div>
                      <div className="text-sm text-gray-500">
                        Connection strength: {node.connectionStrength}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Citations Tab */}
            {activeTab === 'citations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Source Citations</h3>
                <div className="space-y-4">
                  {sourceCitations.map((citation, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-md">
                      <blockquote className="text-gray-600 italic">
                        "{citation.text}"
                      </blockquote>
                      <div className="mt-2 text-sm text-gray-500">
                        Source: {citation.source}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Examples Tab */}
            {activeTab === 'examples' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Examples</h3>
                <div className="space-y-4">
                  {examples.map((example, index) => (
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
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Chat Button */}
      <div className="px-6 py-4 border-t border-gray-200">
        <button
          onClick={() => dispatch(toggleChat())}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Chat
        </button>
      </div>
    </div>
  );
};

export default NodeDetailsPanel; 