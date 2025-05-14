import React from "react";

const NavigationBar = ({
  viewMode,
  setViewMode,
  isSearchOpen,
  setIsSearchOpen,
  isChatOpen,
  setIsChatOpen,
}) => {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          style={{
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            background:
              viewMode === "2D"
                ? "rgba(255, 211, 42, 0.2)"
                : "rgba(255, 255, 255, 0.1)",
            color: viewMode === "2D" ? "#ffd32a" : "white",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onClick={() => setViewMode("2D")}
        >
          2D
        </button>
        <button
          style={{
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            background:
              viewMode === "3D"
                ? "rgba(255, 211, 42, 0.2)"
                : "rgba(255, 255, 255, 0.1)",
            color: viewMode === "3D" ? "#ffd32a" : "white",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onClick={() => setViewMode("3D")}
        >
          3D
        </button>
        <button
          style={{
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            background:
              viewMode === "VR"
                ? "rgba(255, 211, 42, 0.2)"
                : "rgba(255, 255, 255, 0.1)",
            color: viewMode === "VR" ? "#ffd32a" : "white",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onClick={() => setViewMode("VR")}
        >
          VR
        </button>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          style={{
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            background: isSearchOpen
              ? "rgba(255, 211, 42, 0.2)"
              : "rgba(255, 255, 255, 0.1)",
            color: isSearchOpen ? "#ffd32a" : "white",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          Recherche
        </button>
        <button
          style={{
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            background: isChatOpen
              ? "rgba(255, 211, 42, 0.2)"
              : "rgba(255, 255, 255, 0.1)",
            color: isChatOpen ? "#ffd32a" : "white",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          Chat
        </button>
      </div>
    </nav>
  );
};

export default NavigationBar;
