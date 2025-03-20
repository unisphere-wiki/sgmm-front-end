import api from './api';

export const documentService = {
  getDocuments: async () => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  uploadDocument: async (file, metadata, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await api.post('/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/document/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateDocumentMetadata: async (documentId, metadata) => {
    try {
      const response = await api.put(`/document/${documentId}`, metadata);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default documentService; 