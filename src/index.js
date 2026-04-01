// Main components
export { default as GraphVisualization } from './GraphVisualization.jsx';
export { default as GraphComponent } from './GraphVisualization.jsx'; // alias for new architecture
export { default as GraphVR } from './GraphVR.jsx';
export { default as NodeDetailsSidebar } from './NodeDetailsSidebar.jsx';
export { default as GraphLegend } from './GraphLegend.jsx';
export { default as EndpointSelector } from './EndpointSelector.jsx';
export { default as LoadingAnimation } from './LoadingAnimation.jsx';
export { default as SmartSearchInterface } from './components/SmartSearchInterface.jsx';

// PlayerMap constants store — call setPinataConstants(CUSTOM_PLAYER_MAP_CONSTANTS) at app init
let _playerMapConstants = null;
export const setPinataConstants = (constants) => {
  _playerMapConstants = constants;
};
export const getPlayerMapConstants = () => _playerMapConstants;

// Utilities
export * from './api';
export * from './graphData';
export * from './nodeColors';
