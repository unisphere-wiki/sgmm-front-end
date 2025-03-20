import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nodes: [],
  links: [],
  selectedNodes: [],
  currentLayer: 0,
  showConnections: true,
  zoom: 1,
  center: { x: 0, y: 0 },
  isLoading: false,
  error: null,
};

const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    setGraphData: (state, action) => {
      state.nodes = action.payload.nodes;
      state.links = action.payload.links;
    },
    setSelectedNodes: (state, action) => {
      state.selectedNodes = action.payload;
    },
    setCurrentLayer: (state, action) => {
      state.currentLayer = action.payload;
    },
    toggleConnections: (state) => {
      state.showConnections = !state.showConnections;
    },
    setZoom: (state, action) => {
      state.zoom = action.payload;
    },
    setCenter: (state, action) => {
      state.center = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearGraph: (state) => {
      state.nodes = [];
      state.links = [];
      state.selectedNodes = [];
      state.currentLayer = 0;
      state.showConnections = true;
      state.zoom = 1;
      state.center = { x: 0, y: 0 };
      state.error = null;
    },
  },
});

export const {
  setGraphData,
  setSelectedNodes,
  setCurrentLayer,
  toggleConnections,
  setZoom,
  setCenter,
  setLoading,
  setError,
  clearGraph,
} = graphSlice.actions;

export default graphSlice.reducer; 