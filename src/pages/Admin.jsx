import React, { useEffect, useState } from "react";
import "../styles/Admin.css";
import axios from "axios";
import { listUsers } from '../services/api';
import AdminKeys from '../components/AdminKeys';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();
  const user = useSelector(state => state.user.user);

  // Redirect non-admin users to dashboard
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.isAdmin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch Users via frontend API helper (uses auth headers)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listUsers();
        if (mounted) setUsers(data || []);
      } catch (err) {
        console.log("Error fetching users:", err);
      }
    })();
    return () => { mounted = false; };
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
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</li>
          <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</li>
          <li className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>Reports</li>
          <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Settings</li>
          <li className={activeTab === 'keys' ? 'active' : ''} onClick={() => setActiveTab('keys')}>API Keys</li>
        </ul>

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

        {/* Content Tabs */}
        {activeTab === 'users' && (
          <>
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
          </>
        )}

        {activeTab === 'keys' && (
          <div style={{ marginTop: 24 }}>
            <AdminKeys />
          </div>
        )}
      </main>
    </div>
  );
}
