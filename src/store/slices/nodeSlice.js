import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedNode: null,
  nodeDetails: null,
  relatedNodes: [],
  sourceCitations: [],
  examples: [],
  isLoading: false,
  error: null,
};

const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    setSelectedNode: (state, action) => {
      state.selectedNode = action.payload;
    },
    setNodeDetails: (state, action) => {
      state.nodeDetails = action.payload;
    },
    setRelatedNodes: (state, action) => {
      state.relatedNodes = action.payload;
    },
    setSourceCitations: (state, action) => {
      state.sourceCitations = action.payload;
    },
    setExamples: (state, action) => {
      state.examples = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearNode: (state) => {
      state.selectedNode = null;
      state.nodeDetails = null;
      state.relatedNodes = [];
      state.sourceCitations = [];
      state.examples = [];
      state.error = null;
    },
  },
});

export const {
  setSelectedNode,
  setNodeDetails,
  setRelatedNodes,
  setSourceCitations,
  setExamples,
  setLoading,
  setError,
  clearNode,
} = nodeSlice.actions;

export default nodeSlice.reducer; 