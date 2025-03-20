# SGMM Front-End Application

This is a React-based front-end application for the St. Gallen Management Model (SGMM) visualization tool. The application provides an interactive interface for querying and visualizing management model concepts through a graph-based representation.

## Features

- Interactive graph visualization of management concepts
- Query interface with context-aware parameters
- Multi-layer concept exploration
- Node details panel with comprehensive information
- Interactive chat functionality for concept exploration
- Query history tracking
- Responsive and modern UI

## Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/sgmm-front-end.git
cd sgmm-front-end/front-end
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the development server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage Guide

### Query Panel
- Enter your query in the text area
- Configure context parameters:
  - Company Size (small/medium/large)
  - Industry (technology/healthcare/finance/manufacturing)
  - Management Role (executive/manager/consultant)
- Submit your query to generate the graph visualization

### Graph Visualization
- Use the layer controls (0-3) to explore different concept levels
- Toggle connections to show/hide relationships
- Click nodes to view detailed information
- Drag nodes to rearrange the graph
- Use mouse wheel to zoom in/out
- Click and drag the background to pan

### Node Details Panel
- View detailed information about selected nodes
- Access different tabs:
  - Details: Node description and relevance
  - Connections: Related concepts
  - Citations: Source references
  - Examples: Practical examples
- Use the chat feature to ask questions about specific concepts

### Query History
- Access previous queries from the history panel
- Click on historical queries to reload them

## Project Structure

```
sgmm-front-end/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   ├── graph/
│   │   ├── layout/
│   │   ├── node/
│   │   └── query/
│   ├── services/
│   ├── store/
│   │   └── slices/
│   └── data/
├── public/
└── package.json
```

## Development

### Key Technologies
- React
- Redux Toolkit for state management
- React Force Graph for visualization
- Tailwind CSS for styling

### State Management
The application uses Redux with the following slices:
- `querySlice`: Manages query state and history
- `graphSlice`: Handles graph visualization state
- `nodeSlice`: Manages selected node and details
- `chatSlice`: Controls chat functionality

## Troubleshooting

### Common Issues

1. Graph not displaying:
   - Check browser console for errors
   - Ensure all dependencies are installed
   - Verify data format in mockData.json

2. Query form not responding:
   - Clear browser cache
   - Check Redux DevTools for state updates
   - Verify form event handlers

3. Node details not loading:
   - Check network requests
   - Verify node selection in Redux state
   - Ensure mockNodeService is properly configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
