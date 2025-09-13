import React from "react";

const UserRow = ({ user }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
    {user.image && (
      <img
        src={user.image}
        alt={user.label}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          objectFit: "cover",
          marginRight: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        }}
      />
    )}
    <span style={{ color: "#ffd32a", fontWeight: 600 }}>
      {user.label || user.id}
    </span>
  </div>
);

const FollowersCard = ({ follows, followers }) => (
  <div>
    <h3 style={{ color: "#ffd32a" }}>Follows</h3>
    {follows.length === 0 ? (
      <p style={{ color: "#fff" }}>No follows.</p>
    ) : (
      follows.map((f) => <UserRow key={f.object.id} user={f.object} />)
    )}
    <h3 style={{ color: "#ffd32a", marginTop: 18 }}>Followers</h3>
    {followers.length === 0 ? (
      <p style={{ color: "#fff" }}>No followers.</p>
    ) : (
      followers.map((f) => {
        const userData = {
          label: f.creator_id,
        };
        
        console.log('�� FollowersCard - userData.label:', userData.label);
        console.log('�� FollowersCard - userData complet:', userData);
        
        return <UserRow key={f.creator_id} user={userData} />;
      })
     
    )}
  </div>
);

export default FollowersCard;
