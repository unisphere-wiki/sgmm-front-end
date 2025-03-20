import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setQuery,
  setContextParams,
  setSelectedDocument,
  addToHistory,
  setLoading,
  setError,
} from '../../store/slices/querySlice';
import queryService from '../../services/queryService';

const QueryPanel = () => {
  const dispatch = useDispatch();
  const { currentQuery, contextParams, selectedDocument, queryHistory, isLoading } = useSelector(
    (state) => state.query
  );

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(currentQuery);
  const [localContextParams, setLocalContextParams] = useState(contextParams);

  // Update local state when Redux state changes
  React.useEffect(() => {
    setLocalQuery(currentQuery);
    setLocalContextParams(contextParams);
  }, [currentQuery, contextParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localQuery.trim()) return;

    dispatch(setLoading(true));
    try {
      const response = await queryService.submitQuery(
        localQuery,
        localContextParams,
        selectedDocument?.id
      );
      
      dispatch(addToHistory({
        query: localQuery,
        timestamp: new Date().toISOString(),
        graphId: response.graphId,
      }));
      
      // Handle successful query submission
      // You might want to navigate to the graph view or update the graph state
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleQueryChange = (e) => {
    const newValue = e.target.value;
    setLocalQuery(newValue); // Update local state immediately
    dispatch(setQuery(newValue)); // Update Redux state
  };

  const handleContextParamChange = (param, value) => {
    const updatedParams = { ...localContextParams, [param]: value };
    setLocalContextParams(updatedParams); // Update local state immediately
    dispatch(setContextParams(updatedParams)); // Update Redux state
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Query Input */}
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700">
            Enter your query
          </label>
          <div className="mt-1">
            <textarea
              id="query"
              name="query"
              rows={3}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="e.g., How can the St. Gallen Management Model help with organizational restructuring?"
              value={localQuery}
              onChange={handleQueryChange}
            />
          </div>
        </div>

        {/* Context Parameters */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Context Parameters</h3>
          
          {/* Company Size */}
          <div>
            <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
              Company Size
            </label>
            <select
              id="companySize"
              name="companySize"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={localContextParams.companySize || ''}
              onChange={(e) => handleContextParamChange('companySize', e.target.value)}
            >
              <option value="">Select size</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Industry
            </label>
            <select
              id="industry"
              name="industry"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={localContextParams.industry || ''}
              onChange={(e) => handleContextParamChange('industry', e.target.value)}
            >
              <option value="">Select industry</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="manufacturing">Manufacturing</option>
            </select>
          </div>

          {/* Management Role */}
          <div>
            <label htmlFor="managementRole" className="block text-sm font-medium text-gray-700">
              Management Role
            </label>
            <select
              id="managementRole"
              name="managementRole"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={localContextParams.managementRole || ''}
              onChange={(e) => handleContextParamChange('managementRole', e.target.value)}
            >
              <option value="">Select role</option>
              <option value="executive">Executive</option>
              <option value="manager">Manager</option>
              <option value="consultant">Consultant</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || !localQuery.trim()}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading || !localQuery.trim()
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isLoading ? 'Processing...' : 'Submit Query'}
          </button>
        </div>

        {/* Query History */}
        <div>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full flex justify-between items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <span>Query History</span>
            <span className="ml-2">{isHistoryOpen ? '−' : '+'}</span>
          </button>
          {isHistoryOpen && (
            <div className="mt-4 space-y-2">
              {queryHistory.map((item, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50 rounded-md text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setLocalQuery(item.query);
                    dispatch(setQuery(item.query));
                    setIsHistoryOpen(false);
                  }}
                >
                  <div>{item.query}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default QueryPanel; 