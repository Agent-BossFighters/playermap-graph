import React, { useEffect, useRef } from "react";
import ForceGraphVR from "3d-force-graph-vr";

const GraphVR = ({ graphData, onNodeClick }) => {
  const graphRef = useRef();

  useEffect(() => {
    // Attendre que le DOM soit chargé
    if (typeof window !== "undefined" && !window.AFRAME) {
      // Importer A-Frame dynamiquement
      import("aframe").then(() => {
        if (graphRef.current) {
          const graph = ForceGraphVR()(graphRef.current);
          graph.graphData(graphData);
          graph.nodeLabel((node) => node.label || node.id);
          graph.nodeAutoColorBy("group");

          if (onNodeClick) {
            graph.onNodeClick(onNodeClick);
          }
        }
      });
    } else if (graphRef.current) {
      const graph = ForceGraphVR()(graphRef.current);
      graph.graphData(graphData);
      graph.nodeLabel((node) => node.label || node.id);
      graph.nodeAutoColorBy("group");

      if (onNodeClick) {
        graph.onNodeClick(onNodeClick);
      }
    }
  }, [graphData, onNodeClick]);

  return (
    <div
      ref={graphRef}
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    />
  );
};

export default GraphVR;
