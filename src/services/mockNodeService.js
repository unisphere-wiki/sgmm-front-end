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

// Mock service implementation
const mockNodeService = {
  getNodes: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return transformGraphData(mockData); // Return both nodes and links
  },

  getNodeDetails: async (graphId, nodeId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const findNode = (nodes) => {
      for (const node of nodes) {
        if (node.id === nodeId) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const node = findNode(mockData.nodes);
    if (!node) throw new Error('Node not found');
    return node;
  },

  getRelatedNodes: async (graphId, nodeId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const findNode = (nodes) => {
      for (const node of nodes) {
        if (node.id === nodeId) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const node = findNode(mockData.nodes);
    if (!node) throw new Error('Node not found');
    
    // Return parent and children as related nodes
    const relatedNodes = [];
    if (node.children) {
      relatedNodes.push(...node.children);
    }
    return relatedNodes;
  },

  getSuggestedQuestions: async (graphId, nodeId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData.suggestedQuestions || [];
  },

  getSourceCitations: async (graphId, nodeId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData.sourceCitations || [];
  },

  getExamples: async (graphId, nodeId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData.examples || [];
  },

  sendChatMessage: async (graphId, nodeId, message, messageHistory) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      message: `This is a mock response to: "${message}"`,
      timestamp: new Date().toISOString()
    };
  }
};

export default mockNodeService; 