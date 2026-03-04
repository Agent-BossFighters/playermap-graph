import React from "react";

const ViewModeSelector = ({ viewMode, onViewModeChange }) => {
  return (
    <div
      className="agent-navbar"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        gap: "10px",
        left: "16px",
      }}
    >
      <label htmlFor="viewMode" style={{ color: "#ffd32a"}}>
        View Mode:
      </label>
      <select
        id="viewMode"
        value={viewMode}
        onChange={(e) => onViewModeChange(e.target.value)}
        style={{
          background: "#ffd32a",
          color: "rgb(24, 24, 27)",
          borderRadius: "12px",
          height: "42px",
          padding: "6px 12px",
          fontWeight: "bold",
          fontSize: 15,
          outline: "none",
          cursor: "pointer",
        }}
      >
        <option value="2D">2D</option>
        <option value="3D">3D</option>
        <option value="VR">VR</option>
      </select>
    </div>
  );
};

export default ViewModeSelector;
