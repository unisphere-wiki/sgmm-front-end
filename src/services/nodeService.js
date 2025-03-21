import api from './api';

export const nodeService = {
  // Cache for node data to prevent redundant API calls
  _nodeCache: {},

  // Function to fetch node data from API or cache
  _fetchNodeData: async (graphId, nodeId) => {
    const cacheKey = `${graphId}_${nodeId}`;
    
    // Check if we have a cached response less than 30 seconds old
    if (nodeService._nodeCache[cacheKey] && 
        (Date.now() - nodeService._nodeCache[cacheKey].timestamp < 30000)) {
      console.log('Using cached node data for', nodeId);
      return nodeService._nodeCache[cacheKey].data;
    }
    
    // Fetch fresh data from API
    console.log('Fetching fresh node data for', nodeId);
    const response = await api.get(`/node/${graphId}/${nodeId}?connections=true`);
    const data = response.data;
    
    // Cache the response with a timestamp
    nodeService._nodeCache[cacheKey] = {
      timestamp: Date.now(),
      data: data
    };
    
    return data;
  },

  // Get node details
  getNodeDetails: async (graphId, nodeId) => {
    try {
      const data = await nodeService._fetchNodeData(graphId, nodeId);
      
      // Return structured data from the response
      return {
        id: data.node.id,
        title: data.node.title,
        description: data.node.description,
        layer: data.node.layer,
        relevance: data.node.relevance,
        children: data.node.children || [],
        path: data.path || []
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get related nodes
  getRelatedNodes: async (graphId, nodeId) => {
    try {
      const data = await nodeService._fetchNodeData(graphId, nodeId);
      
      // Format the children as related nodes
      const relatedNodes = (data.node.children || []).map(child => ({
        id: child.id,
        name: child.title,
        description: child.description, 
        layer: child.layer,
        relevance: child.relevance,
        graphId: graphId,
        connectionStrength: child.relevance || 5 // Use relevance as connection strength
      }));
      
      return relatedNodes;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Since citations aren't part of the new API, return empty array
  getSourceCitations: async (graphId, nodeId) => {
    return [];
  },

  // Get examples
  getExamples: async (graphId, nodeId) => {
    try {
      const data = await nodeService._fetchNodeData(graphId, nodeId);
      
      // Return the examples directly
      return data.examples || [];
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send chat message
  sendChatMessage: async (graphId, nodeId, message, chatHistory) => {
    try {
      // Format chat history for the API
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Get current selected document and query from Redux store
      const store = require('../store').default;
      const state = store.getState();
      const selectedDocument = state.query.selectedDocument || { id: '' };
      const currentQuery = state.query.currentQuery || '';
      const queryHistory = state.query.queryHistory || [];
      
      // Get query_id from the most recent history item
      const queryId = queryHistory.length > 0 ? queryHistory[0].queryId : '';

      // Prepare the payload exactly as expected by the backend
      const payload = {
        chat_history: formattedHistory,
        document_id: selectedDocument.id,
        graph_id: graphId,
        node_id: nodeId,
        query: message,
        query_id: queryId
      };

      const response = await api.post(`/node-chat`, payload);
      
      // Process the response according to the expected format
      return {
        message: response.data.response || 'No response from the assistant.',
        suggestedQuestions: response.data.suggested_questions || [],
        examples: response.data.examples || [],
        relatedNodes: response.data.related_nodes || []
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Get quiz questions for a node
  getNodeQuiz: async (graphId, nodeId, numQuestions = 5) => {
    try {
      // Get current selected document and query from Redux store
      const store = require('../store').default;
      const state = store.getState();
      const selectedDocument = state.query.selectedDocument || { id: '' };
      const queryHistory = state.query.queryHistory || [];
      
      // Get query_id from the most recent history item
      const queryId = queryHistory.length > 0 ? queryHistory[0].queryId : '';
      
      // Prepare the payload
      const payload = {
        document_id: selectedDocument.id,
        graph_id: graphId,
        node_id: nodeId,
        num_questions: numQuestions,
        query_id: queryId
      };
      
      const response = await api.post(`/node-quiz`, payload);
      return response.data.questions || [];
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default nodeService; 