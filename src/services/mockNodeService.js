import mockData from '../data/mockData.json';

// Helper function to flatten the hierarchical structure
const flattenNodes = (nodes, parentId = null) => {
  return nodes.reduce((acc, node) => {
    // Create a new object with only essential properties
    const flatNode = {
      id: String(node.id),
      name: String(node.title),
      description: String(node.description),
      relevance: Number(node.relevance),
      layer: Number(node.layer),
      // Graph visualization properties
      val: Number(node.relevance),
      color: getNodeColor(node.layer),
      // Initial position
      x: Math.random() * 800 - 400,
      y: Math.random() * 800 - 400
    };
    acc.nodes.push(flatNode);
    
    // Add links for children
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        // Create a simple link object
        const link = {
          source: String(node.id),
          target: String(child.id),
          value: 1,
          color: '#CBD5E0'
        };
        acc.links.push(link);
      });
      // Recursively process children
      const childResults = flattenNodes(node.children, node.id);
      acc.nodes.push(...childResults.nodes);
      acc.links.push(...childResults.links);
    }
    
    return acc;
  }, { nodes: [], links: [] });
};

// Helper function to get node color based on layer
const getNodeColor = (layer) => {
  const colors = {
    0: '#4F46E5', // Root node
    1: '#10B981', // First level
    2: '#F59E0B', // Second level
    3: '#EF4444', // Third level
    4: '#8B5CF6'  // Fourth level
  };
  return colors[layer] || '#CBD5E0';
};

// Transform mock data into graph format
const transformGraphData = (data) => {
  console.log('Raw mock data:', data);
  const result = flattenNodes(data.nodes);
  console.log('Transformed graph data:', result);
  return result;
};

// Add shared data fetching function to optimize mock service

// Mock data cache
const _mockNodeCache = {};

// Shared function to get mock node data
const _getMockNodeData = async (graphId, nodeId) => {
  const cacheKey = `${graphId}_${nodeId}`;
  
  // Check cache first
  if (_mockNodeCache[cacheKey] && (Date.now() - _mockNodeCache[cacheKey].timestamp < 30000)) {
    console.log('Using cached mock data for', nodeId);
    return _mockNodeCache[cacheKey].data;
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate mock data based on the nodeId
  const nodeNum = parseInt(nodeId.replace('node_', '')) || 0;
  const layer = nodeNum % 4;
  
  // Create consistent mock data for this node
  const mockData = {
    node: {
      id: nodeId,
      title: `Mock Node ${nodeId}`,
      description: `This is a detailed description of node ${nodeId} in layer ${layer}. It contains information about the St. Gallen Management Model concept.`,
      layer: layer,
      relevance: 5 + (nodeNum % 6), // Generate a relevance between 5-10
      children: [
        {
          id: `node_${nodeNum + 1}`,
          title: `Child Node ${nodeNum + 1}`,
          description: `A child concept related to ${nodeId}`,
          layer: layer + 1 > 3 ? 3 : layer + 1,
          relevance: 7
        },
        {
          id: `node_${nodeNum + 2}`,
          title: `Child Node ${nodeNum + 2}`,
          description: `Another child concept related to ${nodeId}`,
          layer: layer + 1 > 3 ? 3 : layer + 1,
          relevance: 8
        }
      ]
    },
    path: [
      {
        id: 'node_0',
        title: 'Root Node',
        layer: 0,
        relevance: 10
      },
      {
        id: `node_${Math.floor(nodeNum / 3)}`,
        title: `Parent Node ${Math.floor(nodeNum / 3)}`,
        layer: layer > 0 ? layer - 1 : 0,
        relevance: 9
      },
      {
        id: nodeId,
        title: `Mock Node ${nodeId}`,
        layer: layer,
        relevance: 5 + (nodeNum % 6)
      }
    ],
    examples: [
      {
        title: `Example for ${nodeId}: Company Success Story`,
        description: `This is an example of how a company successfully applied the concept of ${nodeId} in their operations.`
      },
      {
        title: `Example for ${nodeId}: Industry Application`,
        description: `This example shows how this concept can be applied across different industries.`
      }
    ]
  };
  
  // Cache the mock data
  _mockNodeCache[cacheKey] = {
    timestamp: Date.now(),
    data: mockData
  };
  
  return mockData;
};

// Mock service implementation
const mockNodeService = {
  getNodes: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return transformGraphData(mockData); // Return both nodes and links
  },

  getNodeDetails: async (graphId, nodeId) => {
    try {
      const data = await _getMockNodeData(graphId, nodeId);
      
      return {
        id: data.node.id,
        title: data.node.title,
        description: data.node.description,
        layer: data.node.layer,
        relevance: data.node.relevance,
        children: data.node.children || [],
        path: data.path || []
      };
    } catch (error) {
      throw error;
    }
  },

  getRelatedNodes: async (graphId, nodeId) => {
    try {
      const data = await _getMockNodeData(graphId, nodeId);
      
      const relatedNodes = (data.node.children || []).map(child => ({
        id: child.id,
        name: child.title,
        description: child.description, 
        layer: child.layer,
        relevance: child.relevance,
        graphId: graphId,
        connectionStrength: child.relevance || 5 // Use relevance as connection strength
      }));
      
      return relatedNodes;
    } catch (error) {
      throw error;
    }
  },

  getSourceCitations: async (graphId, nodeId) => {
    return [];
  },

  getExamples: async (graphId, nodeId) => {
    try {
      const data = await _getMockNodeData(graphId, nodeId);
      return data.examples || [];
    } catch (error) {
      throw error;
    }
  },

  // Mock chat functions for /node-chat endpoint
  sendChatMessage: async (graphId, nodeId, message, chatHistory) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple response generator based on the message
    let response;
    
    if (message.toLowerCase().includes('what') || message.toLowerCase().includes('how')) {
      response = `This is a simulated response about the node "${nodeId}". The St. Gallen Management Model provides a framework for understanding ${message.toLowerCase().includes('what') ? 'what this concept means' : 'how this concept applies'} in organizational contexts.`;
    } else if (message.toLowerCase().includes('example')) {
      response = `Here's an example of this concept in action: Tesla used this approach to rapidly scale their operations while maintaining organizational flexibility.`;
    } else if (message.toLowerCase().includes('relate') || message.toLowerCase().includes('connection')) {
      response = `This concept relates to several other areas in the model, particularly to organizational structure and strategy formulation.`;
    } else {
      response = `I understand you're interested in learning more about this concept. The St. Gallen Management Model views this as an integral part of organizational success. Is there anything specific you'd like to know?`;
    }
    
    // Create a mock response that matches the API format
    return {
      message: response,
      suggestedQuestions: [
        "What are the key components of this concept?",
        "How can this be applied in a startup environment?",
        "Can you give an example of successful implementation?"
      ],
      examples: [
        {
          title: "Tesla's Implementation",
          description: "Tesla effectively implemented this concept by focusing on vertical integration and agile management structures."
        }
      ],
      relatedNodes: [
        {
          id: "node_" + (parseInt(nodeId.replace('node_', '')) + 1),
          title: "Related Concept",
          relevance: 0.85
        }
      ]
    };
  }
};

export default mockNodeService; 