import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setCurrentQuestionIndex, 
  setUserAnswer, 
  calculateScore, 
  resetQuiz, 
  toggleQuizModal,
  setQuestions,
  setLoading,
  setError
} from '../../store/slices/quizSlice';
import nodeServiceFactory from '../../services/nodeServiceFactory';

const QuizModal = () => {
  const dispatch = useDispatch();
  const nodeService = nodeServiceFactory.getService();
  const { selectedNode } = useSelector((state) => state.node);
  const { 
    questions, 
    currentQuestionIndex, 
    userAnswers, 
    score, 
    isLoading, 
    isCompleted, 
    isQuizModalOpen
  } = useSelector((state) => state.quiz);

  // Fetch questions when the modal is opened
  useEffect(() => {
    const fetchQuestions = async () => {
      if (isQuizModalOpen && selectedNode && questions.length === 0) {
        try {
          dispatch(setLoading(true));
          const fetchedQuestions = await nodeService.getNodeQuiz(
            selectedNode.graphId,
            selectedNode.id,
            5 // Number of questions
          );
          dispatch(setQuestions(fetchedQuestions));
        } catch (error) {
          console.error('Error fetching quiz questions:', error);
          dispatch(setError('Failed to load quiz questions. Please try again.'));
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    fetchQuestions();
  }, [isQuizModalOpen, selectedNode, dispatch, nodeService, questions.length]);

  const handleAnswerSelect = (answer) => {
    if (isCompleted) return;
    
    dispatch(setUserAnswer({ 
      index: currentQuestionIndex, 
      answer 
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex + 1));
    } else {
      dispatch(calculateScore());
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex - 1));
    }
  };

  const handleRestartQuiz = () => {
    dispatch(resetQuiz());
  };

  const handleCloseModal = () => {
    dispatch(toggleQuizModal());
  };

  if (!isQuizModalOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {isCompleted ? 'Quiz Results' : 'Test Your Knowledge'}
            </h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full p-1"
              aria-label="Close modal"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-3"></div>
                <p className="text-gray-600">Loading quiz questions...</p>
              </div>
            ) : isCompleted ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-100 mb-4">
                    <span className="text-3xl font-bold text-indigo-600">
                      {score}/{questions.length}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {score === questions.length
                      ? 'Perfect Score! 🎉'
                      : score >= questions.length / 2
                      ? 'Good Job! 👍'
                      : 'Keep Learning! 📚'}
                  </h3>
                  <p className="text-gray-600">
                    {score === questions.length
                      ? "You've mastered this concept!"
                      : score >= questions.length / 2
                      ? "You're on the right track. Review the explanations to learn more."
                      : "Don't worry, review the explanations to deepen your understanding."}
                  </p>
                </div>

                <div className="mt-8 space-y-6">
                  <h4 className="text-lg font-medium text-gray-900 text-left">Question Review:</h4>
                  {questions.map((question, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border ${
                        userAnswers[index] === question.correct_answer
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-medium mb-2">
                          {index + 1}. {question.question}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          {Object.entries(question.options).map(([key, value]) => (
                            <div 
                              key={key}
                              className={`p-2 rounded text-sm ${
                                key === question.correct_answer
                                  ? 'bg-green-200 text-green-800'
                                  : userAnswers[index] === key
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <span className="font-medium">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                          <span className="font-medium">Explanation:</span> {question.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : questions.length > 0 ? (
              <div>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="text-sm font-medium text-indigo-600">
                      {userAnswers.filter(answer => answer !== null).length} answered
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {questions[currentQuestionIndex].question}
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(questions[currentQuestionIndex].options).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => handleAnswerSelect(key)}
                        className={`w-full text-left p-3 rounded-lg border ${
                          userAnswers[currentQuestionIndex] === key
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        <span className="font-medium mr-2">{key}.</span> {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No questions available for this node.</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          {!isLoading && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              {isCompleted ? (
                <div className="flex justify-center">
                  <button
                    onClick={handleRestartQuiz}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Restart Quiz
                  </button>
                </div>
              ) : questions.length > 0 ? (
                <div className="flex justify-between">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`inline-flex justify-center items-center px-4 py-2 border text-sm font-medium rounded-md ${
                      currentQuestionIndex === 0
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-indigo-500 text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={userAnswers[currentQuestionIndex] === null}
                    className={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                      userAnswers[currentQuestionIndex] === null
                        ? 'bg-indigo-400 text-white cursor-not-allowed'
                        : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish Quiz'}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuizModal; 