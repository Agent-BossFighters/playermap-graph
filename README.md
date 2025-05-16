# PlayerMap Graph

A React library for visualizing player graphs with 2D, 3D, and VR capabilities.

## Features

### Visualization Modes
- **2D**: Classic two-dimensional visualization with force-directed layout
- **3D**: Immersive three-dimensional visualization
- **VR**: Virtual reality mode for a fully immersive experience

### Core Features
- Interactive graph exploration (click on nodes to view their relationships)
- Smart data filtering
- Detailed view of selected nodes
- Navigation history (back/forward)
- Interactive legend for node type identification

### Advanced Features
- Smart data filtering with subject/predicate/object search
- Detailed node view with comprehensive information
- Claims and positions management
- Connection tracking (follows/followers)
- Activity history
- Multi-endpoint support (Base Mainnet, Base Testnet, Playground API)

## Installation

```
npm install playermap_graph
```

## For local usage

```bash
npm install
npm run build:lib
```

## Configuration

### Endpoints
The library supports multiple endpoints configured in `src/api.js`:
- Base Mainnet
- Base Testnet
- Playground API (OffChain)

### Agent Graph Configuration
To customize the Agent graph visualization, modify the `AGENT_OBJECT_ID` constant in:
- `src/hooks/useGraphState.js`
- `src/GraphVisualization.jsx`

## Usage

```jsx
import {
  GraphVisualization,
  GraphVR,
  NodeDetailsSidebar,
} from "playermap_graph";

function App() {
  return (
    <div>
      {/* 2D Visualization */}
      <GraphVisualization 
        endpoint="baseSepolia"
        walletAddress="0x..."
        onNodeSelect={(node) => console.log(node)}
        onLoadingChange={(loading) => console.log(loading)}
      />

      {/* VR Visualization */}
      <GraphVR />

      {/* Details Sidebar */}
      <NodeDetailsSidebar />
    </div>
  );
}
```

## Available Components

### Main Components
- `GraphVisualization`: 2D/3D graph visualization with all features
- `GraphVR`: Immersive VR visualization
- `NodeDetailsSidebar`: Detailed node sidebar
- `GraphLegend`: Interactive graph legend
- `EndpointSelector`: Endpoint selector
- `LoadingAnimation`: Loading animation

### Navigation Components
- `NavigationBar`: Main navigation bar
- `ViewModeSelector`: Visualization mode selector
- `FilterBar`: Advanced filtering bar

### Detail Components
- `ClaimCard`: Claims display
- `PositionCard`: Positions display
- `ActivityCard`: Activity display
- `FollowersCard`: Connections display

## API and Utilities

### API
- `api.js`: Main API interface
- `Base.js`: Base Mainnet implementation
- `BaseSepolia.js`: Base Testnet implementation

### Utilities
- `graphData.js`: Graph data manipulation functions
- `nodeColors.js`: Node colors configuration
- `hooks/useGraphState.js`: Graph state management

## Architecture

The library uses a modular architecture with:
- State management via React Hooks
- GraphQL communication with endpoints
- Multi-endpoint support with fallback
- Data caching system
- Performance-optimized handling of large graphs

## License

MIT
