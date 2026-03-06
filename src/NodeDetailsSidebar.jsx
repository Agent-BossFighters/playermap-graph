import React, { useEffect, useState } from "react";
import { fetchTriples, fetchAtomDetails } from "./api";
import { getAtomVerificationStatus } from "./config/verifiedAtoms";

const NodeDetailsSidebar = ({ triple, endpoint, onClose }) => {
  const [additionalData, setAdditionalData] = useState(null);
  const [atomDetails, setAtomDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!triple) return;

    setLoading(true);
    setError(null);
    setAtomDetails(null);

    const fetchData = async () => {
      try {
        const response = await fetchTriples(endpoint);
        const filteredData = response.filter(
          (item) =>
            item.id === triple.id ||
            item.subject?.id === triple.id ||
            item.predicate?.id === triple.id ||
            item.object?.id === triple.id
        );
        setAdditionalData(filteredData);

        if (triple.id) {
          const atomData = await fetchAtomDetails(
            triple.id,
            endpoint
          );
          setAtomDetails(atomData);
        }
      } catch (err) {
        console.error("Error fetching sidebar data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [triple, endpoint]);

  const formatShares = (shares) => `${(shares / 1e18).toFixed(4)} ETH`;

  if (!triple) {
    return null;
  }


  const truncateId = (id, start = 4, end = 4) => {
    if (!id || id.length <= start + end) return id;
    return `${id.slice(0, start)}...${id.slice(-end)}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Optionnel : afficher un toast de confirmation
    } catch (err) {
      console.error('Error copying ID:', err);
    }
  };

  return (
    <div
      style={{
        background: "#18181b",
        borderRadius: "10px",
        border: "2px solid #ffd32a",
        padding: "24px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
        color: "#fff",
        maxWidth: "400px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "24px",
            color: "#ffd32a",
            fontWeight: "bold",
            letterSpacing: "0.5px",
          }}
        >
          {triple.label || "No Label"}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#ffd32a",
            fontSize: "24px",
            cursor: "pointer",
            padding: "4px",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {atomDetails && (() => {
        const verification = getAtomVerificationStatus(atomDetails.id);
        
        // Pour les atomes non-vérifiés, on ne doit JAMAIS afficher l'image
        if (verification.status === "not-verified") {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                backgroundColor: "rgba(248, 113, 113, 0.15)",
                border: "2px solid #f87171",
                borderRadius: "8px",
                padding: "12px",
                textAlign: "center",
                width: "100%",
                margin: "24px 0",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#fecaca",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                ⚠ Community-Created
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#fca5a5",
                  lineHeight: "1.4",
                }}
              >
                This atom is community-created and has not been reviewed or approved by the rights holder.
              </p>
            </div>
          );
        }
        
        // Pour les autres statuts, on affiche l'image seulement si elle existe
        if (!atomDetails.image) return null;
        
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              margin: "24px 0",
              gap: "12px",
            }}
          >
            {verification.status === "verified" ? (
              // ─── ATOME VÉRIFIÉ ───────────────────────────────────
              <>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#27AE60",
                    color: "#fff",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>✓</span>
                  <span>Verified by {verification.studio}</span>
                </div>
                <img
                  src={atomDetails.image}
                  alt={atomDetails.label || "Node image"}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #ffd32a",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                />
              </>
            ) : (
              // ─── COMPORTEMENT NORMAL ──────────────────────────────
              <img
                src={atomDetails.image}
                alt={atomDetails.label || "Node image"}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #ffd32a",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              />
            )}
          </div>
        );
      })()}

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#ffd32a",
          }}
        >
          Loading...
        </div>
      )}

      {error && (
        <div
          style={{
            color: "#ff4444",
            padding: "12px",
            background: "rgba(255,68,68,0.1)",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {atomDetails && (
        <div
          style={{
            background: "#232326",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <h4
            style={{
              color: "#ffd32a",
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            Atom Info
          </h4>
          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            <div>
              <span style={{ color: "#ffd32a", fontWeight: "bold" }}>ID:</span>{" "}
              <span 
                style={{ 
                cursor: "pointer", 
                textDecoration: "underline",
                color: "#ffd32a"
              }}
              onClick={() => copyToClipboard(atomDetails.term_id)}
              title={`Cliquer pour copier: ${atomDetails.term_id}`}
            >
              {truncateId(atomDetails.term_id)}
            </span>
          </div>
            <div>
              <span style={{ color: "#ffd32a", fontWeight: "bold" }}>
                Label:
              </span>{" "}
              {atomDetails.label}
            </div>
            <div>
              <span style={{ color: "#ffd32a", fontWeight: "bold" }}>
                Type:
              </span>{" "}
              {atomDetails.type}
            </div>
            <div>
              <span style={{ color: "#ffd32a", fontWeight: "bold" }}>Creator:</span>{" "}
              <span 
                style={{ 
                  cursor: "pointer", 
                  textDecoration: "underline",
                  color: "#ffd32a"
                }}
                onClick={() => copyToClipboard(atomDetails.creator_id)}
                title={`Cliquer pour copier: ${atomDetails.creator_id}`}
              >   
                {truncateId(atomDetails.creator_id)}
              </span>
            </div>
            <div>
              <span style={{ color: "#ffd32a", fontWeight: "bold" }}>
                Vault Shares:
              </span>{" "}
              {formatShares(atomDetails.vault?.total_shares || 0)}
            </div>
          </div>
        </div>
      )}

      {additionalData && additionalData.length > 0 && (
        <div
          style={{
            background: "#232326",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <h4
            style={{
              color: "#ffd32a",
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            Related Data
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {additionalData.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "12px",
                  background: "#18181b",
                  borderRadius: "6px",
                  border: "1px solid #ffd32a33",
                }}
              >
                <div>
                  <span style={{ color: "#ffd32a", fontWeight: "bold" }}>
                    Subject:
                  </span>{" "}
                  {item.subject?.label}
                </div>
                <div>
                  <span style={{ color: "#ffd32a", fontWeight: "bold" }}>
                    Predicate:
                  </span>{" "}
                  {item.predicate?.label}
                </div>
                <div>
                  <span style={{ color: "#ffd32a", fontWeight: "bold" }}>
                    Object:
                  </span>{" "}
                  {item.object?.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !additionalData?.length && (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#888",
            background: "#232326",
            borderRadius: "8px",
          }}
        >
          No additional related data found.
        </div>
      )}
    </div>
  );
};

export default NodeDetailsSidebar;
