import React from "react";
import { NODE_COLORS } from "./nodeColors";

const GraphLegend = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 10,
        right: 5,
        zIndex: 1000,
      }}
    >
      <h4
        style={{
          margin: "0 0 4px 0",
          fontSize: "18px",
          color: "#ffd32a",
          fontWeight: "bold",
          letterSpacing: "0.5px",
        }}
      >
        Legend
      </h4>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          borderRadius: "10px",
          padding: "16px 16px",
        }}
      >
        <li
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#fff",
          }}
        >
          <span
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: NODE_COLORS.SUBJECT,
              borderRadius: "50%",
              display: "inline-block",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          ></span>
          <span style={{ fontSize: "15px" }}>Subject</span>
        </li>
        <li
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#fff",
          }}
        >
          <span
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: NODE_COLORS.OBJECT,
              borderRadius: "4px",
              display: "inline-block",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          ></span>
          <span style={{ fontSize: "15px" }}>Object</span>
        </li>
        <li
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#fff",
          }}
        >
          <span
            style={{
              width: "20px",
              height: "8px",
              backgroundColor: NODE_COLORS.PREDICATE,
              borderRadius: "4px",
              display: "inline-block",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          ></span>
          <span style={{ fontSize: "15px" }}>Predicate</span>
        </li>
      </ul>
    </div>
  );
};

export default GraphLegend;
