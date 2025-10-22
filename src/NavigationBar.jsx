import React from "react";
import PIGraph_icon from "./asset/PIGraph_icon.svg";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const navBtnStyle = {
  background: "#ffd32a",
  color: "#18181b",
  border: "none",
  borderRadius: 12,
  width: 54,
  height: 54,
  fontSize: 22,
  fontWeight: "bold",
  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
  cursor: "pointer",
  marginBottom: 0,
  marginTop: 0,
  textTransform: "uppercase",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  transition: "background 0.2s, color 0.2s, transform 0.1s",
};

const navBtnHoverStyle = {
  background: "#ffe066",
  color: "#18181b",
  transform: "translateY(-2px) scale(1.03)",
};

const NavigationBar = ({
  onReset,
  onBack,
  onForward,
  canGoBack,
  canGoForward,
}) => {
  // Gestion du hover avec React (sinon utiliser :hover en CSS)
  const [hovered, setHovered] = React.useState("");
  const getBtnStyle = (key) =>
    hovered === key ? { ...navBtnStyle, ...navBtnHoverStyle } : navBtnStyle;

  return (
    <div
      style={{
        position: "absolute",
        top: "5px",
        left: "8px",
        zIndex: 50,
        display: "flex",
        flexDirection: "row",
        gap: "16px",
        alignItems: "center",
      }}
    >
      {/* Espace réservé pour le bouton Profile migré vers Player-map */}
      <div
        style={{
          width: 54,
          height: 54,
          // Espace vide pour maintenir l'alignement
        }}
      />
      <button
        style={{ ...getBtnStyle("graph"), width: 54 }}
        onClick={onReset}
        aria-label="Return to graph"
        onMouseEnter={() => setHovered("graph")}
        onMouseLeave={() => setHovered("")}
      >
        <img src={PIGraph_icon} alt="PI Graph" style={{ width: 28, height: 28 }} />
      </button>
      <button
        style={{ ...getBtnStyle("prev"), opacity: !canGoBack ? 0.5 : 1 }}
        onClick={onBack}
        disabled={!canGoBack}
        aria-label="Previous"
        onMouseEnter={() => setHovered("prev")}
        onMouseLeave={() => setHovered("")}
      >
        <FaArrowLeft />
      </button>
      <button
        style={{ ...getBtnStyle("next"), opacity: !canGoForward ? 0.5 : 1 }}
        onClick={onForward}
        disabled={!canGoForward}
        aria-label="Next"
        onMouseEnter={() => setHovered("next")}
        onMouseLeave={() => setHovered("")}
      >
        <FaArrowRight />
      </button>
    </div>
  );
};

export default NavigationBar;
