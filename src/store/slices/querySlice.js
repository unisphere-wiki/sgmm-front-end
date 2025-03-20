import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentQuery: '',
  contextParams: {
    companySize: 'small',
    companyMaturity: 'startup',
    industry: 'technology',
    managementRole: 'founder',
    challengeType: 'growth',
    marketVolatility: 'high',
    competitivePressure: 'high',
    regulatoryEnvironment: 'moderate',
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
      // Check if this item already exists in history to prevent duplicates
      const existingIndex = state.queryHistory.findIndex(
        item => item.queryId === action.payload.queryId
      );
      
      if (existingIndex >= 0) {
        // Update existing item
        state.queryHistory[existingIndex] = {
          ...state.queryHistory[existingIndex],
          ...action.payload
        };
      } else {
        // Add new item at the beginning
        state.queryHistory.unshift(action.payload);
      }
    },
    addHistoryBulk: (state, action) => {
      // Sort history items by timestamp (most recent first)
      const sortedHistory = [...action.payload].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      // Replace current history with the provided items
      state.queryHistory = sortedHistory;
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
  addHistoryBulk,
  setLoading,
  setError,
  clearQuery,
} = querySlice.actions;

export default querySlice.reducer; 