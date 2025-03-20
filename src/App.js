import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from './store';
import MainLayout from './components/layout/MainLayout';
import QueryPanel from './components/query/QueryPanel';
import GraphVisualization from './components/graph/GraphVisualization';
import NodeDetailsPanel from './components/node/NodeDetailsPanel';
import { useSelector } from 'react-redux';

// Wrapper component to access Redux state
const AppContent = () => {
  const { isOpen: isChatOpen } = useSelector((state) => state.chat);

  return (
    <MainLayout>
      <div 
        className="flex flex-col md:flex-row h-full" 
        style={{ minHeight: 'calc(100vh - 200px)' }}
      >
        {/* Left sidebar - Query Panel */}
        <div className="md:w-1/3 lg:w-1/4 p-2 md:pl-0">
          <QueryPanel />
        </div>

        {/* Main content - Graph Visualization */}
        <div className="flex-grow flex flex-col p-2">
          <div className="bg-white shadow rounded-lg h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Knowledge Graph</h2>
            </div>
            <div className="flex-grow flex items-center justify-center relative">
              <GraphVisualization />
            </div>
          </div>
        </div>

        {/* Right sidebar - Node Details & Chat */}
        <div className="md:w-1/3 lg:w-1/4 p-2 md:pr-0">
          <div className="flex-grow">
            <NodeDetailsPanel />
          </div>
          {isChatOpen && (
            <div className="mt-4">
              {/* Chat functionality will be implemented later */}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App; 