import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, setSuggestedQuestions, toggleChat, setLoading } from '../../store/slices/chatSlice';
import nodeServiceFactory from '../../services/nodeServiceFactory';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

  // Default suggested questions for when chat is first opened
  useEffect(() => {
    if (selectedNode && isOpen && messages.length === 0 && suggestedQuestions.length === 0) {
      // Set some default suggested questions when the chat is first opened
      dispatch(setSuggestedQuestions([
        `What is ${selectedNode.name || selectedNode.title}?`,
        `How does ${selectedNode.name || selectedNode.title} work?`,
        `Why is ${selectedNode.name || selectedNode.title} important?`
      ]));
    }
  }, [selectedNode, isOpen, dispatch, messages.length, suggestedQuestions.length]);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessage(userMessage));
    setInputMessage('');
    dispatch(setLoading(true));

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
      
      // Update suggested questions from the chat response
      if (response.suggestedQuestions && response.suggestedQuestions.length > 0) {
        dispatch(setSuggestedQuestions(response.suggestedQuestions));
      }

      // If examples were returned, we could display these in the future
      if (response.examples && response.examples.length > 0) {
        console.log("Examples received:", response.examples);
        // We could add these to the message or create a separate display for them
        // For now, we'll just acknowledge them in the console
      }

      // If related nodes were returned, we could display these in the future
      if (response.relatedNodes && response.relatedNodes.length > 0) {
        console.log("Related nodes received:", response.relatedNodes);
        // We could show these as links or add them to the graph
        // For now, we'll just acknowledge them in the console
      }
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch( 
        addMessage({
          type: 'error',
          content: 'Sorry, there was an error processing your message.',
          timestamp: new Date().toISOString(),
        })
      );
    } finally {
      dispatch(setLoading(false));
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
      <div 
        ref={chatRef} 
        className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl flex flex-col z-50 transition-all duration-300 ease-in-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-sgmm-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 truncate max-w-[75%] flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                style={{ backgroundColor: selectedNode?.color || '#6767c4' }}
              ></div>
              Chat about {selectedNode?.name || selectedNode?.title}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sgmm-500 focus:ring-offset-2 rounded-full p-1"
              aria-label="Close chat"
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
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-sgmm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="px-8">Ask questions about {selectedNode?.name || selectedNode?.title} to learn more about this concept</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`message-${message.timestamp}-${index}`}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-sgmm-500 text-white'
                      : message.type === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                  }`}
                >
                  {message.type === 'user' || message.type === 'error' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="text-sm markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200 bg-white">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Suggested Questions
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestionClick(question)}
                  className="text-left px-3 py-1 text-xs text-sgmm-600 bg-sgmm-50 hover:bg-sgmm-100 rounded-full border border-sgmm-200 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question about this concept..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-sgmm-500 focus:ring-sgmm-500 sm:text-sm pr-10"
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sgmm-500">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isLoading || !inputMessage.trim()
                  ? 'bg-sgmm-400 cursor-not-allowed'
                  : 'bg-sgmm-500 hover:bg-sgmm-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sgmm-500'
              }`}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NodeChat; 