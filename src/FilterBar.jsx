import React from "react";

const FilterBar = ({
  subjectFilter,
  predicateFilter,
  objectFilter,
  onFilterChange,
  onReset,
}) => {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <input
        className="agent-navbar"
        type="text"
        value={subjectFilter}
        onChange={(e) => onFilterChange("subject", e.target.value)}
        placeholder="Subject"
        style={{
          padding: "5px",
          borderRadius: "4px",
          border: "1px solid #ffd32a",
          fontSize: "14px",
          width: "150px",
          background: "#232326",
          color: "#fff",
        }}
      />
      <input
        className="agent-navbar"
        type="text"
        value={predicateFilter}
        onChange={(e) => onFilterChange("predicate", e.target.value)}
        placeholder="Predicate"
        style={{
          padding: "5px",
          borderRadius: "4px",
          border: "1px solid #ffd32a",
          fontSize: "14px",
          width: "150px",
          background: "#232326",
          color: "#fff",
        }}
      />
      <input
        className="agent-navbar"
        type="text"
        value={objectFilter}
        onChange={(e) => onFilterChange("object", e.target.value)}
        placeholder="Object"
        style={{
          padding: "5px",
          borderRadius: "4px",
          border: "1px solid #ffd32a",
          fontSize: "14px",
          width: "150px",
          background: "#232326",
          color: "#fff",
        }}
      />
      <button
        style={{
          background: "#ffd32a",
          color: "#18181b",
          border: "none",
          borderRadius: 14,
          width: 150,
          height: 48,
          fontSize: 17,
          fontWeight: "bolder",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          cursor: "pointer",
          textTransform: "uppercase",
          transition: "background 0.2s, color 0.2s, transform 0.1s",
          padding: "0 16px",
          letterSpacing: 1.1,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#ffe066")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffd32a")}
        onClick={onReset}
      >
        <span
          style={{ fontWeight: "bolder", fontSize: 18, letterSpacing: 1.2 }}
        >
          Reset
        </span>
      </button>
    </div>
  );
};

export default FilterBar;
