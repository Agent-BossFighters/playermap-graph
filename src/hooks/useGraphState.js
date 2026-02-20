import { useState, useCallback, useRef } from "react";
import { fetchTriples, fetchTriplesForNode, searchTriples, fetchTriplesForAgent } from "../api";
import { transformToGraphData } from "../graphData";

// ID de l'objet agent par défaut (ID bidon pour test)
const DEFAULT_AGENT_OBJECT_ID = "0x5dc0a2335c12343d8e0f71b62a73fbf70d06fcbaf647f57d82a189873ad90da3"; // ID bidon pour test

export const useGraphState = (endpoint, graphType = "base", gamesId, onNodeSelect) => {
  // Utiliser gamesId si fourni, sinon utiliser la valeur par défaut
  const AGENT_OBJECT_ID = gamesId || DEFAULT_AGENT_OBJECT_ID;
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [initialGraphData, setInitialGraphData] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedTriple, setSelectedTriple] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [graphHistory, setGraphHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const searchTimeoutRef = useRef(null);

  // Filtres
  const [subjectFilter, setSubjectFilter] = useState("");
  const [predicateFilter, setPredicateFilter] = useState("");
  const [objectFilter, setObjectFilter] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [shouldSearch, setShouldSearch] = useState(false);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      let triples;
      if (graphType === "agent") {
        triples = await fetchTriplesForAgent(AGENT_OBJECT_ID, endpoint);
      } else {
        triples = await fetchTriples(endpoint);
      }
      const baseGraphData = transformToGraphData(triples);
      setGraphData(baseGraphData);
      setInitialGraphData(baseGraphData);
      
      setGraphHistory([{ graphData: baseGraphData, selectedTriple: null }]);
      setCurrentHistoryIndex(0);
    } catch (error) {
      console.error("Error loading graph data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, graphType]);

  const resetGraph = useCallback(() => {
    setGraphData(initialGraphData);
    setSelectedTriple(null);
    setSubjectFilter("");
    setPredicateFilter("");
    setObjectFilter("");
    setShouldSearch(false);
    
    // Réinitialiser l'historique à la vue de départ
    setGraphHistory([{ graphData: initialGraphData, selectedTriple: null }]);
    setCurrentHistoryIndex(0);
  }, [initialGraphData]);

  const handleNodeClick = useCallback(
    async (node, fgRef, viewMode) => {
      if (node === null) {
        setSelectedTriple(null);
        return;
      }

      setSelectedTriple(node);

      // Appeler onNodeSelect si fourni
      if (onNodeSelect) {
        onNodeSelect(node);
      }

      if (fgRef && fgRef.current) {
        try {
          const nodePosition = {
            x: node.x,
            y: node.y,
            z: node.z || 0,
          };

          const filteredTriples = await fetchTriplesForNode(node.id, endpoint);
          const newGraphData = transformToGraphData(filteredTriples);

          const targetNode = newGraphData.nodes.find((n) => n.id === node.id);
          if (targetNode) {
            targetNode.x = nodePosition.x;
            targetNode.y = nodePosition.y;
            if (viewMode === "3D") targetNode.z = nodePosition.z;

            targetNode.fx = nodePosition.x;
            targetNode.fy = nodePosition.y;
            if (viewMode === "3D") targetNode.fz = nodePosition.z;
          }

          // Ajouter l'état ACTUEL à l'historique AVANT de changer vers le nouveau
          setGraphHistory((prevHistory) => {
            const updatedHistory = prevHistory.slice(
              0,
              currentHistoryIndex + 1
            );
            // Sauvegarder l'état actuel pour pouvoir y revenir
            updatedHistory.push({ graphData: newGraphData, selectedTriple: node });
            return updatedHistory;
          });
          setCurrentHistoryIndex((prevIndex) => prevIndex + 1);

          setGraphData(newGraphData);
        } catch (error) {
          console.error("Error fetching triples:", error);
        }
      }
    },
    [endpoint, graphData, currentHistoryIndex]
  );

  const handleFilterChange = useCallback((type, value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    switch (type) {
      case "subject":
        setSubjectFilter(value);
        break;
      case "predicate":
        setPredicateFilter(value);
        break;
      case "object":
        setObjectFilter(value);
        break;
      default:
        break;
    }

    searchTimeoutRef.current = setTimeout(() => {
      setShouldSearch(true);
    }, 500);
  }, []);

  const applyFilters = useCallback(async () => {
    if (!shouldSearch) return;

    if (!subjectFilter && !predicateFilter && !objectFilter) {
      resetGraph();
      return;
    }

    setIsSearching(true);
    try {
      const filters = {
        subject: subjectFilter,
        predicate: predicateFilter,
        object: objectFilter
      };

      const searchResults = await searchTriples(filters, endpoint);

      if (!searchResults || searchResults.length === 0) {
        setGraphData({ nodes: [], links: [] });
        return;
      }

      const newGraphData = transformToGraphData(searchResults);
      setGraphData(newGraphData);

      setGraphHistory((prevHistory) => {
        const updatedHistory = prevHistory.slice(0, currentHistoryIndex + 1);
        updatedHistory.push({ graphData: newGraphData, selectedTriple: null });
        return updatedHistory;
      });
      setCurrentHistoryIndex((prevIndex) => prevIndex + 1);
    } catch (error) {
      console.error("Error searching triples:", error);
    } finally {
      setIsSearching(false);
      setShouldSearch(false);
    }
  }, [
    subjectFilter,
    predicateFilter,
    objectFilter,
    endpoint,
    resetGraph,
    currentHistoryIndex,
    shouldSearch,
  ]);

  const goBack = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const { graphData, selectedTriple } =
        graphHistory[currentHistoryIndex - 1];
      setGraphData(graphData);
      setSelectedTriple(selectedTriple);
      setCurrentHistoryIndex((prevIndex) => prevIndex - 1);
    }
  }, [currentHistoryIndex, graphHistory]);

  const goForward = useCallback(() => {
    if (currentHistoryIndex < graphHistory.length - 1) {
      const { graphData, selectedTriple } =
        graphHistory[currentHistoryIndex + 1];
      setGraphData(graphData);
      setSelectedTriple(selectedTriple);
      setCurrentHistoryIndex((prevIndex) => prevIndex + 1);
    }
  }, [currentHistoryIndex, graphHistory]);

  return {
    graphData,
    initialGraphData,
    isInitialLoad,
    selectedTriple,
    isLoading,
    isSearching,
    subjectFilter,
    predicateFilter,
    objectFilter,
    shouldSearch,
    canGoBack: currentHistoryIndex > 0,
    canGoForward: currentHistoryIndex < graphHistory.length - 1,
    setSelectedTriple,
    setIsInitialLoad,
    loadInitialData,
    resetGraph,
    handleNodeClick,
    handleFilterChange,
    applyFilters,
    goBack,
    goForward,
    setGraphData,
    graphHistory,
    setGraphHistory,
    currentHistoryIndex,
    setCurrentHistoryIndex
  };
};
