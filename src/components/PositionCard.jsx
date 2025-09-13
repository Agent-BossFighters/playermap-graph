import React from "react";
import { FaEthereum } from "react-icons/fa";

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
    <span style={{ color: "#ffd32a", fontWeight: 700, minWidth: 90 }}>
      {label}:
    </span>
    <span style={{ color: "#fff" }}>{value}</span>
  </div>
);

const AtomImage = ({ src, alt }) =>
  src ? (
    <img
      src={src}
      alt={alt}
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        objectFit: "cover",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        marginRight: 10,
      }}
    />
  ) : null;

const PositionCard = ({ position }) => {
  const vaultShares = Number(position.term?.total_market_cap || 0);
  const shares = Number(position.shares || 0);
  const currentSharePrice = Number(position.term?.current_share_price || 0);
  const account = position.account;
  const vault = position.term;
  const triple = vault?.triple;
  const atom = vault?.atom;

  return (
    <div
      style={{
        background: "#232326",
        borderRadius: 14,
        padding: "18px 24px",
        marginBottom: 18,
        boxShadow: "0 2px 12px rgba(0,0,0,0.13)",
        borderLeft: `6px solid #ffd32a`,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
      className="position-card"
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <AtomImage src={account?.image} alt={account?.label} />
        <div>
          <InfoRow label="Account" value={account?.label || account?.id} />
          <InfoRow label="Type" value={account?.type} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <AtomImage src={atom?.image} alt={atom?.label} />
        <div>
          <InfoRow label="Vault" value={vault?.term_id} />
          <InfoRow label="Atom" value={atom?.label} />
        </div>
      </div>
      <InfoRow label="Position ID" value={position.id} />
      <InfoRow label="Shares" value={shares} />
      <InfoRow label="Vault Shares" value={vaultShares} />
      <InfoRow label="Share Price" value={currentSharePrice} />
      {triple && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            background: "#18181b",
            borderRadius: 8,
          }}
        >
          <div style={{ color: "#ffd32a", fontWeight: 700, marginBottom: 6 }}>
            Triple
          </div>
          <InfoRow label="Block" value={triple.block_number} />
          <InfoRow label="Tx Hash" value={triple.transaction_hash} />
          <InfoRow label="Subject" value={triple.subject?.label} />
          <InfoRow label="Predicate" value={triple.predicate?.label} />
          <InfoRow label="Object" value={triple.object?.label} />
        </div>
      )}
    </div>
  );
};

export default PositionCard;
