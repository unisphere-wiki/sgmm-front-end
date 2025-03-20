import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  documents: [],
  selectedDocument: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,
};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setDocuments: (state, action) => {
      state.documents = action.payload;
    },
    setSelectedDocument: (state, action) => {
      state.selectedDocument = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearDocuments: (state) => {
      state.documents = [];
      state.selectedDocument = null;
      state.error = null;
      state.uploadProgress = 0;
    },
  },
});

export const {
  setDocuments,
  setSelectedDocument,
  setLoading,
  setError,
  setUploadProgress,
  clearDocuments,
} = documentSlice.actions;

export default documentSlice.reducer; 