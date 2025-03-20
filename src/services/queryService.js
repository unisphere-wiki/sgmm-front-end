import api from './api';

export const queryService = {
  submitQuery: async (query, contextParams, documentId) => {
    try {
      const response = await api.post('/query', {
        query,
        contextParams,
        documentId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getQueryHistory: async () => {
    try {
      const response = await api.get('/user/queries');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getGraphData: async (graphId) => {
    try {
      const response = await api.get(`/graph/${graphId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getConnections: async (graphId) => {
    try {
      const response = await api.get(`/connections/${graphId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default queryService; 