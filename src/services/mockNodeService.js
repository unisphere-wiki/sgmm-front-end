import mockData from '../data/mockData.json';

// Transform mock data into graph format
const transformGraphData = (data) => {
  console.log('Raw mock data:', data);
  
  // Create new nodes array with fresh objects
  const nodes = data.nodes.map(node => {
    console.log('Processing node:', node);
    // Create a new object with all necessary properties
    const newNode = Object.assign({}, {
      id: String(node.id),
      name: String(node.name),
      description: String(node.description),
      relevance: Number(node.relevance),
      graphId: String(node.graphId),
      type: String(node.type),
      layer: 0,
      group: String(node.type),
      val: Number(node.relevance),
      color: '#4F46E5',
      // Basic position properties
      x: Math.random() * 1000 - 500,
      y: Math.random() * 1000 - 500,
      // Add drag-related properties
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
      // Add force-graph specific properties
      __initialDragPos: { x: 0, y: 0 },
      __dragged: false,
      __initPos: { x: 0, y: 0 },
      __dragPos: { x: 0, y: 0 },
      __dragStartPos: { x: 0, y: 0 },
      __dragEndPos: { x: 0, y: 0 },
      __dragStartTime: 0,
      __dragEndTime: 0,
      __dragStartEvent: null,
      __dragEndEvent: null,
      __dragStartZoom: 1,
      __dragEndZoom: 1,
      __dragStartCenter: { x: 0, y: 0 },
      __dragEndCenter: { x: 0, y: 0 }
    });
    return newNode;
  });

  console.log('Transformed nodes:', nodes);

  // Create new links array with fresh objects
  const links = data.edges.map(edge => ({
    source: String(edge.source),
    target: String(edge.target),
    value: Number(edge.strength),
    color: '#CBD5E0'
  }));

  console.log('Transformed links:', links);

  return { nodes, links };
};

const mockNodeService = {
  // Get all nodes
  getNodes: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return transformGraphData(mockData);
  },

  // Get node details
  getNodeDetails: async (graphId, nodeId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const node = mockData.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error('Node not found');
    return node;
  },

  // Get related nodes
  getRelatedNodes: async (graphId, nodeId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const edges = mockData.edges.filter(e => e.source === nodeId);
    return edges.map(edge => {
      const targetNode = mockData.nodes.find(n => n.id === edge.target);
      return {
        ...targetNode,
        connectionStrength: edge.strength
      };
    });
  },

  // Get suggested questions
  getSuggestedQuestions: async (graphId, nodeId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData.suggestedQuestions[nodeId] || [];
  },

  // Get source citations
  getSourceCitations: async (graphId, nodeId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData.sourceCitations[nodeId] || [];
  },

  // Get examples
  getExamples: async (graphId, nodeId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData.examples[nodeId] || [];
  },

  // Send chat message
  sendChatMessage: async (graphId, nodeId, message, messageHistory) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simple mock response based on the message content
    const node = mockData.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error('Node not found');

    // Generate a mock response based on the message content
    let response = "I understand you're asking about " + node.name + ". ";
    if (message.toLowerCase().includes('what is')) {
      response += node.description;
    } else if (message.toLowerCase().includes('how')) {
      response += "This is a complex topic that requires careful consideration. Let me explain the key aspects...";
    } else {
      response += "That's an interesting question. Here's what I know about this topic...";
    }

    return {
      message: response,
      timestamp: new Date().toISOString()
    };
  }
};

export default mockNodeService; 