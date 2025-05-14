import React from "react";
import { useGraphState } from "./useGraphState";

const FilterBar = () => {
  const { filters, setFilters, nodeTypes, linkTypes, clearFilters } =
    useGraphState();

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Filtrer par nom..."
          value={filters.name || ""}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={filters.nodeType || ""}
          onChange={(e) => setFilters({ ...filters, nodeType: e.target.value })}
          className="filter-select"
        >
          <option value="">Tous les types de nœuds</option>
          {nodeTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <select
          value={filters.linkType || ""}
          onChange={(e) => setFilters({ ...filters, linkType: e.target.value })}
          className="filter-select"
        >
          <option value="">Tous les types de liens</option>
          {linkTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <button onClick={clearFilters} className="clear-filters-btn">
        Effacer les filtres
      </button>

      <style jsx>{`
        .filter-bar {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .filter-group {
          flex: 1;
        }

        .filter-input,
        .filter-select {
          width: 100%;
          padding: 0.5rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.2);
          color: white;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .filter-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: rgba(255, 211, 42, 0.5);
          box-shadow: 0 0 0 2px rgba(255, 211, 42, 0.2);
        }

        .filter-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .clear-filters-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          background: rgba(255, 211, 42, 0.2);
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-filters-btn:hover {
          background: rgba(255, 211, 42, 0.3);
        }

        .clear-filters-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default FilterBar;
