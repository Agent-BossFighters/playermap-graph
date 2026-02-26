import { FC } from 'react';

export interface GraphControls {
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  resetGraph: () => void;
  isSearching: boolean;
  handleSearch: (query: string, filters: { subject: string; predicate: string; object: string }) => Promise<void>;
  handleSearchStart: () => void;
}

export interface GraphVisualizationProps {
  endpoint?: string;
  onNodeSelect?: (node: any) => void;
  onLoadingChange?: (loading: boolean) => void;
  walletAddress?: string;
  gamesId?: string;
  disableNodeDetailsSidebar?: boolean;
  hideNavigationBar?: boolean;
  onControlsReady?: (controls: GraphControls) => void;
}

export interface SmartSearchInterfaceProps {
  endpoint?: string;
  onSearch: (query: string, filters: { subject: string; predicate: string; object: string }) => Promise<void>;
  isSearching: boolean;
  onSearchStart: () => void;
}

export interface NodeDetailsSidebarProps {
  selectedNode: any;
  endpoint?: string;
  onClose?: () => void;
}

export interface EndpointSelectorProps {
  endpoints: Record<string, any>;
  selectedEndpoint: string;
  onEndpointChange: (endpoint: string) => void;
}

export const GraphVisualization: FC<GraphVisualizationProps>;
export const GraphVR: FC<GraphVisualizationProps>;
export const NodeDetailsSidebar: FC<NodeDetailsSidebarProps>;
export const GraphLegend: FC;
export const EndpointSelector: FC<EndpointSelectorProps>;
export const LoadingAnimation: FC;
export const SmartSearchInterface: FC<SmartSearchInterfaceProps>;

export const ENDPOINTS: Record<string, {
  url: string;
  displayName: string;
  module: any;
}>;

export function fetchTriples(endpoint?: string): Promise<any>;
export function fetchTriplesForNode(nodeId: string, endpoint?: string): Promise<any>;
export function fetchAtomDetails(atomId: string, endpoint?: string): Promise<any>;
export function searchTriples(filters: any, endpoint?: string): Promise<any>;
