import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: [],
  score: 0,
  isLoading: false,
  isCompleted: false,
  isQuizModalOpen: false,
  error: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload;
      state.userAnswers = new Array(action.payload.length).fill(null);
      state.currentQuestionIndex = 0;
      state.score = 0;
      state.isCompleted = false;
    },
    setCurrentQuestionIndex: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    setUserAnswer: (state, action) => {
      const { index, answer } = action.payload;
      state.userAnswers[index] = answer;
    },
    calculateScore: (state) => {
      let correctCount = 0;
      
      state.userAnswers.forEach((answer, index) => {
        if (index < state.questions.length && answer === state.questions[index].correct_answer) {
          correctCount++;
        }
      });
      
      state.score = correctCount;
      state.isCompleted = true;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetQuiz: (state) => {
      state.currentQuestionIndex = 0;
      state.userAnswers = new Array(state.questions.length).fill(null);
      state.score = 0;
      state.isCompleted = false;
      state.error = null;
    },
    toggleQuizModal: (state) => {
      state.isQuizModalOpen = !state.isQuizModalOpen;
    },
    clearQuiz: () => initialState,
  },
});

export const {
  setQuestions,
  setCurrentQuestionIndex,
  setUserAnswer,
  calculateScore,
  setLoading,
  setError,
  resetQuiz,
  toggleQuizModal,
  clearQuiz,
} = quizSlice.actions;

export default quizSlice.reducer; 