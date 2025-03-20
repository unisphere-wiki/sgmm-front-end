import React, { useState, useEffect, useRef } from 'react';
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
import documentService from '../../services/documentService';

const QueryPanel = () => {
  const dispatch = useDispatch();
  const { currentQuery, contextParams, selectedDocument, queryHistory, isLoading } = useSelector(
    (state) => state.query
  );

  const [documents, setDocuments] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isParamsOpen, setIsParamsOpen] = useState(true);
  const [localQuery, setLocalQuery] = useState(currentQuery);
  const [localContextParams, setLocalContextParams] = useState(contextParams);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // Fetch available documents when the component mounts
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await documentService.getDocuments();
        setDocuments(docs);
        
        // If no document is selected and there are documents available, select the first one
        if (!selectedDocument && docs.length > 0) {
          dispatch(setSelectedDocument(docs[0]));
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
        // Use mock data if API call fails
        const mockDocs = [
          { id: 'doc1', title: 'St. Gallen Management Model', created_at: '2024-03-20T05:48:05.563Z' },
          { id: 'doc2', title: 'Business Model Canvas', created_at: '2024-03-15T14:30:00.000Z' },
          { id: 'doc3', title: 'Value Chain Analysis', created_at: '2024-03-10T09:15:30.000Z' }
        ];
        setDocuments(mockDocs);
        
        if (!selectedDocument && mockDocs.length > 0) {
          dispatch(setSelectedDocument(mockDocs[0]));
        }
      }
    };

    fetchDocuments();
  }, [dispatch, selectedDocument]);

  // Update local state when Redux state changes
  useEffect(() => {
    setLocalQuery(currentQuery);
    setLocalContextParams(contextParams);
  }, [currentQuery, contextParams]);

  // Add auto-resize functionality for the textarea
  useEffect(() => {
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      // Reset height to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Set the height to scrollHeight + border to avoid scrollbar
      const newHeight = Math.max(80, textarea.scrollHeight);
      textarea.style.height = `${newHeight}px`;
    };

    adjustHeight();
    
    // Add event listener for window resize to readjust height
    window.addEventListener('resize', adjustHeight);
    
    return () => {
      window.removeEventListener('resize', adjustHeight);
    };
  }, [localQuery]);

  const handleDocumentChange = (e) => {
    const docId = e.target.value;
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      dispatch(setSelectedDocument(doc));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localQuery.trim() || !selectedDocument) return;

    dispatch(setLoading(true));
    try {
      const response = await queryService.submitQuery(
        localQuery,
        localContextParams,
        selectedDocument.id
      );
      
      dispatch(addToHistory({
        query: localQuery,
        timestamp: new Date().toISOString(),
        graphId: response.graphId,
        documentId: selectedDocument.id,
        documentTitle: selectedDocument.title
      }));
      
      // Handle successful query submission
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
    <div className="bg-white shadow rounded-lg h-full overflow-y-auto">
      <div className="p-4 sm:p-5 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Knowledge Query</h2>
        <p className="mt-1 text-sm text-gray-500">
          Enter your query and customize parameters to explore the management model
        </p>
      </div>
      
      <div className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Document Selection */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <label htmlFor="documentId" className="block text-sm font-medium text-gray-700 mb-2">
              Select Document
            </label>
            <select
              id="documentId"
              name="documentId"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedDocument?.id || ''}
              onChange={handleDocumentChange}
            >
              <option value="" disabled>
                Select a document
              </option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))}
            </select>
            {selectedDocument && (
              <div className="mt-2 text-xs text-gray-500">
                Last updated: {new Date(selectedDocument.created_at).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Query Input */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your query
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                id="query"
                name="query"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                placeholder={isFocused ? "" : "e.g., How can the St. Gallen Management Model help with organizational restructuring?"}
                value={localQuery}
                onChange={handleQueryChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(localQuery.trim() !== '')}
                style={{ minHeight: '80px' }}
              />
              {!isFocused && !localQuery && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 py-3 text-sm text-gray-500">
                  e.g., How can the St. Gallen Management Model help with organizational restructuring?
                </div>
              )}
            </div>
          </div>

          {/* Context Parameters Accordion */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <button
              type="button"
              onClick={() => setIsParamsOpen(!isParamsOpen)}
              className="w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span className="font-medium">Context Parameters</span>
              <span className="ml-2 w-5 h-5 flex items-center justify-center bg-white rounded-full">
                {isParamsOpen ? '−' : '+'}
              </span>
            </button>
            
            {isParamsOpen && (
              <div className="mt-3 grid grid-cols-1 gap-4">
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
                    <option value="small">Small (&lt; 50 employees)</option>
                    <option value="medium">Medium (50-500 employees)</option>
                    <option value="large">Large (500-5000 employees)</option>
                    <option value="enterprise">Enterprise (&gt; 5000 employees)</option>
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
                    <option value="retail">Retail</option>
                    <option value="public_sector">Public Sector</option>
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
                    <option value="founder">Founder/Entrepreneur</option>
                    <option value="c_level">C-Suite Executive</option>
                    <option value="middle_management">Middle Management</option>
                    <option value="team_lead">Team Lead</option>
                    <option value="consultant">Consultant</option>
                  </select>
                </div>
                
                {/* Challenge Type */}
                <div>
                  <label htmlFor="challengeType" className="block text-sm font-medium text-gray-700">
                    Challenge Type
                  </label>
                  <select
                    id="challengeType"
                    name="challengeType"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={localContextParams.challengeType || ''}
                    onChange={(e) => handleContextParamChange('challengeType', e.target.value)}
                  >
                    <option value="">Select challenge</option>
                    <option value="growth">Growth & Scaling</option>
                    <option value="efficiency">Operational Efficiency</option>
                    <option value="innovation">Innovation</option>
                    <option value="organizational_restructuring">Organizational Restructuring</option>
                    <option value="digital_transformation">Digital Transformation</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !localQuery.trim() || !selectedDocument}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading || !localQuery.trim() || !selectedDocument
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Submit Query'
            )}
          </button>

          {/* Query History */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span className="font-medium">Query History</span>
              <span className="ml-2 w-5 h-5 flex items-center justify-center bg-white rounded-full">
                {isHistoryOpen ? '−' : '+'}
              </span>
            </button>
            
            {isHistoryOpen && (
              <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto scrollbar-hide">
                {queryHistory.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 bg-white rounded-md">
                    No previous queries
                  </div>
                ) : (
                  queryHistory.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-md text-sm text-gray-600 hover:bg-gray-100 cursor-pointer border border-gray-100"
                      onClick={() => {
                        setLocalQuery(item.query);
                        dispatch(setQuery(item.query));
                        
                        // If this query has a document associated, select it
                        if (item.documentId) {
                          const doc = documents.find(d => d.id === item.documentId);
                          if (doc) {
                            dispatch(setSelectedDocument(doc));
                          }
                        }
                      }}
                    >
                      <div className="line-clamp-1 font-medium">{item.query}</div>
                      {item.documentTitle && (
                        <div className="text-xs text-indigo-600 mt-1">
                          Document: {item.documentTitle}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default QueryPanel; 