import api from './api';

export const contextTemplateService = {
  /**
   * Get list of predefined context templates
   * @returns {Promise<Array>} - List of context templates
   */
  getContextTemplates: async () => {
    try {
      const response = await api.get('/context-templates');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get a specific context template by ID
   * @param {string} templateId - ID of the template
   * @returns {Promise<Object>} - Template details
   */
  getContextTemplate: async (templateId) => {
    try {
      const response = await api.get(`/context-template/${templateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new context template
   * @param {string} name - Template name
   * @param {string} description - Template description
   * @param {Object} parameters - Template parameters
   * @returns {Promise<Object>} - Created template
   */
  createContextTemplate: async (name, description, parameters) => {
    try {
      const response = await api.post('/context-template', {
        name,
        description,
        parameters
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update an existing context template
   * @param {string} templateId - ID of the template
   * @param {Object} updateData - Data to update (name, description, parameters)
   * @returns {Promise<Object>} - Updated template
   */
  updateContextTemplate: async (templateId, updateData) => {
    try {
      const response = await api.put(`/context-template/${templateId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a context template
   * @param {string} templateId - ID of the template to delete
   * @returns {Promise<Object>} - Deletion result
   */
  deleteContextTemplate: async (templateId) => {
    try {
      const response = await api.delete(`/context-template/${templateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default contextTemplateService; 