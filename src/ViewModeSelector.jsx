import React, { useState, useRef } from "react";

const ViewModeSelector = ({ viewMode, onViewModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const modes = ["2D", "3D", "VR"];

  const handleSelect = (mode) => {
    onViewModeChange(mode);
    setIsOpen(false);
  };

  return (
    <div
      className="agent-navbar"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "6px",
        left: "16px",
        position: "relative",
      }}
    >
      <label htmlFor="viewMode" style={{ color: "#ffd32a", fontWeight: "bold", textTransform: "uppercase", fontSize: "16px" }}>
        VIEW
      </label>
      
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "#ffd32a",
            color: "rgb(24, 24, 27)",
            border: "none",
            borderRadius: "8px",
            height: "36px",
            padding: "4px 12px",
            fontWeight: "bold",
            fontSize: 13,
            outline: "none",
            cursor: "pointer",
            minWidth: "50px",
          }}
        >
          {viewMode}
        </button>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              left: "100%",
              top: 0,
              marginLeft: "8px",
              display: "flex",
              flexDirection: "row",
              gap: "6px",
              padding: "3px",
              zIndex: 1000,
              backdropFilter: "blur(10px)",
            }}
          >
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => handleSelect(mode)}
                style={{
                  background: mode === viewMode ? "#ffd32a" : "rgba(255, 211, 42, 0.15)",
                  color: mode === viewMode ? "rgb(24, 24, 27)" : "#ffd32a",
                  padding: "6px 12px",
                  fontWeight: "bold",
                  fontSize: 12,
                  cursor: "pointer",
                  outline: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ffd32a";
                  e.currentTarget.style.color = "rgb(24, 24, 27)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = mode === viewMode ? "#ffd32a" : "rgba(255, 211, 42, 0.15)";
                  e.currentTarget.style.color = mode === viewMode ? "rgb(24, 24, 27)" : "#ffd32a";
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewModeSelector;
