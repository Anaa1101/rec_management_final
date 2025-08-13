import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ManagerPage() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("Jobs");
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [managerInfo, setManagerInfo] = useState(null);
  const [interviews, setInterviews] = useState([]);
  
  // Get manager email from localStorage - EMAIL-BASED approach
  const [managerEmail, setManagerEmail] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.email || user.Email || null;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = "http://localhost:5117/api";

  // Fetch jobs from backend API
  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE}/Job`);
      setJobs(response.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      throw err;
    }
  };

  // Fetch candidates from backend API
  const fetchCandidates = async () => {
    try {
      const response = await axios.get(`${API_BASE}/Candidates`);
      setCandidates(response.data);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
      throw err;
    }
  };

  // Fetch interviews from backend API
  const fetchInterviews = async () => {
    try {
      const response = await axios.get(`${API_BASE}/Interview`);
      setInterviews(response.data);
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
      throw err;
    }
  };

  // Fetch manager details by EMAIL from Evaluators table
  const fetchManagerInfo = async () => {
    try {
      if (!managerEmail) {
        console.error("No manager email found in localStorage");
        return;
      }
      
      // First, get all evaluators and find the one with matching email
      const response = await axios.get(`${API_BASE}/Evaluator`);
      const evaluators = response.data;
      
      const manager = evaluators.find(evaluator => 
        (evaluator.Email || evaluator.email) === managerEmail
      );
      
      if (manager) {
        setManagerInfo(manager);
        console.log("Manager info fetched by email:", manager);
      } else {
        console.error("No manager found with email:", managerEmail);
      }
    } catch (err) {
      console.error("Failed to fetch manager info:", err);
      // Alternative: try direct endpoint if your API supports it
      try {
        const directResponse = await axios.get(`${API_BASE}/Evaluator/email/${encodeURIComponent(managerEmail)}`);
        setManagerInfo(directResponse.data);
        console.log("Manager info fetched via direct endpoint:", directResponse.data);
      } catch (directErr) {
        console.error("Direct email lookup also failed:", directErr);
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      if (!managerEmail) {
        setError("No manager email found. Please login again.");
        return;
      }
      
      setLoading(true);
      try {
        await Promise.all([
          fetchJobs(), 
          fetchCandidates(), 
          fetchInterviews(), 
          fetchManagerInfo()
        ]);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [managerEmail]);

  // Set up real-time polling for interviews (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      Promise.all([fetchCandidates(), fetchInterviews()]).catch(err => {
        console.error("Failed to refresh data:", err);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Get interviews assigned to this manager BY EMAIL
  const getMyInterviews = () => {
    console.log("All interviews:", interviews);
    console.log("Current manager email:", managerEmail);
    console.log("Manager info:", managerInfo);
    
    const myInterviews = interviews.filter(interview => {
      // Check if this interview belongs to the current manager
      const recruiterId = interview.RecruiterId || interview.recruiterId;
      const roundNumber = interview.RoundNumber || interview.roundNumber;
      
      // If we have manager info, match by recruiter ID
      if (managerInfo && recruiterId === (managerInfo.EvaluatorId || managerInfo.evaluatorId)) {
        return roundNumber <= 2; // Only rounds 1 and 2
      }
      
      // Alternative: if your interview data includes recruiter email directly
      const recruiterEmail = interview.RecruiterEmail || interview.recruiterEmail;
      if (recruiterEmail === managerEmail && roundNumber <= 2) {
        return true;
      }
      
      return false;
    });
    
    console.log("My interviews (by email):", myInterviews);
    return myInterviews;
  };

  // Get candidate details by ID
  const getCandidateById = (candidateId) => {
    return candidates.find(c => 
      (c.candidateId || c.CandidateId || c.id) === candidateId
    );
  };

  // Get job details by candidate
  const getJobByCandidate = (candidate) => {
    if (!candidate) return null;
    const jobId = candidate.jobId || candidate.JobId;
    return jobs.find(j => (j.jobId || j.JobId || j.id) === jobId);
  };

  // Update interview status - with EMAIL verification
  const handleUpdateInterviewStatus = async (interviewId, newStatus) => {
    console.log("Updating interview:", interviewId, "to status:", newStatus);
    
    if (!window.confirm(`Are you sure you want to update status to: ${newStatus}?`)) {
      return;
    }

    try {
      const interview = interviews.find(i =>
        (i.InterviewId || i.interviewId || i.interview_id || i.id) === interviewId
      );

      if (!interview) {
        alert("Interview not found");
        return;
      }

      // Verify this interview belongs to the current manager by EMAIL/ID
      const interviewRecruiterId = interview.RecruiterId || interview.recruiterId;
      const currentManagerId = managerInfo?.EvaluatorId || managerInfo?.evaluatorId;
      
      if (interviewRecruiterId !== currentManagerId) {
        alert("You can only update interviews assigned to you");
        return;
      }

      const actualInterviewId = interview.InterviewId || interview.interviewId || interview.interview_id || interview.id;

      const updateData = {
        InterviewId: actualInterviewId,
        CandidateId: interview.CandidateId || interview.candidateId || interview.candidate_id,
        RecruiterId: interview.RecruiterId || interview.recruiterId || interview.recruiter_id,
        Status: newStatus,
        Notes: interview.Notes || interview.notes || "",
        Date: interview.Date || interview.date || interview.scheduled_date,
        RoundNumber: interview.RoundNumber || interview.roundNumber || interview.round_number || 1
      };

      console.log("Sending update data:", updateData);

      const response = await axios.put(`${API_BASE}/Interview/${actualInterviewId}`, updateData, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("Update response:", response.data);
      alert(`Status updated to: ${newStatus}`);
      await fetchInterviews();

    } catch (err) {
      console.error("Failed to update interview:", err);
      
      let errorMessage = "Unknown error occurred";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        if (err.response.data.error) {
          errorMessage += `\n${err.response.data.error}`;
        }
      } else if (err.response?.data) {
        errorMessage = typeof err.response.data === 'string' 
          ? err.response.data 
          : JSON.stringify(err.response.data, null, 2);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Failed to update status: ${errorMessage}`);
    }
  };

  // Alternative function to update both status and notes
  const handleUpdateInterviewStatusAndNotes = async (interviewId, newStatus, newNotes = "") => {
    console.log("Updating interview:", interviewId, "Status:", newStatus, "Notes:", newNotes);
    
    if (!window.confirm(`Are you sure you want to update this interview?`)) {
      return;
    }

    try {
      const interview = interviews.find(i =>
        (i.InterviewId || i.interviewId || i.interview_id || i.id) === interviewId
      );

      if (!interview) {
        alert("Interview not found");
        return;
      }

      const interviewRecruiterId = interview.RecruiterId || interview.recruiterId || interview.recruiter_id;
      const currentManagerId = managerInfo?.EvaluatorId || managerInfo?.evaluatorId;
      
      if (interviewRecruiterId !== currentManagerId) {
        alert("You can only update interviews assigned to you");
        return;
      }

      const actualInterviewId = interview.InterviewId || interview.interviewId || interview.interview_id || interview.id;

      const updateData = {
        InterviewId: actualInterviewId,
        CandidateId: interview.CandidateId || interview.candidateId || interview.candidate_id,
        RecruiterId: interview.RecruiterId || interview.recruiterId || interview.recruiter_id,
        Status: newStatus,
        Notes: newNotes || interview.Notes || interview.notes || "",
        Date: interview.Date || interview.date || interview.scheduled_date,
        RoundNumber: interview.RoundNumber || interview.roundNumber || interview.round_number || 1
      };

      console.log("Sending status and notes update:", updateData);

      const response = await axios.put(`${API_BASE}/Interview/${actualInterviewId}`, updateData, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("Update response:", response.data);
      alert(`Interview updated successfully!`);
      await fetchInterviews();

    } catch (err) {
      console.error("Failed to update interview:", err.response?.data);
      
      let errorMessage = "Unknown error occurred";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        if (err.response.data.error) {
          errorMessage += `\n${err.response.data.error}`;
        }
      } else if (err.response?.data) {
        errorMessage = typeof err.response.data === 'string' 
          ? err.response.data 
          : JSON.stringify(err.response.data, null, 2);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Failed to update interview: ${errorMessage}`);
    }
  };

  // Group candidates by job
  const getCandidatesByJob = (jobId) => {
    return candidates.filter(candidate => candidate.jobId === jobId);
  };

  // Format interview date
  const formatInterviewDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    } catch {
      return dateStr;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Round 1 Scheduled":
      case "Round 2 Scheduled":
        return "#42a5f5";
      case "Proceed to Round 2":
      case "Round 2 Accepted":
        return "#4caf50";
      case "Rejected":
      case "Round 2 Rejected":
        return "#f44336";
      default:
        return "#757575";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data on logout
    navigate("/");
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchJobs(), 
        fetchCandidates(), 
        fetchInterviews(),
        fetchManagerInfo()
      ]);
      setError(null);
    } catch (err) {
      setError("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  // Show error if no email found
  if (!managerEmail) {
    return (
      <div style={styles.loginError}>
        <h2>Authentication Error</h2>
        <p>No manager email found. Please login again.</p>
        <button style={styles.loginButton} onClick={() => navigate("/")}>
          Go to Login
        </button>
      </div>
    );
  }

  const sidebarItems = ["Jobs", "Candidates", "My Interviews", "Manager Info", "Activity"];

  return (
    <div style={styles.page}>
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

      <div style={styles.mainContent}>
        <nav style={styles.navbar}>
          <h2 style={styles.brand}>
            Manager Dashboard
            {managerInfo && (
              <span style={styles.managerWelcome}> - Welcome, {managerInfo.Name}</span>
            )}
          </h2>
          <div style={styles.navControls}>
            <div style={styles.emailDisplay}>
              Logged in as: {managerEmail}
            </div>
            <button style={styles.navButton} onClick={() => setActivePage("Jobs")}>
              Jobs
            </button>
            <button style={styles.navButton} onClick={() => setActivePage("Candidates")}>
              Candidates
            </button>
            <button style={styles.navButton} onClick={() => setActivePage("My Interviews")}>
              My Interviews
            </button>
            <button style={styles.refreshButton} onClick={handleRefresh}>
              Refresh
            </button>
            <button style={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        {loading && <p style={styles.loadingText}>Loading data...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {/* Jobs Page */}
        {activePage === "Jobs" && !loading && (
          <div style={styles.jobsContainer}>
            <div style={styles.pageHeader}>
              <h2>Available Jobs</h2>
              <p style={styles.subtitle}>Total Jobs: {jobs.length}</p>
            </div>
            {jobs.map((job) => {
              const jobCandidates = getCandidatesByJob(job.jobId);
              return (
                <div key={job.jobId} style={styles.jobCard}>
                  <h3>{job.jobName}</h3>
                  <p>{job.description}</p>
                  <p>
                    <strong>Type:</strong> {job.type} | <strong>Work Mode:</strong> {job.workMode}
                  </p>
                  <div style={styles.jobStats}>
                    <span style={styles.candidateCount}>
                      {jobCandidates.length} Candidates Applied
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Candidates Page */}
        {activePage === "Candidates" && !loading && (
          <div style={styles.jobsContainer}>
            <div style={styles.pageHeader}>
              <h2>All Candidates</h2>
              <p style={styles.subtitle}>
                Total Candidates: {candidates.length} | 
                Last Updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
            
            {jobs.map((job) => {
              const jobCandidates = getCandidatesByJob(job.jobId);
              
              if (jobCandidates.length === 0) return null;
              
              return (
                <div key={job.jobId} style={styles.jobCard}>
                  <h3>{job.jobName} Candidates</h3>
                  <p style={styles.jobDescription}>{job.description}</p>
                  <div style={styles.candidatesContainer}>
                    {jobCandidates.map((candidate) => (
                      <div key={candidate.candidateId} style={styles.candidateCard}>
                        <div style={styles.candidateHeader}>
                          <h4>{candidate.name}</h4>
                          <span style={styles.candidateId}>ID: {candidate.candidateId}</span>
                        </div>
                        
                        <div style={styles.candidateInfo}>
                          <p><strong>Email:</strong> {candidate.email}</p>
                          {candidate.phone && <p><strong>Phone:</strong> {candidate.phone}</p>}
                          <p><strong>Experience:</strong> {candidate.experience} years</p>
                          {candidate.college && <p><strong>College:</strong> {candidate.college}</p>}
                          <p><strong>Skills:</strong> {candidate.skills}</p>
                        </div>

                        {candidate.resumeFilePath && (
                          <div style={styles.resumeSection}>
                            <small>Resume: {candidate.resumeFilePath}</small>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {candidates.length === 0 && (
              <div style={styles.emptyState}>
                <h3>No Candidates Found</h3>
                <p>No candidates have applied yet.</p>
              </div>
            )}
          </div>
        )}

        {/* My Interviews Page */}
        {activePage === "My Interviews" && !loading && (
          <div style={styles.jobsContainer}>
            <div style={styles.pageHeader}>
              <h2>My Scheduled Interviews</h2>
              <p style={styles.subtitle}>
                Total Interviews: {getMyInterviews().length} | 
                Last Updated: {new Date().toLocaleTimeString()}
              </p>
            </div>

            {getMyInterviews().length === 0 ? (
              <div style={styles.emptyState}>
                <h3>No Interviews Scheduled</h3>
                <p>You don't have any interviews scheduled at the moment.</p>
                <div style={styles.debugInfo}>
                  <h4>Debug Information:</h4>
                  <p><strong>Manager Email:</strong> {managerEmail}</p>
                  <p><strong>Manager ID:</strong> {managerInfo?.EvaluatorId || 'Not loaded'}</p>
                  <p><strong>Total Interviews in System:</strong> {interviews.length}</p>
                  <p><strong>Manager Info Status:</strong> {managerInfo ? 'Loaded' : 'Not loaded'}</p>
                </div>
              </div>
            ) : (
              <div style={styles.interviewsGrid}>
                {getMyInterviews().map((interview) => {
                  const candidate = getCandidateById(
                    interview.CandidateId || interview.candidateId
                  );
                  const job = getJobByCandidate(candidate);
                  const roundNumber = interview.RoundNumber || interview.roundNumber;
                  const status = interview.Status || interview.status;
                  const interviewId = interview.InterviewId || interview.interviewId || interview.id;

                  return (
                    <div key={interviewId} style={styles.interviewCard}>
                      <div style={styles.interviewHeader}>
                        <h3>{candidate?.name || "Unknown Candidate"}</h3>
                        <span style={styles.roundBadge}>Round {roundNumber}</span>
                      </div>

                      <div style={styles.interviewDetails}>
                        <p><strong>Job:</strong> {job?.jobName || "Unknown Job"}</p>
                        <p><strong>Email:</strong> {candidate?.email || "N/A"}</p>
                        <p><strong>Phone:</strong> {candidate?.phone || candidate?.phoneNumber || "N/A"}</p>
                        <p><strong>Experience:</strong> {candidate?.experience || "N/A"} years</p>
                        <p><strong>Interview Date:</strong> {formatInterviewDate(interview.Date || interview.date)}</p>
                        
                        <div style={styles.currentStatus}>
                          <strong>Current Status: </strong>
                          <span 
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: getStatusColor(status)
                            }}
                          >
                            {status}
                          </span>
                        </div>

                        {(interview.Notes || interview.notes) && (
                          <p><strong>Notes:</strong> {interview.Notes || interview.notes}</p>
                        )}
                      </div>

                      {/* Action buttons based on current status and round */}
                      <div style={styles.interviewActions}>
                        {(status === "Scheduled" || status === "Round 1 Scheduled") && roundNumber === 1 && (
                          <>
                            <button
                              style={{...styles.actionButton, ...styles.approveButton}}
                              onClick={() => handleUpdateInterviewStatus(interviewId, "Proceed to Round 2")}
                            >
                              ✓ Approve for Round 2
                            </button>
                            <button
                              style={{...styles.actionButton, ...styles.rejectButton}}
                              onClick={() => handleUpdateInterviewStatus(interviewId, "Rejected")}
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}

                        {(status === "Scheduled" || status === "Round 2 Scheduled") && roundNumber === 2 && (
                          <>
                            <button
                              style={{...styles.actionButton, ...styles.approveButton}}
                              onClick={() => handleUpdateInterviewStatus(interviewId, "Round 2 Accepted")}
                            >
                              ✓ Accept for Final Round
                            </button>
                            <button
                              style={{...styles.actionButton, ...styles.rejectButton}}
                              onClick={() => handleUpdateInterviewStatus(interviewId, "Round 2 Rejected")}
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}

                        {(status === "Proceed to Round 2" || status === "Round 2 Accepted" || 
                          status === "Rejected" || status === "Round 2 Rejected") && (
                          <div style={styles.completedStatus}>
                            <span>✅ Decision Made: {status}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Manager Info Page */}
        {activePage === "Manager Info" && !loading && (
          <div style={styles.managerInfoContainer}>
            <div style={styles.pageHeader}>
              <h2>Manager Information</h2>
              <p style={styles.subtitle}>Personal Details and Account Information</p>
            </div>

            {managerInfo ? (
              <div style={styles.managerInfoCard}>
                <div style={styles.managerInfoHeader}>
                  <div style={styles.managerAvatar}>
                    {managerInfo.Name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.managerBasicInfo}>
                    <h2>{managerInfo.Name}</h2>
                    <p style={styles.designation}>{managerInfo.Designation}</p>
                  </div>
                </div>

                <div style={styles.managerInfoDetails}>
                  <div style={styles.infoRow}>
                    <div style={styles.infoLabel}>
                      <strong>Manager ID:</strong>
                    </div>
                    <div style={styles.infoValue}>
                      {managerInfo.EvaluatorId}
                    </div>
                  </div>

                  <div style={styles.infoRow}>
                    <div style={styles.infoLabel}>
                      <strong>Full Name:</strong>
                    </div>
                    <div style={styles.infoValue}>
                      {managerInfo.Name}
                    </div>
                  </div>

                  <div style={styles.infoRow}>
                    <div style={styles.infoLabel}>
                      <strong>Email Address:</strong>
                    </div>
                    <div style={styles.infoValue}>
                      <a href={`mailto:${managerInfo.Email}`} style={styles.emailLink}>
                        {managerInfo.Email}
                      </a>
                    </div>
                  </div>

                  <div style={styles.infoRow}>
                    <div style={styles.infoLabel}>
                      <strong>Designation:</strong>
                    </div>
                    <div style={styles.infoValue}>
                      {managerInfo.Designation}
                    </div>
                  </div>

                  <div style={styles.infoRow}>
                    <div style={styles.infoLabel}>
                      <strong>Total Interviews Assigned:</strong>
                    </div>
                    <div style={styles.infoValue}>
                      {getMyInterviews().length} interviews
                    </div>
                  </div>

                  <div style={styles.infoRow}>
                    <div style={styles.infoLabel}>
                      <strong>Active Status:</strong>
                    </div>
                    <div style={styles.infoValue}>
                      <span style={styles.activeStatus}>🟢 Active</span>
                    </div>
                  </div>
                </div>

                {/* Additional Stats Section */}
                <div style={styles.statsSection}>
                  <h3>Interview Statistics</h3>
                  <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                      <div style={styles.statNumber}>{getMyInterviews().length}</div>
                      <div style={styles.statLabel}>Total Interviews</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statNumber}>
                        {getMyInterviews().filter(i => (i.Status || i.status) === "Scheduled").length}
                      </div>
                      <div style={styles.statLabel}>Pending Interviews</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statNumber}>
                        {getMyInterviews().filter(i => 
                          ["Proceed to Round 2", "Round 2 Accepted"].includes(i.Status || i.status)
                        ).length}
                      </div>
                      <div style={styles.statLabel}>Approved</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statNumber}>
                        {getMyInterviews().filter(i => 
                          ["Rejected", "Round 2 Rejected"].includes(i.Status || i.status)
                        ).length}
                      </div>
                      <div style={styles.statLabel}>Rejected</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <h3>Manager Information Not Available</h3>
                <p>Unable to load manager details. Please try refreshing the page.</p>
                <button style={styles.refreshButton} onClick={handleRefresh}>
                  Refresh Data
                </button>
              </div>
            )}
          </div>
        )}

        {/* Activity Page Placeholder */}
        {activePage === "Activity" && (
          <div style={styles.placeholderContent}>
            <h3>Activity Page</h3>
            <p>Recent activity and logs will appear here.</p>
            <div style={styles.debugInfo}>
              <h4>Current Manager Context:</h4>
              <p><strong>Email:</strong> {managerEmail}</p>
              <p><strong>Manager ID:</strong> {managerInfo?.EvaluatorId || 'Not loaded'}</p>
              <p><strong>Manager Name:</strong> {managerInfo?.Name || 'Not loaded'}</p>
              <p><strong>Designation:</strong> {managerInfo?.Designation || 'Not loaded'}</p>
            </div>
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
    borderRadius: "0 25px 25px 0",
    margin: "2px 0",
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
    flexWrap: "wrap",
  },
  brand: { 
    fontWeight: "600",
    margin: 0,
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  managerWelcome: {
    fontSize: "16px",
    fontWeight: "400",
    color: "#666",
    marginLeft: "10px",
  },
  navControls: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  emailDisplay: {
    fontSize: "14px",
    color: "#666",
    backgroundColor: "#f8f9fa",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #e9ecef",
  },
  navButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "0.3s",
  },
  refreshButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "0.3s",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "0.3s",
  },
  loadingText: {
    color: "#666",
    textAlign: "center",
    padding: "20px",
    fontSize: "16px",
  },
  errorText: {
    color: "#d32f2f",
    textAlign: "center",
    padding: "20px",
    fontSize: "16px",
    backgroundColor: "#ffebee",
    border: "1px solid #ffcdd2",
    borderRadius: "8px",
    margin: "20px",
  },
  loginError: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  loginButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "20px",
  },
  pageHeader: {
    padding: "30px 40px 20px 40px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e9ecef",
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "14px",
    margin: "5px 0 0 0",
  },
  jobsContainer: {
    padding: "0",
    flex: 1,
  },
  jobCard: {
    backgroundColor: "#fff",
    margin: "20px 40px",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e9ecef",
  },
  jobDescription: {
    color: "#6c757d",
    fontSize: "14px",
    marginBottom: "20px",
  },
  jobStats: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  candidateCount: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  candidatesContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  candidateCard: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },
  candidateHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  candidateId: {
    backgroundColor: "#6c757d",
    color: "white",
    fontSize: "11px",
    padding: "4px 8px",
    borderRadius: "12px",
  },
  candidateInfo: {
    fontSize: "14px",
    lineHeight: "1.5",
  },
  resumeSection: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    fontSize: "12px",
    color: "#6c757d",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 40px",
    color: "#6c757d",
  },
  debugInfo: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    marginTop: "20px",
    textAlign: "left",
    fontSize: "14px",
    border: "1px solid #e9ecef",
  },
  interviewsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
    padding: "20px 40px",
  },
  interviewCard: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e9ecef",
  },
  interviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #e9ecef",
    paddingBottom: "15px",
  },
  roundBadge: {
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "12px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "500",
  },
  interviewDetails: {
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "20px",
  },
  currentStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "15px",
  },
  statusBadge: {
    color: "white",
    fontSize: "12px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "500",
  },
  interviewActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  actionButton: {
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "0.3s",
    flex: 1,
    minWidth: "120px",
  },
  approveButton: {
    backgroundColor: "#28a745",
    color: "white",
  },
  rejectButton: {
    backgroundColor: "#dc3545",
    color: "white",
  },
  completedStatus: {
    backgroundColor: "#f8f9fa",
    padding: "12px",
    borderRadius: "6px",
    textAlign: "center",
    color: "#28a745",
    fontWeight: "500",
    fontSize: "14px",
    width: "100%",
  },
  managerInfoContainer: {
    padding: "0",
    flex: 1,
  },
  managerInfoCard: {
    backgroundColor: "#fff",
    margin: "20px 40px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e9ecef",
    overflow: "hidden",
  },
  managerInfoHeader: {
    display: "flex",
    alignItems: "center",
    padding: "30px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #e9ecef",
  },
  managerAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "bold",
    marginRight: "20px",
  },
  managerBasicInfo: {
    flex: 1,
  },
  designation: {
    color: "#6c757d",
    fontSize: "16px",
    margin: "5px 0 0 0",
  },
  managerInfoDetails: {
    padding: "30px",
  },
  infoRow: {
    display: "flex",
    padding: "15px 0",
    borderBottom: "1px solid #f1f3f5",
  },
  infoLabel: {
    width: "200px",
    color: "#495057",
    fontSize: "14px",
  },
  infoValue: {
    flex: 1,
    color: "#212529",
    fontSize: "14px",
  },
  emailLink: {
    color: "#007bff",
    textDecoration: "none",
  },
  activeStatus: {
    color: "#28a745",
    fontWeight: "500",
  },
  statsSection: {
    margin: "30px 0 0 0",
    padding: "30px",
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #e9ecef",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  statCard: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  placeholderContent: {
    padding: "40px",
    textAlign: "center",
    color: "#6c757d",
  },
};

export default ManagerPage;