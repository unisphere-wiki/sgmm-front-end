import api from './api';

export const nodeService = {
  getNodeDetails: async (graphId, nodeId) => {
    try {
      const response = await api.get(`/node/${graphId}/${nodeId}?connections=true`);
      const data = response.data;
      
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

  getRelatedNodes: async (graphId, nodeId) => {
    try {
      const response = await api.get(`/node/${graphId}/${nodeId}?connections=true`);
      const data = response.data;
      
      const relatedNodes = (data.node.children || []).map(child => ({
        id: child.id,
        name: child.title,
        description: child.description, 
        layer: child.layer,
        relevance: child.relevance,
        graphId: graphId,
        connectionStrength: child.relevance || 5
      }));
      
      return relatedNodes;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getSourceCitations: async (graphId, nodeId) => {
    return [];
  },

  getExamples: async (graphId, nodeId) => {
    try {
      const response = await api.get(`/node/${graphId}/${nodeId}?connections=true`);
      const data = response.data;
      
      return data.examples || [];
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  sendChatMessage: async (graphId, nodeId, message, chatHistory) => {
    try {
      const response = await api.post(`/node-chat`, {
        graphId,
        nodeId,
        message,
        chatHistory,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getSuggestedQuestions: async (graphId, nodeId) => {
    try {
      const response = await api.get(`/node/${graphId}/${nodeId}/suggested-questions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default nodeService; 