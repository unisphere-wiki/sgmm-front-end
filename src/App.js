import React from 'react';
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
  return (
    <Provider store={store}>
      <Router>
        <MainLayout>
          <GraphLoader />
          <div className="h-full flex flex-row justify-between gap-8">
            {/* Query Panel */}
            <div className="w-[23%] flex-shrink-0 overflow-hidden">
              <div className="h-full bg-white rounded-lg shadow">
                <QueryPanel />
              </div>
            </div>

            {/* Graph Visualization */}
            <div className="w-[48%] flex-shrink-0 overflow-hidden">
              <div className="h-full bg-white rounded-lg shadow">
                <GraphVisualization />
              </div>
            </div>

            {/* Node Details Panel */}
            <div className="w-[23%] flex-shrink-0 overflow-hidden">
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