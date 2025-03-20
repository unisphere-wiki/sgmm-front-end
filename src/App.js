import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import store from './store';
import MainLayout from './components/layout/MainLayout';
import QueryPanel from './components/query/QueryPanel';
import GraphVisualization from './components/graph/GraphVisualization';
import NodeDetailsPanel from './components/node/NodeDetailsPanel';
import NodeChat from './components/chat/NodeChat';
import GraphLoader from './components/graph/GraphLoader';

const App = () => {
  const [mobileView, setMobileView] = useState('graph'); // 'query', 'graph', or 'details'

  const handleViewChange = (view) => {
    setMobileView(view);
  };

  return (
    <Provider store={store}>
      <Router>
        <MainLayout>
          <GraphLoader />
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-between px-2 py-2 bg-indigo-100 rounded-lg mb-4">
            <button
              onClick={() => handleViewChange('query')}
              className={`px-4 py-2 rounded ${mobileView === 'query' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
            >
              Query
            </button>
            <button
              onClick={() => handleViewChange('graph')}
              className={`px-4 py-2 rounded ${mobileView === 'graph' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
            >
              Graph
            </button>
            <button
              onClick={() => handleViewChange('details')}
              className={`px-4 py-2 rounded ${mobileView === 'details' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
            >
              Details
            </button>
          </div>

          <div className="h-full flex flex-col md:flex-row justify-between gap-4 md:gap-8">
            {/* Query Panel */}
            <div className={`${mobileView === 'query' ? 'block' : 'hidden'} md:block w-full md:w-[23%] flex-shrink-0 overflow-hidden`}>
              <div className="h-full bg-white rounded-lg shadow">
                <QueryPanel />
              </div>
            </div>

            {/* Graph Visualization */}
            <div className={`${mobileView === 'graph' ? 'block' : 'hidden'} md:block w-full md:w-[48%] flex-shrink-0 overflow-hidden`}>
              <div className="h-full bg-white rounded-lg shadow">
                <GraphVisualization />
              </div>
            </div>

            {/* Node Details Panel */}
            <div className={`${mobileView === 'details' ? 'block' : 'hidden'} md:block w-full md:w-[23%] flex-shrink-0 overflow-hidden`}>
              <div className="h-full bg-white rounded-lg shadow">
                <NodeDetailsPanel />
              </div>
            </div>
          </div>

          {/* Node Chat */}
          <NodeChat />
        </MainLayout>
      </Router>
    </Provider>
  );
};

export default App; 