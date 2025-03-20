import api from './api';

export const documentService = {
  /**
   * Get list of all documents available for querying
   * @returns {Promise<Array>} - List of documents
   */
  getDocuments: async () => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get a specific document by ID
   * @param {string} documentId - ID of the document
   * @returns {Promise<Object>} - Document details
   */
  getDocument: async (documentId) => {
    try {
      const response = await api.get(`/document/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Upload a new document for processing
   * @param {File} file - The document file to upload
   * @param {string} title - Optional title for the document
   * @param {Object} metadata - Optional metadata for the document
   * @param {Function} onProgress - Optional callback for upload progress
   * @returns {Promise<Object>} - Upload result with document_id
   */
  uploadDocument: async (file, title = '', metadata = {}, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (title) {
        formData.append('title', title);
      }
      
      if (Object.keys(metadata).length > 0) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const requestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      };

      if (onProgress) {
        requestConfig.onUploadProgress = (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        };
      }

      const response = await api.post('/document', formData, requestConfig);
      return {
        ...response.data,
        documentId: response.data.document_id // Map to our frontend expected property
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a document
   * @param {string} documentId - ID of the document to delete
   * @returns {Promise<Object>} - Deletion result
   */
  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/document/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update a document's metadata
   * @param {string} documentId - ID of the document
   * @param {Object} metadata - New metadata for the document
   * @returns {Promise<Object>} - Update result
   */
  updateDocumentMetadata: async (documentId, metadata) => {
    try {
      const response = await api.put(`/document/${documentId}`, { metadata });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default documentService; 