import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SuperAdmin() {
  const navigate = useNavigate();
  const [evaluators, setEvaluators] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", designation: "Manager" });
  const [editingId, setEditingId] = useState(null);

  // Track which sidebar page is active
  const [activePage, setActivePage] = useState("evaluators");

  const fetchEvaluators = async () => {
    const res = await axios.get("http://localhost:5117/api/evaluator");
    setEvaluators(res.data);
  };

  useEffect(() => {
    fetchEvaluators();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`http://localhost:5117/api/evaluator/${editingId}`, formData);
      setEditingId(null);
    } else {
      await axios.post("http://localhost:5117/api/evaluator", formData);
    }
    setFormData({ name: "", email: "", password: "", designation: "Manager" });
    fetchEvaluators();
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Super Admin</h2>
        <button
          style={{
            ...styles.sidebarBtn,
            ...(activePage === "evaluators" ? styles.activeSidebarBtn : {}),
          }}
          onClick={() => setActivePage("evaluators")}
        >
          Evaluators
        </button>
        <button
          style={{
            ...styles.sidebarBtn,
            ...(activePage === "activity" ? styles.activeSidebarBtn : {}),
          }}
          onClick={() => setActivePage("activity")}
        >
          Activity
        </button>
        <button
          style={{
            ...styles.sidebarBtn,
            ...(activePage === "settings" ? styles.activeSidebarBtn : {}),
          }}
          onClick={() => setActivePage("settings")}
        >
          Settings
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Top Navbar */}
        <div style={styles.navbar}>
          <div></div>
          <div>
            <button style={styles.navBtn} onClick={() => navigate("/")}>
              Dashboard
            </button>
            <button style={styles.navBtn} onClick={() => navigate("/")}>
              Logout
            </button>
          </div>
        </div>

        <h2 style={{ margin: "20px 0" }}>Manage Evaluators</h2>

        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Designation</th>
                <th>Actions</th>
              </tr>
              <tr>
                <td>
                  <input
                    style={styles.input}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Name"
                  />
                </td>
                <td>
                  <input
                    style={styles.input}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email"
                  />
                </td>
                <td>
                  <input
                    style={styles.input}
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password"
                  />
                </td>
                <td>
                  <select
                    style={styles.input}
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  >
                    <option>Manager</option>
                    <option>HR</option>
                    <option>SuperAdmin</option>
                  </select>
                </td>
                <td>
                  <button style={styles.addBtn} onClick={handleSubmit}>
                    {editingId ? "Update" : "Add"}
                  </button>
                </td>
              </tr>
            </thead>
            <tbody>
              {evaluators.map((ev, index) => (
                <tr key={ev.id} style={{ background: index % 2 === 0 ? "#f9fbff" : "white" }}>
                  <td>{ev.name}</td>
                  <td>{ev.email}</td>
                  <td>••••</td>
                  <td>{ev.designation}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: "flex", height: "100vh" },
  sidebar: {
    width: "220px",
    background: "#1c1c2b",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sidebarTitle: { marginBottom: "20px" },
  sidebarBtn: {
    background: "transparent",
    color: "white",
    border: "none",
    padding: "10px",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: "6px",
    transition: "0.3s",
  },
  activeSidebarBtn: {
    background: "#4e8ef7",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "white",
    padding: "10px 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  navBtn: {
    marginLeft: "10px",
    background: "#4e8ef7",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #ffffff, #f0f9ff, #dbeafe)",
  },
  card: {
    background: "white",
    margin: "20px",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  input: { padding: "6px", border: "1px solid #ccc", borderRadius: "6px", width: "95%" },
  addBtn: { background: "#4caf50", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" },
};

export default SuperAdmin;
