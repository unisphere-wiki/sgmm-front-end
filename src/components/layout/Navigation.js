import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import authService from '../../services/authService';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Semi-transparent backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal container with scrolling */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Close button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use SGMM</h2>
              
              <div className="space-y-6">
                {/* Query Panel Section */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-indigo-600 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Query Panel
                  </h3>
                  <p className="text-gray-600">Use the query panel to search and explore the knowledge graph. Enter your query and adjust parameters to refine your search.</p>
                  <ul className="mt-2 list-disc list-inside text-gray-600 ml-4">
                    <li>Enter your search query in the text field</li>
                    <li>Adjust relevance and layer parameters</li>
                    <li>Click "Search" to visualize results</li>
                  </ul>
                </div>

                {/* Graph Visualization Section */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-indigo-600 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Graph Visualization
                  </h3>
                  <p className="text-gray-600">Interact with the knowledge graph visualization to explore relationships between nodes.</p>
                  <ul className="mt-2 list-disc list-inside text-gray-600 ml-4">
                    <li>Click and drag nodes to reposition them</li>
                    <li>Zoom in/out using mouse wheel</li>
                    <li>Click nodes to view details</li>
                    <li>Hover over nodes to highlight connections</li>
                  </ul>
                </div>

                {/* Node Details Section */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-indigo-600 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Node Details
                  </h3>
                  <p className="text-gray-600">View detailed information about selected nodes in the details panel.</p>
                  <ul className="mt-2 list-disc list-inside text-gray-600 ml-4">
                    <li>View node properties and metadata</li>
                    <li>Explore related nodes</li>
                    <li>Access source citations</li>
                  </ul>
                </div>

                {/* Chat Feature Section */}
                <div>
                  <h3 className="text-lg font-semibold text-indigo-600 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Chat Feature
                  </h3>
                  <p className="text-gray-600">Use the chat feature to get additional information and insights about nodes.</p>
                  <ul className="mt-2 list-disc list-inside text-gray-600 ml-4">
                    <li>Ask questions about selected nodes</li>
                    <li>Get AI-powered explanations</li>
                    <li>Explore node relationships through conversation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navigation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <>
      <nav className="bg-white shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-800">SGMM</span>
              </div>
              {isAuthenticated && (
                <div className="ml-6 flex items-center">
                  <button
                    onClick={() => setShowHelp(true)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    Help
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">{user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLogin}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRegister}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};

export default Navigation; 