import api from './api';

export const nodeService = {
  getNodeDetails: async (graphId, nodeId) => {
    try {
      const response = await api.get(`/node/${graphId}/${nodeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRelatedNodes: async (graphId, nodeId) => {
    try {
      const response = await api.get(`/node/${graphId}/${nodeId}/related`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getSourceCitations: async (graphId, nodeId) => {
    try {
      const response = await api.get(`/node/${graphId}/${nodeId}/citations`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getExamples: async (graphId, nodeId) => {
    try {
      const response = await api.get(`/node/${graphId}/${nodeId}/examples`);
      return response.data;
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