import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SuperAdmin() {
  const navigate = useNavigate();

  const [evaluators, setEvaluators] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    designation: "Manager",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Track which sidebar page is active
  const [activePage, setActivePage] = useState("evaluators");

  // Fetch all evaluators from backend
  const fetchEvaluators = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5117/api/Evaluator");
      setEvaluators(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert("Failed to fetch evaluators.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEvaluators();
  }, []);

  // Handle Add or Update form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.name || !formData.email || (!editingId && !formData.password)) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      // Prepare payload; exclude password if empty on update
      const payload = { ...formData };
      if (editingId && !payload.password) {
        delete payload.password;
      }

      console.log("Submit - editingId:", editingId);
      console.log("Submit - payload:", payload);

      if (editingId) {
        // Update existing evaluator
        console.log("Update URL:", `http://localhost:5117/api/Evaluator/${editingId}`);
        const response = await axios.put(`http://localhost:5117/api/Evaluator/${editingId}`, payload);
        console.log("Update response:", response);
        alert("Evaluator updated successfully!");
        setEditingId(null);
      } else {
        // Add new evaluator
        console.log("Add URL:", "http://localhost:5117/api/Evaluator");
        const response = await axios.post("http://localhost:5117/api/Evaluator", payload);
        console.log("Add response:", response);
        alert("Evaluator added successfully!");
      }

      setFormData({ name: "", email: "", password: "", designation: "Manager" });
      fetchEvaluators();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Submit error details:", error);
      console.error("Error response:", error.response);
      
      let errorMessage = editingId ? "Failed to update evaluator." : "Failed to add evaluator.";
      if (error.response) {
        errorMessage += ` Status: ${error.response.status}`;
        if (error.response.data) {
          errorMessage += `. Details: ${JSON.stringify(error.response.data)}`;
        }
      } else if (error.message) {
        errorMessage += ` Error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // Fill form for editing - Using camelCase property names
  const handleEdit = (ev) => {
    setEditingId(ev.evaluatorId);
    setFormData({
      name: ev.name,
      email: ev.email,
      password: "", // Keep empty to avoid overwriting unless changed
      designation: ev.designation,
    });
  };

  // Delete evaluator with better error handling
  const handleDelete = async (id) => {
    console.log("Attempting to delete evaluator with ID:", id);
    
    if (window.confirm("Are you sure you want to delete this evaluator?")) {
      try {
        setLoading(true);
        const response = await axios.delete(`http://localhost:5117/api/Evaluator/${id}`);
        console.log("Delete response:", response);
        alert("Evaluator deleted successfully!");
        fetchEvaluators();
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Delete error details:", error);
        
        let errorMessage = "Failed to delete evaluator.";
        if (error.response) {
          errorMessage += ` Status: ${error.response.status}`;
          if (error.response.data) {
            errorMessage += `. Details: ${JSON.stringify(error.response.data)}`;
          }
        } else if (error.message) {
          errorMessage += ` Error: ${error.message}`;
        }
        
        alert(errorMessage);
      }
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", password: "", designation: "Manager" });
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
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Name"
                    disabled={loading}
                  />
                </td>
                <td>
                  <input
                    style={styles.input}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Email"
                    disabled={loading}
                  />
                </td>
                <td>
                  <input
                    style={styles.input}
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={editingId ? "Enter to change password" : "Password"}
                    disabled={loading}
                  />
                </td>
                <td>
                  <select
                    style={styles.input}
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    disabled={loading}
                  >
                    <option>Manager</option>
                    <option>HR</option>
                    <option>SuperAdmin</option>
                  </select>
                </td>
                <td>
                  <button
                    style={styles.addBtn}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {editingId ? "Update" : "Add"}
                  </button>
                  {editingId && (
                    <button
                      style={styles.cancelBtn}
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && evaluators.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    No evaluators found.
                  </td>
                </tr>
              )}
              {!loading &&
                evaluators.map((ev, index) => {
                  return (
                  <tr
                    key={ev.evaluatorId}
                    style={{ 
                      background: index % 2 === 0 ? "#f9fbff" : "white",
                      ...(editingId === ev.evaluatorId ? styles.editingRow : {})
                    }}
                  >
                    <td>{ev.name}</td>
                    <td>{ev.email}</td>
                    <td>••••</td>
                    <td>{ev.designation}</td>
                    <td>
                      <button
                        style={styles.editBtn}
                        onClick={() => handleEdit(ev)}
                        disabled={loading}
                      >
                        Edit
                      </button>{" "}
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(ev.evaluatorId)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )})}
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
  input: {
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "95%",
  },
  addBtn: {
    background: "#4caf50",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "6px",
  },
  cancelBtn: {
    background: "#6c757d",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  editBtn: {
    background: "#4e8ef7",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "6px",
  },
  deleteBtn: {
    background: "#f44336",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  editingRow: {
    background: "#fff3cd !important",
    border: "2px solid #ffc107",
  },
};

export default SuperAdmin;