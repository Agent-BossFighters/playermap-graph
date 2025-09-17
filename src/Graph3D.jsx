import React, { useRef, useState, useEffect } from "react";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import { getNodeColor } from "./nodeColors";
import NodeDetailsSidebar from "./NodeDetailsSidebar";
import { NODE_COLORS } from "./nodeColors";
import * as THREE from "three";

const Graph3D = ({
  graphData,
  onNodeClick,
  onEngineStop,
  fgRef,
  children,
  selectedTriple,
  endpoint,
}) => {
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const textureCache = useRef(new Map());

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const getNodeMaterial = (node) => {
    if (textureCache.current.has(node.id)) {
      return textureCache.current.get(node.id);
    }
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);
    if (node.image) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = node.image;
      img.onload = () => {
        ctx.clearRect(0, 0, size, size);
        if (node.type === "object") {
          ctx.fillStyle = getNodeColor(node.type) + "CC";
          ctx.fillRect(0, 0, size, size);
          const ratio = Math.max(size / img.width, size / img.height);
          const w = img.width * ratio;
          const h = img.height * ratio;
          ctx.drawImage(img, size / 2 - w / 2, size / 2 - h / 2, w, h);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.clip();
          ctx.fillStyle = getNodeColor(node.type) + "CC";
          ctx.fillRect(0, 0, size, size);
          const ratio = Math.max(size / img.width, size / img.height);
          const w = img.width * ratio;
          const h = img.height * ratio;
          ctx.drawImage(img, size / 2 - w / 2, size / 2 - h / 2, w, h);
          ctx.restore();
        }
        texture.needsUpdate = true;
        if (fgRef.current) fgRef.current.emit("redraw");
      };
    } else {
      if (node.type === "object") {
        ctx.fillStyle = getNodeColor(node.type) + "CC";
        ctx.fillRect(0, 0, size, size);
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = getNodeColor(node.type) + "CC";
        ctx.fillRect(0, 0, size, size);
        ctx.restore();
      }
      const label = (node.label || "?").substring(0, 3);
      ctx.font = "bold 48px Sans-Serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, size / 2, size / 2 + 6);
    }
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    textureCache.current.set(node.id, material);
    return material;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
      onMouseMove={(e) => {
        if (containerRef.current) {
          const bounds = containerRef.current.getBoundingClientRect();
          setMousePos({
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
          });
        }
      }}
    >
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        controlType="fly"
        backgroundColor="rgba(0,0,0,0)"
        nodeLabel=""
        onNodeClick={onNodeClick}
        linkColor={() => "rgba(255, 211, 42, 0.15)"}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.0025}
        linkDirectionalParticleColor={() => "rgba(255,255,255,0.5)"}
        nodeAutoColorBy="type"
        nodeThreeObject={(node) => {
          const size = 16;
          const group = new THREE.Group();
          const material = getNodeMaterial(node);
          let mesh;
          if (node.type === "object") {
            mesh = new THREE.Mesh(
              new THREE.PlaneGeometry(size, size),
              material
            );
          } else {
            mesh = new THREE.Mesh(
              new THREE.CircleGeometry(size / 2, 48),
              material
            );
          }
          group.add(mesh);
          return group;
        }}
        onEngineStop={onEngineStop}
        onNodeHover={setHoveredNode}
        onLinkHover={setHoveredLink}
        onBackgroundClick={() => {
          setHoveredLink(null);
          setHoveredNode(null);
        }}
        onZoom={() => {
          setHoveredLink(null);
          setHoveredNode(null);
        }}
      />

      {/* Afficher le NodeDetailsSidebar */}
      {selectedTriple && (
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 30,
            width: 350,
            zIndex: 9999,
            maxHeight: "80vh",
            background: "#18181b",
            borderRadius: "10px",
            border: "3px solid #ffd32a",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
            overflowY: "auto",
          }}
        >
          <NodeDetailsSidebar
            triple={selectedTriple}
            endpoint={endpoint}
            onClose={() => onNodeClick(null)}
          />
        </div>
      )}

      {/* Rendu de tout contenu enfant comme surcouche */}
      <div style={{ position: "relative", zIndex: 2000 }}>{children}</div>

      {/* Tooltips */}
      {hoveredLink && hoveredLink.label ? (
        <div
          style={{
            position: "absolute",
            left: mousePos.x + 18,
            top: mousePos.y - 10,
            background: NODE_COLORS.PREDICATE,
            color: "#fff",
            border: `1.5px solid ${NODE_COLORS.PREDICATE}`,
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 15,
            fontWeight: "bold",
            zIndex: 10001,
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            maxWidth: 260,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {hoveredLink.label}
        </div>
      ) : hoveredNode && hoveredNode.label ? (
        <div
          style={{
            position: "absolute",
            left: mousePos.x + 18,
            top: mousePos.y - 10,
            background: "#232326",
            color: "#fff",
            border: "1.5px solid #ffd32a",
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 15,
            fontWeight: "bold",
            zIndex: 10001,
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            maxWidth: 260,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {hoveredNode.label}
        </div>
      ) : null}
    </div>
  );
};

export default Graph3D;
