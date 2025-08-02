// JobList.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function JobList() {
  const navigate = useNavigate();

  const jobs = [
    {
      title: "Frontend Developer",
      description: "Work with React.js, TailwindCSS, and modern UI libraries.",
    },
    {
      title: "Backend Developer",
      description: "Build robust APIs using Node.js, Express, and MongoDB.",
    },
    {
      title: "UI/UX Designer",
      description: "Design sleek user interfaces and improve user experience.",
    },
    {
      title: "Data Analyst",
      description: "Analyze company data and generate actionable insights.",
    },
  ];

  // State to manage form popup
  const [showForm, setShowForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");
  const [formData, setFormData] = useState({ name: "", age: "", resume: "" });

  const handleApply = (jobTitle) => {
    setSelectedJob(jobTitle);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`✅ Application Submitted for ${selectedJob}\nName: ${formData.name}\nAge: ${formData.age}\nResume: ${formData.resume}`);
    setShowForm(false);
    setFormData({ name: "", age: "", resume: "" });
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h2 style={styles.brand}>Available Jobs</h2>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          Back to Login
        </button>
      </nav>

      <div style={styles.jobsContainer}>
        {jobs.map((job, index) => (
          <div key={index} style={styles.jobCard}>
            <h3>{job.title}</h3>
            <p style={{ color: "#555" }}>{job.description}</p>
            <button style={styles.applyButton} onClick={() => handleApply(job.title)}>
              Apply Now
            </button>
          </div>
        ))}
      </div>

      {/* Form Popup */}
      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Apply for {selectedJob}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <input
                type="number"
                name="age"
                placeholder="Your Age"
                value={formData.age}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <input
                type="url"
                name="resume"
                placeholder="Resume Link"
                value={formData.resume}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={styles.submitButton}>Submit</button>
                <button type="button" style={styles.cancelButton} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎨 Styles
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#e6f0ff,#c2e9fb)",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    width: "100%",
    padding: "15px 40px",
    background: "rgba(20, 20, 30, 0.85)",
    backdropFilter: "blur(10px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
    fontWeight: "600",
  },
  brand: {
    fontWeight: "600",
  },
  backButton: {
    padding: "8px 15px",
    backgroundColor: "#4e8ef7",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "70px",
  },
  jobsContainer: {
    padding: "40px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
  },
  jobCard: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  applyButton: {
    marginTop: "15px",
    padding: "10px 15px",
    backgroundColor: "#4e8ef7",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.3s",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "350px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  submitButton: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#4e8ef7",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  cancelButton: {
    flex: 1,
    padding: "10px",
    backgroundColor: "gray",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default JobList;
