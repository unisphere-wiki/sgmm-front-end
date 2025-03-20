import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, setSuggestedQuestions, toggleChat } from '../../store/slices/chatSlice';
import nodeServiceFactory from '../../services/nodeServiceFactory';

const NodeChat = () => {
  const dispatch = useDispatch();
  const nodeService = nodeServiceFactory.getService();
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const { selectedNode } = useSelector((state) => state.node);
  const { messages, suggestedQuestions, isLoading, isOpen } = useSelector((state) => state.chat);
  const [inputMessage, setInputMessage] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedNode) {
      // Load suggested questions when a node is selected
      loadSuggestedQuestions();
    }
  }, [selectedNode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target) && isOpen) {
        dispatch(toggleChat());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch, isOpen]);

  const loadSuggestedQuestions = async () => {
    try {
      const questions = await nodeService.getSuggestedQuestions(
        selectedNode.graphId,
        selectedNode.id
      );
      dispatch(setSuggestedQuestions(questions));
    } catch (error) {
      console.error('Error loading suggested questions:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessage(userMessage));
    setInputMessage('');

    try {
      const response = await nodeService.sendChatMessage(
        selectedNode.graphId,
        selectedNode.id,
        inputMessage,
        messages
      );

      const aiMessage = {
        type: 'ai',
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      dispatch(addMessage(aiMessage));
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch( 
        addMessage({
          type: 'error',
          content: 'Sorry, there was an error processing your message.',
          timestamp: new Date().toISOString(),
        })
      );
    }
  };

  const handleSuggestedQuestionClick = (question) => {
    setInputMessage(question);
  };

  const handleClose = () => {
    dispatch(toggleChat());
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Chat Panel */}
      <div ref={chatRef} className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg flex flex-col z-50">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 truncate max-w-[75%]">
              Chat with {selectedNode?.name}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Close chat"
            >
              <svg
                className="h-6 w-6"
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
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : message.type === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Suggested Questions
            </h4>
            <div className="space-y-1">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestionClick(question)}
                  className="block w-full text-left px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about this concept..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isLoading || !inputMessage.trim()
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NodeChat; 