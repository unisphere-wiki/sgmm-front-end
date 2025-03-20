import { configureStore } from '@reduxjs/toolkit';
import queryReducer from './slices/querySlice';
import graphReducer from './slices/graphSlice';
import nodeReducer from './slices/nodeSlice';
import documentReducer from './slices/documentSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    query: queryReducer,
    graph: graphReducer,
    node: nodeReducer,
    document: documentReducer,
    chat: chatReducer,
  },
});

export default store; 