import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentQuery: '',
  contextParams: {
    companySize: '',
    industry: '',
    managementRole: '',
    marketVolatility: '',
    competition: '',
    challengeType: '',
  },
  selectedDocument: null,
  queryHistory: [],
  isLoading: false,
  error: null,
};

const querySlice = createSlice({
  name: 'query',
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.currentQuery = action.payload;
    },
    setContextParams: (state, action) => {
      state.contextParams = { ...state.contextParams, ...action.payload };
    },
    setSelectedDocument: (state, action) => {
      state.selectedDocument = action.payload;
    },
    addToHistory: (state, action) => {
      state.queryHistory.unshift(action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearQuery: (state) => {
      state.currentQuery = '';
      state.contextParams = initialState.contextParams;
      state.selectedDocument = null;
      state.error = null;
    },
  },
});

export const {
  setQuery,
  setContextParams,
  setSelectedDocument,
  addToHistory,
  setLoading,
  setError,
  clearQuery,
} = querySlice.actions;

export default querySlice.reducer; 