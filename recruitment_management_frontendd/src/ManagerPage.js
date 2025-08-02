import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ManagerPage() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("Jobs");

  const [jobs, setJobs] = useState([
    {
      title: "Frontend Developer",
      department: "Engineering",
      candidates: [
        { name: "John Doe", experience: "2 years", round: 1, status: "Applied" },
        { name: "Jane Smith", experience: "3 years", round: 1, status: "Applied" },
      ],
    },
    {
      title: "UI/UX Designer",
      department: "Design",
      candidates: [
        { name: "Alice Brown", experience: "4 years", round: 1, status: "Applied" },
        { name: "Bob Johnson", experience: "1 year", round: 1, status: "Applied" },
      ],
    },
  ]);

  // Move candidate to the next round
  const handleNextRound = (jobIndex, candidateIndex) => {
    setJobs((prevJobs) =>
      prevJobs.map((job, jIdx) => {
        if (jIdx === jobIndex) {
          const updatedCandidates = job.candidates.map((candidate, cIdx) => {
            if (cIdx === candidateIndex) {
              if (candidate.round < 3) {
                return {
                  ...candidate,
                  round: candidate.round + 1,
                  status:
                    candidate.round + 1 === 3
                      ? "Final Round"
                      : "Proceed to Round " + (candidate.round + 1),
                };
              } else {
                return { ...candidate, status: "Process Completed ✅" };
              }
            }
            return candidate;
          });
          return { ...job, candidates: updatedCandidates };
        }
        return job;
      })
    );
  };

  const handleLogout = () => {
    navigate("/");
  };

  const sidebarItems = ["Jobs", "Candidates", "Manager Info", "Activity"];

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>Manager Panel</h3>
        {sidebarItems.map((item) => (
          <div
            key={item}
            style={{
              ...styles.sidebarItem,
              ...(activePage === item ? styles.activeSidebarItem : {}),
            }}
            onClick={() => setActivePage(item)}
          >
            {item}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Navbar */}
        <nav style={styles.navbar}>
          <h2 style={styles.brand}>Manager Dashboard</h2>
          <div>
            <button style={styles.navButton}>Jobs</button>
            <button style={styles.navButton}>Candidates</button>
            <button style={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        {/* Jobs Page */}
        {activePage === "Jobs" && (
          <div style={styles.jobsContainer}>
            {jobs.map((job, jobIndex) => (
              <div key={jobIndex} style={styles.jobCard}>
                <h3 style={{ marginBottom: "10px" }}>{job.title}</h3>
                <p style={{ marginBottom: "20px", color: "#666" }}>{job.department}</p>
              </div>
            ))}
          </div>
        )}

        {/* Candidates Page */}
        {activePage === "Candidates" && (
          <div style={styles.jobsContainer}>
            {jobs.map((job, jobIndex) => (
              <div key={jobIndex} style={styles.jobCard}>
                <h3 style={{ marginBottom: "10px" }}>{job.title} Candidates</h3>

                <div style={styles.candidatesContainer}>
                  {job.candidates.map((candidate, candidateIndex) => (
                    <div key={candidateIndex} style={styles.candidateCard}>
                      <h4>{candidate.name}</h4>
                      <p style={{ margin: "5px 0" }}>Job: {job.title}</p>
                      <p>Round: {candidate.round}</p>
                      <span
                        style={{
                          ...styles.status,
                          backgroundColor: candidate.status.includes("Completed")
                            ? "#4caf50"
                            : candidate.status.includes("Final")
                            ? "#f57c00"
                            : "#42a5f5",
                        }}
                      >
                        {candidate.status}
                      </span>
                      {candidate.status !== "Process Completed ✅" && (
                        <button
                          style={styles.nextButton}
                          onClick={() => handleNextRound(jobIndex, candidateIndex)}
                        >
                          Move to Next Round
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Placeholder for other pages */}
        {activePage !== "Jobs" && activePage !== "Candidates" && (
          <div style={{ padding: "40px", color: "#555" }}>
            <h3>{activePage} Page</h3>
            <p>Content for {activePage} will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
  },
  sidebar: {
    width: "220px",
    backgroundColor: "#1e1e2f",
    color: "white",
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
  },
  sidebarTitle: {
    fontSize: "18px",
    fontWeight: "600",
    padding: "0 20px 20px 20px",
  },
  sidebarItem: {
    padding: "12px 20px",
    cursor: "pointer",
    transition: "0.3s",
  },
  activeSidebarItem: {
    backgroundColor: "#4e8ef7",
    borderLeft: "4px solid white",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    backgroundColor: "#fff",
    color: "#333",
    padding: "15px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  brand: { fontWeight: "600" },
  navButton: {
    marginLeft: "15px",
    padding: "8px 15px",
    backgroundColor: "#4e8ef7",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },
  logoutButton: {
    marginLeft: "15px",
    padding: "8px 15px",
    backgroundColor: "#4e8ef7",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },
  jobsContainer: {
    padding: "40px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "30px",
  },
  jobCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  candidatesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  candidateCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    padding: "15px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  status: {
    display: "inline-block",
    marginTop: "8px",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#fff",
  },
  nextButton: {
    marginTop: "10px",
    padding: "6px 12px",
    backgroundColor: "#4e8ef7",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    margin: "15px",
  },
};

export default ManagerPage;
