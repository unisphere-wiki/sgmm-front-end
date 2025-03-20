import api from './api';

export const queryService = {
  /**
   * Submit a query to generate a knowledge graph
   * @param {string} query - The query text
   * @param {Object} contextParams - Context parameters for the query
   * @param {string} documentId - ID of the document to query against
   * @returns {Promise<Object>} - Query result with query_id and graph_id
   */
  submitQuery: async (query, contextParams, documentId) => {
    try {
      // Get user_id from localStorage or use default
      const userId = localStorage.getItem('user_id') || 'user123';
      
      // Format the request body according to the API documentation
      const requestBody = {
        query: query,
        user_id: userId,
        context_params: {
          document_id: documentId,
          company: {
            size: contextParams.companySize || '',
            maturity: contextParams.companyMaturity || 'startup',
            industry: contextParams.industry || ''
          },
          management_role: contextParams.managementRole || '',
          challenge_type: contextParams.challengeType || '',
          environment: {
            market_volatility: contextParams.marketVolatility || 'high',
            competitive_pressure: contextParams.competitivePressure || 'high',
            regulatory_environment: contextParams.regulatoryEnvironment || 'moderate'
          }
        }
      };

      const response = await api.post('/query', requestBody);
      
      // Save query and graph IDs to localStorage for history
      if (response.data.success) {
        const queryData = {
          queryId: response.data.query_id,
          graphId: response.data.graph_id,
          timestamp: new Date().toISOString()
        };
        
        // Get existing query history or initialize empty array
        const existingHistory = JSON.parse(localStorage.getItem('queryHistory') || '[]');
        existingHistory.push(queryData);
        
        // Save updated history back to localStorage
        localStorage.setItem('queryHistory', JSON.stringify(existingHistory));
      }
      
      return {
        ...response.data,
        queryId: response.data.query_id,
        graphId: response.data.graph_id
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get the status of a query
   * @param {string} queryId - ID of the query
   * @returns {Promise<Object>} - Query status and details
   */
  getQueryStatus: async (queryId) => {
    try {
      const response = await api.get(`/query/${queryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get graph data for visualization
   * @param {string} graphId - ID of the graph
   * @param {Object} options - Optional parameters (layer, connections)
   * @returns {Promise<Object>} - Graph data
   */
  getGraphData: async (graphId, options = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add layer parameter if provided (default to 4 as specified)
      if (options.layer !== undefined) {
        params.append('layer', options.layer);
      } else {
        params.append('layer', '4');  // Default to layer 4 as requested
      }
      
      // Add connections parameter (default to true as specified)
      if (options.connections !== undefined) {
        params.append('connections', options.connections.toString());
      } else {
        params.append('connections', 'true');  // Default to show connections
      }
      
      // Build the URL with query parameters
      const url = `/graph/${graphId}${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('Fetching graph data from:', url);
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching graph data:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Filter an existing graph with additional parameters
   * @param {string} graphId - ID of the graph
   * @param {Object} filterParams - Parameters to filter the graph
   * @returns {Promise<Object>} - Filtered graph data
   */
  filterGraph: async (graphId, filterParams) => {
    try {
      const response = await api.post(`/graph/${graphId}/filter`, {
        context_params: filterParams
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get detailed information about a specific node
   * @param {string} graphId - ID of the graph
   * @param {string} nodeId - ID of the node
   * @param {boolean} includeConnections - Whether to include connections
   * @returns {Promise<Object>} - Node details
   */
  getNodeDetails: async (graphId, nodeId, includeConnections = false) => {
    try {
      const params = new URLSearchParams();
      if (includeConnections) params.append('connections', 'true');
      
      const response = await api.get(
        `/node/${graphId}/${nodeId}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get the user's query history
   * @returns {Promise<Array>} - List of previous queries
   */
  getQueryHistory: async () => {
    try {
      const response = await api.get('/user/queries');
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