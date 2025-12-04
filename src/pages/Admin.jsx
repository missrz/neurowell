import React, { useEffect, useState } from "react";
import "../styles/Admin.css";
import axios from "axios";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch Users (You can change URL according to your backend)
  useEffect(() => {
    fetch("https://your-backend-url.com/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.log("Error:", err));
  }, []);

  // Filter search results
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-container">

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="admin-logo">Neurowell Admin</h2>

        <ul className="admin-menu">
          <li>Dashboard</li>
          <li className="active">Users</li>
          <li>Reports</li>
          <li>Settings</li>
        </ul>

        <button className="logout-btn">Logout</button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">

        <div className="admin-header">
          <h1>Users Panel</h1>

          <input
            type="text"
            placeholder="Search user..."
            className="admin-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* User Table */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User Name</th>
              <th>Email</th>
              <th>Date Joined</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">
                  No Users Found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user.id || index}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.createdAt?.slice(0, 10)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}
