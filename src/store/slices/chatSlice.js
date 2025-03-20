import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('chatState');
    if (serializedState === null) {
      return {
        isOpen: false,
        messages: [],
        suggestedQuestions: [],
        isLoading: false,
        error: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading chat state:', err);
    return {
      isOpen: false,
      messages: [],
      suggestedQuestions: [],
      isLoading: false,
      error: null,
    };
  }
};

const initialState = loadState();

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
      // Save to localStorage
      try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('chatState', serializedState);
      } catch (err) {
        console.error('Error saving chat state:', err);
      }
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // Save to localStorage
      try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('chatState', serializedState);
      } catch (err) {
        console.error('Error saving chat state:', err);
      }
    },
    setSuggestedQuestions: (state, action) => {
      state.suggestedQuestions = action.payload;
      // Save to localStorage
      try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('chatState', serializedState);
      } catch (err) {
        console.error('Error saving chat state:', err);
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
      // Save to localStorage
      try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('chatState', serializedState);
      } catch (err) {
        console.error('Error saving chat state:', err);
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      // Save to localStorage
      try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('chatState', serializedState);
      } catch (err) {
        console.error('Error saving chat state:', err);
      }
    },
    clearChat: (state) => {
      state.messages = [];
      state.suggestedQuestions = [];
      state.error = null;
      // Save to localStorage
      try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('chatState', serializedState);
      } catch (err) {
        console.error('Error saving chat state:', err);
      }
    },
  },
});

export const {
  toggleChat,
  addMessage,
  setSuggestedQuestions,
  setLoading,
  setError,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer; 