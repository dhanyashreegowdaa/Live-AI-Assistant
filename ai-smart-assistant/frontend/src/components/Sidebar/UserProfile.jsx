// User Profile Component
import React from "react";

export default function UserProfile() {
  const user = {
    name: "Dhanyashree",
    email: "dhanya@gmail.com",
  };

  return (
    <div className="profile-container">
      <div className="profile-avatar">
        {user.name.charAt(0).toUpperCase()}
      </div>

      <div className="profile-info">
        <p className="profile-name">{user.name}</p>
        <p className="profile-email">{user.email}</p>
      </div>
    </div>
  );
}