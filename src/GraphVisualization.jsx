import React, { useEffect, useRef, useState } from "react";
import GraphLegend from "./GraphLegend";
import GraphVR from "./GraphVR";
import NodeDetailsSidebar from "./NodeDetailsSidebar";
import LoadingAnimation from "./LoadingAnimation";
import FilterBar from "./FilterBar";
import Graph2D from "./Graph2D";
import Graph3D from "./Graph3D";
import NavigationBar from "./components/NavigationBar";
import ViewModeSelector from "./ViewModeSelector";
import { useGraphState } from "./hooks/useGraphState";
import Drawer from "./components/Drawer";
import SidebarDrawer from "./components/SidebarDrawer";
import {
  fetchClaimsByAccount,
  fetchTriplesByCreator,
  searchTriples,
} from "./api";
import ClaimCard from "./components/ClaimCard";
import PositionCard from "./components/PositionCard";
import SmartSearchInterface from "./components/SmartSearchInterface";
import { transformToGraphData } from "./graphData";
import ChatBox from "./components/ChatBox";

const ACCOUNT_ID = "0xddfff342ce2547338b0f689aa3ec86893340fbdf";
const AGENT_OBJECT_ID = 24537; // À remplacer par l'ID réel de l'agent

const GraphVisualization = ({ endpoint, walletAddress }) => {
  const fgRef = useRef();
  const containerRef = useRef();
  const [viewMode, setViewMode] = React.useState("2D");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(null);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [claims, setClaims] = React.useState([]);
  const [positions, setPositions] = React.useState([]);
  const [isSmartSearching, setIsSmartSearching] = useState(false);
  const [isLocalSearching, setIsSearching] = useState(false);
  const [useLocalData, setUseLocalData] = useState(false);
  const [localGraphData, setLocalGraphData] = useState(null);
  const [graphType, setGraphType] = React.useState("agent");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const {
    graphData: hookGraphData,
    isInitialLoad,
    selectedTriple,
    isLoading,
    isSearching: hookIsSearching,
    subjectFilter,
    objectFilter,
    shouldSearch,
    canGoBack,
    canGoForward,
    setSelectedTriple,
    setIsInitialLoad,
    loadInitialData,
    resetGraph,
    handleNodeClick,
    handleFilterChange,
    applyFilters,
    goBack,
    goForward,
    setGraphData: hookSetGraphData,
    graphHistory,
    setGraphHistory,
    currentHistoryIndex,
    setCurrentHistoryIndex,
  } = useGraphState(endpoint, graphType);

  const graphData =
    useLocalData && localGraphData ? localGraphData : hookGraphData;
  const isSearchingActive = isLocalSearching || hookIsSearching;

  useEffect(() => {
    console.log("GraphData updated:", graphData);
  }, [graphData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData, graphType]);

  useEffect(() => {
    if (shouldSearch) {
      setUseLocalData(false);
      applyFilters();
    }
  }, [shouldSearch, applyFilters]);

  const handleEngineStop = () => {
    if (isInitialLoad && fgRef.current) {
      setIsInitialLoad(false);
    }
  };

  React.useEffect(() => {
    if (drawerOpen && activeTab === "claims") {
      fetchClaimsByAccount(ACCOUNT_ID, endpoint).then(setClaims);
    }
  }, [drawerOpen, activeTab, endpoint]);

  React.useEffect(() => {
    if (drawerOpen && activeTab === "positions") {
      fetchTriplesByCreator(ACCOUNT_ID, endpoint).then(setPositions);
    }
  }, [drawerOpen, activeTab, endpoint]);

  const handleSearch = async (results) => {
    console.log("Search results received:", results);

    try {
      if (results && results.length > 0) {
        if (
          graphHistory &&
          setGraphHistory &&
          typeof setGraphHistory === "function"
        ) {
          setGraphHistory((prevHistory) => {
            const updatedHistory = prevHistory.slice(
              0,
              currentHistoryIndex + 1
            );
            updatedHistory.push({ graphData, selectedTriple: null });
            return updatedHistory;
          });

          if (typeof setCurrentHistoryIndex === "function") {
            setCurrentHistoryIndex((prevIndex) => prevIndex + 1);
          }
        }

        const newGraphData = transformToGraphData(results);
        console.log("New graph data created:", newGraphData);

        setLocalGraphData(newGraphData);
        setUseLocalData(true);
        console.log("Graph data updated");
      } else {
        console.log("No results found");
        setLocalGraphData({ nodes: [], links: [] });
        setUseLocalData(true);
      }
    } catch (error) {
      console.error("Error in handleSearch:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchStart = () => {
    console.log("Search starting...");
    setIsSearching(true);
  };

  const handleFullReset = () => {
    setUseLocalData(false);
    resetGraph();
  };

  const handleSimpleFilterChange = (type, value) => {
    setUseLocalData(false);
    handleFilterChange(type, value);
  };

  const handleAfterSmartSearch = () => {
    if (useLocalData) {
      setUseLocalData(false);
    }
  };

  const tabs = [
    { key: null, label: "Map" },
    { key: "connections", label: "Connections" },
    { key: "positions", label: "Positions" },
    { key: "claims", label: "Claims" },
    { key: "activity", label: "Activity" },
  ];

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setDrawerOpen(!!tabKey);
  };

  const getDrawerContent = () => {
    switch (activeTab) {
      case "claims":
        return (
          <>
            <h2>Claims</h2>
            {claims.length === 0 ? (
              <p style={{ color: "#fff" }}>No claims found.</p>
            ) : (
              <div>
                {claims.map((claim) => (
                  <ClaimCard key={claim.id} claim={claim} />
                ))}
              </div>
            )}
          </>
        );
      case "positions":
        return (
          <>
            <h2>Positions</h2>
            {positions.length === 0 ? (
              <p style={{ color: "#fff" }}>No positions found.</p>
            ) : (
              <div>
                {positions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            )}
          </>
        );
      case "activity":
        return (
          <>
            <h2>Activity</h2>
            <p>Activity content here...</p>
          </>
        );
      case "connections":
        return (
          <>
            <h2>Connections</h2>
            <p>Connections content here...</p>
          </>
        );
      default:
        return null;
    }
  };

  // Contenu du sidebar
  const sidebarContent = (
    <>
      <h2>Mon Profil</h2>
      <p>Nom : Utilisateur de base</p>
      <p>Email : user@email.com</p>
      <p>Rôle : Joueur</p>
      <button
        style={{
          background: "#ffd32a",
          color: "#18181b",
          border: "none",
          borderRadius: 8,
          padding: "10px 18px",
          fontWeight: "bold",
          marginTop: 20,
          cursor: "pointer",
        }}
        onClick={() => setSidebarOpen(false)}
      >
        Fermer
      </button>
    </>
  );

  // Composant de sélection du type de graphique
  const GraphTypeSelector = () => (
    <div
      style={{
        display: "none",
        alignItems: "center",
        backgroundColor: "#27272a",
        padding: "8px 12px",
        borderRadius: 8,
        marginLeft: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <span style={{ color: "white", marginRight: 10, fontSize: 14 }}>
        Graph Type:
      </span>
      <select
        value={graphType}
        onChange={(e) => setGraphType(e.target.value)}
        style={{
          backgroundColor: "#3f3f46",
          color: "white",
          border: "none",
          padding: "4px 8px",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        <option value="base">Base</option>
        <option value="agent">Agent</option>
      </select>
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#18181b",
        color: "white",
      }}
    >
      <NavigationBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
      />

      <FilterBar />

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "calc(100vh - 140px)",
        }}
      >
        {viewMode === "2D" && (
          <Graph2D
            ref={fgRef}
            graphData={graphData}
            onNodeClick={handleNodeClick}
            onEngineStop={handleEngineStop}
          />
        )}
        {viewMode === "3D" && (
          <Graph3D
            graphData={graphData}
            onNodeClick={handleNodeClick}
            onEngineStop={handleEngineStop}
            fgRef={fgRef}
          />
        )}
        {viewMode === "VR" && (
          <GraphVR
            graphData={graphData}
            onNodeClick={handleNodeClick}
            onEngineStop={handleEngineStop}
          />
        )}
      </div>

      {selectedNode && (
        <NodeDetailsSidebar
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {isSearchOpen && (
        <SmartSearchInterface
          onClose={() => setIsSearchOpen(false)}
          onSearch={handleSearch}
          onSearchStart={handleSearchStart}
        />
      )}

      {isChatOpen && <ChatBox onClose={() => setIsChatOpen(false)} />}

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={activeTab}
      >
        {getDrawerContent()}
      </Drawer>

      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        content={sidebarContent}
      />
    </div>
  );
};

export default GraphVisualization;
