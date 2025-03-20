import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setQuery,
  setContextParams,
  setSelectedDocument,
  addToHistory,
  addHistoryBulk,
  setLoading,
  setError,
} from '../../store/slices/querySlice';
import {
  setGraphData,
  setLoading as setGraphLoading,
  setCurrentLayer,
} from '../../store/slices/graphSlice';
import queryService from '../../services/queryService';
import documentService from '../../services/documentService';

const QueryPanel = () => {
  const dispatch = useDispatch();
  const { currentQuery, contextParams, selectedDocument, queryHistory, isLoading } = useSelector(
    (state) => state.query
  );

  // Local state
  const [documents, setDocuments] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isParamsOpen, setIsParamsOpen] = useState(false);
  const [isQueryInputOpen, setIsQueryInputOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(currentQuery);
  const [localContextParams, setLocalContextParams] = useState(contextParams);
  const [isFocused, setIsFocused] = useState(false);
  const [activeQueryId, setActiveQueryId] = useState(null);
  
  // Refs
  const textareaRef = useRef(null);
  const queryContentRef = useRef(null);
  const paramsContentRef = useRef(null);
  const historyContentRef = useRef(null);
  const historyLoadedRef = useRef(false);
  const initialRenderRef = useRef(true);
  const documentSelectedRef = useRef(false);

  // Load documents only once on mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchDocuments = async () => {
      try {
        const docs = await documentService.getDocuments();
        if (isMounted) {
          // Filter out documents with is_sample:true
          const filteredDocs = docs.filter(doc => !doc.metadata?.is_sample);
          setDocuments(filteredDocs);
          
          // If no document is selected, select the first one
          if (!selectedDocument && filteredDocs.length > 0) {
            dispatch(setSelectedDocument(filteredDocs[0]));
            documentSelectedRef.current = true;
          }
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
        
        // Use mock data if API call fails
        const mockDocs = [
          { 
            id: 'doc1', 
            title: 'St. Gallen Management Model', 
            created_at: '2024-03-20T05:48:05.563Z',
            metadata: { author: 'SGMM' }
          },
          { 
            id: 'doc2', 
            title: 'Business Model Canvas', 
            created_at: '2024-03-15T14:30:00.000Z',
            metadata: { author: 'Alexander Osterwalder' }
          },
          { 
            id: 'doc3', 
            title: 'Value Chain Analysis', 
            created_at: '2024-03-10T09:15:30.000Z',
            metadata: { author: 'Michael Porter' }
          }
        ];
        
        if (isMounted) {
          setDocuments(mockDocs);
          
          // If no document is selected, select the first one
          if (!selectedDocument && mockDocs.length > 0) {
            dispatch(setSelectedDocument(mockDocs[0]));
            documentSelectedRef.current = true;
          }
        }
      }
    };

    fetchDocuments();
    return () => { isMounted = false; };
  }, []);
  
  // Load query history from localStorage on component mount - only once
  useEffect(() => {
    // Skip if already loaded
    if (historyLoadedRef.current || queryHistory.length > 0) return;
    
    try {
      const storedHistory = localStorage.getItem('queryHistory');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        
        if (parsedHistory.length > 0) {
          dispatch(addHistoryBulk(parsedHistory));
          historyLoadedRef.current = true;
        }
      }
    } catch (error) {
      console.error("Failed to load query history from localStorage:", error);
    }
    
    historyLoadedRef.current = true;
  }, []);

  // Sync local state with Redux store - only run on changes
  useEffect(() => {
    // Skip during initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    // Update local query if different from Redux
    if (localQuery !== currentQuery) {
      setLocalQuery(currentQuery);
    }
  }, [currentQuery]);

  useEffect(() => {
    // Skip during initial render
    if (initialRenderRef.current) {
      return;
    }
    
    // Update local context params if different from Redux
    const stateJSON = JSON.stringify(contextParams);
    const localJSON = JSON.stringify(localContextParams);
    
    if (stateJSON !== localJSON) {
      setLocalContextParams(contextParams);
    }
  }, [contextParams]);

  // Input field handlers
  const handleQueryChange = (e) => {
    const newValue = e.target.value;
    setLocalQuery(newValue);
    
    // Debounce updates to Redux
    clearTimeout(window.queryChangeTimeout);
    window.queryChangeTimeout = setTimeout(() => {
      dispatch(setQuery(newValue));
    }, 300);
  };

  const handleContextParamChange = (param, value) => {
    const updatedParams = { ...localContextParams, [param]: value };
    setLocalContextParams(updatedParams);
    
    // Debounce updates to Redux
    clearTimeout(window.paramsChangeTimeout);
    window.paramsChangeTimeout = setTimeout(() => {
      dispatch(setContextParams(updatedParams));
    }, 300);
  };

  const handleDocumentChange = (e) => {
    const docId = e.target.value;
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      dispatch(setSelectedDocument(doc));
    }
  };

  // Handle query submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!localQuery.trim() || !selectedDocument) return;
    if (isLoading) return;
    
    // Capture current state
    const queryText = localQuery;
    const document = selectedDocument;
    const params = { ...localContextParams };
    
    // Set loading state
    dispatch(setLoading(true));
    dispatch(setGraphLoading(true));
    
    try {
      // Submit query
      const response = await queryService.submitQuery(queryText, params, document.id);
      
      if (!response || !response.graphId) {
        throw new Error('Invalid server response');
      }
      
      // Capture the response data we need
      const { graphId, queryId } = response;
      
      // Set active query before loading graph
      setActiveQueryId(queryId);
      
      // Get graph data
      const graphData = await queryService.getGraphData(graphId, {
        layer: 4,
        connections: true
      });
      
      // Process graph data
      const nodes = [];
      const links = [];
      const processNode = (node, parentId = null) => {
        nodes.push({
          id: node.id,
          name: node.title,
          description: node.description,
          layer: node.layer,
          relevance: node.relevance,
          graphId: graphId
        });
        
        if (parentId) {
          links.push({ source: parentId, target: node.id, value: 1 });
        }
        
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => processNode(child, node.id));
        }
      };
      
      if (graphData.graph) {
        processNode(graphData.graph);
      }
      
      if (graphData.connections && graphData.connections.length > 0) {
        graphData.connections.forEach(conn => {
          links.push({
            source: conn.source,
            target: conn.target,
            value: conn.strength || 1
          });
        });
      }
      
      // Set graph data in Redux
      dispatch(setGraphData({ nodes, links }));
      dispatch(setCurrentLayer(4));
      
      // Update UI state
      setIsHistoryOpen(true);
      setIsQueryInputOpen(false);
      setIsParamsOpen(false);
      
      // Create the history item
      const historyItem = {
        query: queryText,
        timestamp: new Date().toISOString(),
        graphId,
        queryId,
        documentId: document.id,
        documentTitle: document.title,
        documentAuthor: document.metadata?.author || document.metadata?.authors,
        contextParams: params
      };
      
      // Add to history in Redux
      dispatch(addToHistory(historyItem));
      
      // Store in localStorage
      try {
        const storedHistory = JSON.parse(localStorage.getItem('queryHistory') || '[]');
        const updatedHistory = [historyItem, ...storedHistory];
        localStorage.setItem('queryHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Failed to update localStorage:', error);
      }
    } catch (error) {
      console.error('Error submitting query:', error);
      dispatch(setError(error.message || 'Failed to submit query'));
    } finally {
      dispatch(setGraphLoading(false));
      dispatch(setLoading(false));
    }
  };
  
  // Handle history item click
  const handleHistoryItemClick = (item) => {
    // Prevent re-processing for active item
    if (item.queryId === activeQueryId) return;
    
    // Update UI state
    setIsQueryInputOpen(false);
    setIsParamsOpen(false);
    setIsHistoryOpen(true);
    
    // Update local state immediately
    setLocalQuery(item.query);
    setActiveQueryId(item.queryId);
    
    if (item.contextParams) {
      setLocalContextParams(item.contextParams);
    }
    
    // Update Redux state with a slight delay
    setTimeout(() => {
      // Find document if needed
      if (item.documentId && (!selectedDocument || selectedDocument.id !== item.documentId)) {
        const doc = documents.find(d => d.id === item.documentId);
        if (doc) {
          dispatch(setSelectedDocument(doc));
        }
      }
      
      // Update query in Redux
      dispatch(setQuery(item.query));
      
      // Load graph data
      if (item.graphId) {
        loadGraphFromHistory(item.graphId, item.queryId);
      }
    }, 50);
  };
  
  // Load graph from history
  const loadGraphFromHistory = async (graphId, queryId) => {
    if (!graphId || !queryId) return;
    if (isLoading) return;
    
    dispatch(setGraphLoading(true));
    
    try {
      // Get graph data
      const graphData = await queryService.getGraphData(graphId, {
        layer: 4,
        connections: true
      });
      
      // Process graph data
      const nodes = [];
      const links = [];
      const processNode = (node, parentId = null) => {
        nodes.push({
          id: node.id,
          name: node.title,
          description: node.description,
          layer: node.layer,
          relevance: node.relevance,
          graphId: graphId
        });
        
        if (parentId) {
          links.push({ source: parentId, target: node.id, value: 1 });
        }
        
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => processNode(child, node.id));
        }
      };
      
      if (graphData.graph) {
        processNode(graphData.graph);
      }
      
      if (graphData.connections && graphData.connections.length > 0) {
        graphData.connections.forEach(conn => {
          links.push({
            source: conn.source,
            target: conn.target,
            value: conn.strength || 1
          });
        });
      }
      
      // Set graph data in Redux
      dispatch(setGraphData({ nodes, links }));
      dispatch(setCurrentLayer(4));
    } catch (error) {
      console.error('Error loading graph from history:', error);
      dispatch(setError('Failed to load graph: ' + error.message));
    } finally {
      dispatch(setGraphLoading(false));
    }
  };
  
  // Helper functions
  const getAuthorDisplay = (doc) => {
    if (doc.metadata?.authors) {
      return ` - ${doc.metadata.authors}`;
    } else if (doc.metadata?.author) {
      return ` - ${doc.metadata.author}`;
    }
    return '';
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
                  {doc.title}{getAuthorDisplay(doc)}
                </option>
              ))}
            </select>
            {selectedDocument && (
              <div className="mt-2 text-xs text-gray-500">
                Last updated: {new Date(selectedDocument.created_at).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Query Input Accordion */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <button
              type="button"
              onClick={() => setIsQueryInputOpen(!isQueryInputOpen)}
              className="w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span className="font-medium">Enter Query</span>
              <span className="ml-2 w-5 h-5 flex items-center justify-center bg-white rounded-full">
                {isQueryInputOpen ? '−' : '+'}
              </span>
            </button>
            
            <div 
              ref={queryContentRef}
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ 
                maxHeight: isQueryInputOpen ? '300px' : '0',
                opacity: isQueryInputOpen ? 1 : 0,
                margin: isQueryInputOpen ? '12px 0 0 0' : '0'
              }}
            >
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  id="query"
                  name="query"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                  placeholder=""
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
            
            <div 
              ref={paramsContentRef}
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ 
                maxHeight: isParamsOpen ? '1000px' : '0',
                opacity: isParamsOpen ? 1 : 0,
                margin: isParamsOpen ? '12px 0 0 0' : '0'
              }}
            >
              <div className="grid grid-cols-1 gap-4">
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

                {/* Company Maturity */}
                <div>
                  <label htmlFor="companyMaturity" className="block text-sm font-medium text-gray-700">
                    Company Maturity
                  </label>
                  <select
                    id="companyMaturity"
                    name="companyMaturity"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={localContextParams.companyMaturity || ''}
                    onChange={(e) => handleContextParamChange('companyMaturity', e.target.value)}
                  >
                    <option value="">Select maturity</option>
                    <option value="startup">Startup</option>
                    <option value="growth">Growth</option>
                    <option value="mature">Mature</option>
                    <option value="enterprise">Enterprise</option>
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

                {/* Market Volatility */}
                <div>
                  <label htmlFor="marketVolatility" className="block text-sm font-medium text-gray-700">
                    Market Volatility
                  </label>
                  <select
                    id="marketVolatility"
                    name="marketVolatility"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={localContextParams.marketVolatility || ''}
                    onChange={(e) => handleContextParamChange('marketVolatility', e.target.value)}
                  >
                    <option value="">Select volatility</option>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Competitive Pressure */}
                <div>
                  <label htmlFor="competitivePressure" className="block text-sm font-medium text-gray-700">
                    Competitive Pressure
                  </label>
                  <select
                    id="competitivePressure"
                    name="competitivePressure"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={localContextParams.competitivePressure || ''}
                    onChange={(e) => handleContextParamChange('competitivePressure', e.target.value)}
                  >
                    <option value="">Select pressure</option>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Regulatory Environment */}
                <div>
                  <label htmlFor="regulatoryEnvironment" className="block text-sm font-medium text-gray-700">
                    Regulatory Environment
                  </label>
                  <select
                    id="regulatoryEnvironment"
                    name="regulatoryEnvironment"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={localContextParams.regulatoryEnvironment || ''}
                    onChange={(e) => handleContextParamChange('regulatoryEnvironment', e.target.value)}
                  >
                    <option value="">Select regulation</option>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
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
            </div>
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
            
            <div 
              ref={historyContentRef}
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ 
                maxHeight: isHistoryOpen ? '300px' : '0',
                opacity: isHistoryOpen ? 1 : 0,
                margin: isHistoryOpen ? '12px 0 0 0' : '0'
              }}
            >
              <div className="space-y-2 overflow-y-auto max-h-[250px] pr-1 custom-scrollbar">
                {queryHistory.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 bg-white rounded-md">
                    No previous queries
                  </div>
                ) : (
                  // Sort history by timestamp (most recent first)
                  [...queryHistory]
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((item, index) => (
                    <div
                      key={item.queryId || index}
                      className={`p-3 bg-white rounded-md text-sm text-gray-600 hover:bg-gray-100 cursor-pointer border ${
                        item.queryId === activeQueryId 
                          ? 'border-indigo-500 ring-1 ring-indigo-500' 
                          : 'border-gray-100'
                      }`}
                      onClick={() => handleHistoryItemClick(item)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="line-clamp-1 font-medium">{item.query}</div>
                        {item.queryId === activeQueryId && (
                          <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            Active
                          </span>
                        )}
                      </div>
                      {item.documentTitle && (
                        <div className="text-xs text-indigo-600 mt-1">
                          Document: {item.documentTitle}
                          {item.documentAuthor ? ` - ${item.documentAuthor}` : ''}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* New Query Button */}
          {(!isQueryInputOpen || !isParamsOpen) && (
            <button
              type="button"
              onClick={() => {
                setIsQueryInputOpen(true);
                setIsParamsOpen(true);
              }}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Query
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default QueryPanel; 