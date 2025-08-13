// HRPage.jsx
import React, { useState, useEffect ,useCallback} from "react";
import './hr.css';
import axios from "axios";


const API_BASE = "http://localhost:5117/api";

function HRPage() {

  const [activePage, setActivePage] = useState("Jobs");
  const [jobs, setJobs] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [loadingStatusMap, setLoadingStatusMap] = useState({});

  const buttonConfig = [
    { label: "✅ HIRE CANDIDATE", status: "Accepted", note: "✅ HIRED: Candidate accepted by HR - Offer letter to be sent", bg: "#28a745", hover: "#218838", textColor: "white" },
    { label: "❌ REJECT", status: "Rejected", note: "❌ NOT HIRED: Candidate rejected by HR - Does not meet final requirements", bg: "#dc3545", hover: "#c82333", textColor: "white" },
    { label: "⏸️ PUT ON HOLD", status: "On Hold", note: "⏸️ ON HOLD: Decision pending - Requires additional review or references", bg: "#ffc107", hover: "#e0a800", textColor: "#212529" }
  ];

  const [newJob, setNewJob] = useState({
    jobName: "",
    description: "",
    type: "",
    workMode: ""
  });
  

  // For Candidates page job selection
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesError, setCandidatesError] = useState(null);

  // Interview scheduling modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    recruiterId: '',
    roundNumber: 1,
    notes: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchEvaluators();
    fetchInterviews();
    fetchCandidates(); // fetch candidates at mount so Reports page shows accurate counts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Helpers -------------------------------------------------------------
  const getLocalDatetimeForInput = (date = new Date()) => {
    // returns 'YYYY-MM-DDTHH:mm' for datetime-local input (local time)
    const pad = (n) => String(n).padStart(2, "0");
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  };

  const candidateKey = (c) =>
    c?.candidateId ?? c?.CandidateId ?? c?.id ?? c?._id ?? Math.random();

  const candidateName = (c) => c?.name ?? c?.fullName ?? "Unnamed";

  const safeField = (obj, ...keys) => {
    for (const k of keys) if (obj?.[k] !== undefined) return obj[k];
    return "";
  };

  const formatInterviewDate = (iso) => {
    try {
      if (!iso) return "TBD";
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return iso;
    }
  };
  

  // Determine next round and whether scheduling allowed
  const nextRoundInfo = (candidate) => {
    const statusObj = getCandidateInterviewStatus(candidate?.candidateId);
    const status = statusObj.status ?? "Not Scheduled";
    // default: schedule round 1
    if (status === "Not Scheduled") {
      return { nextRound: 1, label: "Schedule Round 1", canSchedule: true };
    }
    if (status === "Round 1 Scheduled") {
      return { nextRound: 1, label: "Round 1 Scheduled (waiting)", canSchedule: false };
    }
    if (status === "Proceed to Round 2") {
      return { nextRound: 2, label: "Schedule Round 2", canSchedule: true };
    }
    if (status === "Round 2 Scheduled") {
      return { nextRound: 2, label: "Round 2 Scheduled (waiting)", canSchedule: false };
    }
    if (status === "Round 2 Accepted") {
      return { nextRound: 3, label: "Schedule Final Round", canSchedule: true };
    }
    if (status === "Rejected" || status === "Round 2 Rejected") {
      return { nextRound: null, label: "Rejected", canSchedule: false };
    }
    // fallback
    return { nextRound: 1, label: "Schedule Interview", canSchedule: true };
  };

  // --- API calls -----------------------------------------------------------
  const fetchJobs = async () => {
    try {
      console.log(`Fetching jobs from ${API_BASE}/Job`);
      const { data } = await axios.get(`${API_BASE}/Job`);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchEvaluators = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/Evaluator`);
      setEvaluators(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching evaluators:", err);
    }
  };

  const fetchInterviews = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/Interview`);
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching interviews:", err);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoadingCandidates(true);
      setCandidatesError(null);
      const { data } = await axios.get(`${API_BASE}/Candidates`);
      setAllCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setCandidatesError(`Failed to load candidates: ${err?.message ?? err}`);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // --- Handlers ------------------------------------------------------------
  const handleJobSelect = (job) => {
    setSelectedJob(job);
    // if candidates not yet loaded, fetch
    if (!allCandidates || allCandidates.length === 0) {
      fetchCandidates();
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!newJob.jobName || !newJob.type || !newJob.workMode) {
      alert("Please fill Job Name, Type and Work Mode.");
      return;
    }
    try {
      await axios.post(`${API_BASE}/Job`, newJob, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });
      alert("Job posted successfully!");
      setNewJob({ jobName: "", description: "", type: "", workMode: "" });
      fetchJobs();
    } catch (err) {
      console.error("Error posting job:", err);
      let message = "Failed to post job.";
      if (err.message === "Network Error") message = "Network Error: cannot reach server.";
      else if (err.response) message += ` Server responded: ${err.response.status}`;
      alert(message);
    }
  };

  const getCandidateInterviewStatus = (candidateId) => {
    // returns latest interview status for candidate
    const candidateInterviews = interviews.filter(
      (i) =>
        i?.CandidateId?.toString() === candidateId?.toString() ||
        i?.candidateId?.toString() === candidateId?.toString()
    );
    if (candidateInterviews.length === 0) return { status: "Not Scheduled", round: 0 };
    const sorted = candidateInterviews.sort((a, b) => (b.RoundNumber ?? b.roundNumber ?? 0) - (a.RoundNumber ?? a.roundNumber ?? 0));
    const latest = sorted[0];
    return {
      status: latest?.Status ?? latest?.status ?? `Round ${latest?.RoundNumber ?? latest?.roundNumber ?? "?"}`,
      round: latest?.RoundNumber ?? latest?.roundNumber ?? 0,
      interviewId: latest?.InterviewId ?? latest?.interviewId ?? latest?.id ?? null
    };
  };

  const handleScheduleInterview = (candidate) => {
    const info = nextRoundInfo(candidate);
    if (!info.canSchedule) {
      alert("Cannot schedule at this time: " + info.label);
      return;
    }

    // Check if evaluators are available for rounds 1 and 2
    if (info.nextRound !== 3 && evaluators.length === 0) {
      alert("No evaluators available. Please add evaluators first.");
      return;
    }

    setSelectedCandidate(candidate);
    const defaultRecruiterId = info.nextRound === 3 ? "" : (evaluators[0]?.evaluatorId ?? evaluators[0]?.id ?? "");
    
    setScheduleForm({
      date: "",
      recruiterId: defaultRecruiterId,
      roundNumber: info.nextRound,
      notes: ""
    });
    setShowScheduleModal(true);
  };

const handleSubmitSchedule = async (e) => {
  e.preventDefault();

  if (!scheduleForm.date) {
    alert("Please select date/time");
    return;
  }
  if (scheduleForm.roundNumber !== 3 && !scheduleForm.recruiterId) {
    alert("Please select manager for round 1/2");
    return;
  }

  const selectedDate = new Date(scheduleForm.date);
  if (selectedDate <= new Date()) {
    alert("Please select a future date/time");
    return;
  }

  const candidateId =
    selectedCandidate?.candidateId ??
    selectedCandidate?.CandidateId ??
    selectedCandidate?.id;

  const scheduledById =
    scheduleForm.roundNumber === 3
      ? null
      : scheduleForm.recruiterId || null;

  const interviewData = {
    candidateId: parseInt(candidateId),
    interviewDate: selectedDate.toISOString(), // ✅ matches DTO
    round: parseInt(scheduleForm.roundNumber), // ✅ matches DTO
    notes: scheduleForm.notes || "",
  };

  if (scheduledById !== null) {
    interviewData.scheduledById = parseInt(scheduledById); // ✅ matches DTO
  }

  try {
    console.log("Sending interview data:", interviewData);

    const response = await axios.post(
      `${API_BASE}/Interview`,
      interviewData,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    console.log("Interview scheduled successfully:", response.data);
    alert(`Round ${scheduleForm.roundNumber} scheduled successfully!`);
    setShowScheduleModal(false);
    setSelectedCandidate(null);
    setScheduleForm({
      date: "",
      recruiterId: "",
      roundNumber: 1,
      notes: "",
    });
    await fetchInterviews();
  } catch (err) {
    // 🔍 Extra debug logging
    console.error("Full error object:", err);
    console.error("Backend response data:", err.response?.data);

    let message = "Failed to schedule interview.";
    if (err.response?.data) {
      if (typeof err.response.data === "string") {
        message += ` Error: ${err.response.data}`;
      } else if (err.response.data.message) {
        message += ` Error: ${err.response.data.message}`;
      } else if (err.response.data.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        message += ` Validation errors: ${errors.join(", ")}`;
      } else {
        message += ` Server error: ${JSON.stringify(err.response.data)}`;
      }
    } else if (err.response?.status) {
      message += ` Status: ${err.response.status}`;
    } else if (err.message) {
      message += ` ${err.message}`;
    }
    alert(message);
  }
};

  const handleRemoveCandidate = async (candidateId) => {
    if (!window.confirm("Remove candidate?")) return;
    try {
      await axios.delete(`${API_BASE}/Candidates/${candidateId}`);
      alert("Candidate removed");
      fetchCandidates();
      fetchInterviews();
    } catch (err) {
      console.error("Error removing candidate:", err);
      alert("Failed to remove candidate.");
    }
  };

  // --- Derived data -------------------------------------------------------
  const filteredCandidates = selectedJob
    ? allCandidates.filter((candidate) => {
        const candidateJobId = safeField(candidate, "jobId", "JobId", "JobID");
        const selectedJobId = safeField(selectedJob, "jobId", "JobId", "JobID");
        return String(candidateJobId) === String(selectedJobId);
      })
    : [];

  function getFilteredCandidatesByStatus() {
    const cat = {
      new: [],
      round1Scheduled: [],
      round2Pending: [],
      round2Scheduled: [],
      finalRound: [],
      rejected: []
    };

    filteredCandidates.forEach((candidate) => {
      const st = getCandidateInterviewStatus(candidate?.candidateId).status;
      switch (st) {
        case "Not Scheduled":
          cat.new.push(candidate);
          break;
        case "Round 1 Scheduled":
          cat.round1Scheduled.push(candidate);
          break;
        case "Proceed to Round 2":
          cat.round2Pending.push(candidate);
          break;
        case "Round 2 Scheduled":
          cat.round2Scheduled.push(candidate);
          break;
        case "Round 2 Accepted":
          cat.finalRound.push(candidate);
          break;
        case "Rejected":
        case "Round 2 Rejected":
          cat.rejected.push(candidate);
          break;
        default:
          cat.new.push(candidate);
      }
    });

    return cat;
  }

  // Moved this function outside of getFilteredCandidatesByStatus where it belongs
  // Fixed handleUpdateInterviewStatusAndNotes function
const handleUpdateInterviewStatusAndNotes = async (interviewId, newStatus, newNotes = "") => {
  console.log("Updating interview:", interviewId, "Status:", newStatus, "Notes:", newNotes);

  if (!window.confirm(`Are you sure you want to update this interview to "${newStatus}"?`)) {
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

    const roundNumber = parseInt(interview.RoundNumber || interview.roundNumber || interview.round_number || 1);
    const actualInterviewId = interview.InterviewId || interview.interviewId || interview.interview_id || interview.id;

    const updateData = {
      candidateId: parseInt(interview.CandidateId || interview.candidateId || interview.candidate_id),
      interviewDate: interview.Date || interview.date || interview.interviewDate || interview.scheduled_date,
      round: roundNumber,
      status: newStatus,
      notes: newNotes || interview.Notes || interview.notes || ""
    };

    // Ensure date format
    if (updateData.interviewDate) {
      updateData.interviewDate = new Date(updateData.interviewDate).toISOString();
    }

    // If it's the last round (3) → POST new record with recruiterId = 2
    if (roundNumber === 3) {
      updateData.scheduledById = 2; // fixed recruiter for last round
      console.log("Creating new interview for last round:", updateData);

      const response = await axios.post(`${API_BASE}/Interview`, updateData, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      console.log("New round 3 interview created:", response.data);
      alert("New last-round interview created successfully!");
    } 
    else {
      // For rounds 1 and 2 → update
      updateData.scheduledById = parseInt(interview.RecruiterId || interview.recruiterId || interview.recruiter_id);
      console.log("Updating interview:", updateData);

      const response = await axios.put(`${API_BASE}/Interview/${actualInterviewId}`, updateData, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      console.log("Interview updated:", response.data);
      alert("Interview updated successfully!");
    }

    await fetchInterviews();

  } catch (err) {
    console.error("Error:", err);
    alert(`Failed to update interview:\n${err.message}`);
  }
};


  const handleAction = useCallback(async (interviewId, status, note) => {
    const confirmMsg = `Are you sure you want to mark this candidate as "${status}"?`;
    if (!window.confirm(confirmMsg)) return;

    setLoadingStatusMap(prev => ({ ...prev, [interviewId]: status }));

    try {
      await handleUpdateInterviewStatusAndNotes(interviewId, status, note);
      alert(`✅ Candidate status updated to "${status}"`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update status. Please try again.");
    } finally {
      setLoadingStatusMap(prev => ({ ...prev, [interviewId]: null }));
    }
  }, [handleUpdateInterviewStatusAndNotes]);

  const categorized = getFilteredCandidatesByStatus();

  const sidebarItems = ["Jobs", "Candidates", "Interviews","Last Rounds", "HR Info", "Reports"];

  // --- Render --------------------------------------------------------------
  return (
    <div className="page">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3 className="sidebarTitle">HR Panel</h3>
        {sidebarItems.map((item) => (
          <div
            key={item}
            className={`sidebarItem ${activePage === item ? 'activeSidebarItem' : ''}`}
            onClick={() => {
              setActivePage(item);
              setSelectedJob(null);
            }}
          >
            {item}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <div className="mainContent">
        <h1 className="pageHeader">HR Portal</h1>

        {/* Jobs Page */}
        {activePage === "Jobs" && (
          <div>
            <div className="section">
              <h2 className="sectionTitle">Post a New Job</h2>
              <form onSubmit={handlePostJob} className="form">
                <input
                  type="text"
                  placeholder="Job Name *"
                  value={newJob.jobName}
                  onChange={(e) => setNewJob({ ...newJob, jobName: e.target.value })}
                  className="input"
                  required
                />
                <input
                  type="text"
                  placeholder="Job Type * (e.g., Full-time)"
                  value={newJob.type}
                  onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                  className="input"
                  required
                />
                <input
                  type="text"
                  placeholder="Work Mode * (Remote / On-site / Hybrid)"
                  value={newJob.workMode}
                  onChange={(e) => setNewJob({ ...newJob, workMode: e.target.value })}
                  className="input"
                  required
                />
                <textarea
                  placeholder="Job Description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="textarea"
                  rows="4"
                />
                <button type="submit" className="button">
                  Post Job
                </button>
              </form>
            </div>

            <div className="section">
              <h2 className="sectionTitle">Current Job Openings</h2>
              {jobs.length === 0 ? (
                <p>No jobs posted yet.</p>
              ) : (
                <div className="jobGrid">
                  {jobs.map((job) => (
                    <div key={job?.jobId ?? job?.JobId ?? job?.id} className="jobCard">
                      <div className="jobTitle">{job?.jobName ?? job?.title ?? "Untitled"}</div>
                      <div className="jobInfo">Type: {job?.type ?? "-"}</div>
                      <div className="jobInfo">Mode: {job?.workMode ?? "-"}</div>
                      {job?.description && <div className="jobDescription">{job.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidates Page */}
        {activePage === "Candidates" && (
          <div>
            {!selectedJob ? (
              <div className="section">
                <h2 className="sectionTitle">Select a Job to View Candidates</h2>
                <div className="jobGrid">
                  {jobs.map((job) => (
                    <div
                      key={job?.jobId ?? job?.JobId ?? job?.id}
                      className="jobCard"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleJobSelect(job)}
                    >
                      <div className="jobTitle">{job?.jobName ?? job?.title}</div>
                      <div className="jobInfo">Type: {job?.type}</div>
                      <div className="jobInfo">Mode: {job?.workMode}</div>
                      <button className="button" style={{ marginTop: '10px' }} onClick={() => handleJobSelect(job)}>
                        View Candidates
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="section">
                  <h2 className="sectionTitle">Candidates for: {selectedJob?.jobName ?? selectedJob?.title}</h2>
                  <button className="button" style={{ marginBottom: '20px' }} onClick={() => setSelectedJob(null)}>
                    ← Back to Jobs
                  </button>

                  {loadingCandidates ? (
                    <p>Loading candidates...</p>
                  ) : candidatesError ? (
                    <p style={{ color: 'red' }}>{candidatesError}</p>
                  ) : filteredCandidates.length === 0 ? (
                    <p>No candidates found for this job.</p>
                  ) : (
                    <div>
                      {/* New */}
                      {categorized.new.length > 0 && (
                        <div className="candidateSection">
                          <h3>New Applications ({categorized.new.length})</h3>
                          <div className="candidateGrid">
                            {categorized.new.map((candidate) => (
                              <div key={candidateKey(candidate)} className="candidateCard">
                                <div className="candidateName">{candidateName(candidate)}</div>
                                <div className="candidateInfo">Email: {safeField(candidate, "email", "Email")}</div>
                                <div className="candidateInfo">Phone: {safeField(candidate, "phoneNumber", "phone", "Phone")}</div>
                                <div className="candidateInfo">Experience: {safeField(candidate, "experience", "years")}</div>
                                <div style={{ marginTop: '8px' }}>
                                  <button
                                    className="actionButton scheduleButton"
                                    onClick={() => handleScheduleInterview(candidate)}
                                  >
                                    {nextRoundInfo(candidate).label}
                                  </button>
                                  <button
                                    className="actionButton removeButton"
                                    onClick={() => handleRemoveCandidate(candidate?.candidateId)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Round 1 Scheduled */}
                      {categorized.round1Scheduled.length > 0 && (
                        <div className="candidateSection">
                          <h3>Round 1 Scheduled ({categorized.round1Scheduled.length})</h3>
                          <div className="candidateGrid">
                            {categorized.round1Scheduled.map((candidate) => (
                              <div key={candidateKey(candidate)} className="candidateCard">
                                <div className="candidateName">{candidateName(candidate)}</div>
                                <div className="candidateInfo">Email: {safeField(candidate, "email")}</div>
                                <div className="candidateInfo">Status: Round 1 Scheduled</div>
                                <div>
                                  <button
                                    className="actionButton removeButton"
                                    onClick={() => handleRemoveCandidate(candidate?.candidateId)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ready for Round 2 */}
                      {categorized.round2Pending.length > 0 && (
                        <div className="candidateSection">
                          <h3>Ready for Round 2 ({categorized.round2Pending.length})</h3>
                          <div className="candidateGrid">
                            {categorized.round2Pending.map((candidate) => (
                              <div key={candidateKey(candidate)} className="candidateCard">
                                <div className="candidateName">{candidateName(candidate)}</div>
                                <div className="candidateInfo">Email: {safeField(candidate, "email")}</div>
                                <div className="candidateInfo">Status: Passed Round 1</div>
                                <div>
                                  <button
                                    className="actionButton scheduleButton"
                                    onClick={() => handleScheduleInterview(candidate)}
                                  >
                                    {nextRoundInfo(candidate).label}
                                  </button>
                                  <button
                                    className="actionButton removeButton"
                                    onClick={() => handleRemoveCandidate(candidate?.candidateId)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Round 2 Scheduled */}
                      {categorized.round2Scheduled.length > 0 && (
                        <div className="candidateSection">
                          <h3>Round 2 Scheduled ({categorized.round2Scheduled.length})</h3>
                          <div className="candidateGrid">
                            {categorized.round2Scheduled.map((candidate) => (
                              <div key={candidateKey(candidate)} className="candidateCard">
                                <div className="candidateName">{candidateName(candidate)}</div>
                                <div className="candidateInfo">Email: {safeField(candidate, "email")}</div>
                                <div className="candidateInfo">Status: Round 2 Scheduled</div>
                                <div>
                                  <button
                                    className="actionButton removeButton"
                                    onClick={() => handleRemoveCandidate(candidate?.candidateId)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Final Round */}
                      {categorized.finalRound.length > 0 && (
                        <div className="candidateSection">
                          <h3>Ready for Final Round ({categorized.finalRound.length})</h3>
                          <div className="candidateGrid">
                            {categorized.finalRound.map((candidate) => (
                              <div key={candidateKey(candidate)} className="candidateCard">
                                <div className="candidateName">{candidateName(candidate)}</div>
                                <div className="candidateInfo">Email: {safeField(candidate, "email")}</div>
                                <div className="candidateInfo">Status: Passed Round 2</div>
                                <div>
                                  <button
                                    className="actionButton scheduleButton"
                                    onClick={() => handleScheduleInterview(candidate)}
                                  >
                                    {nextRoundInfo(candidate).label}
                                  </button>
                                  <button
                                    className="actionButton removeButton"
                                    onClick={() => handleRemoveCandidate(candidate?.candidateId)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rejected */}
                      {categorized.rejected.length > 0 && (
                        <div className="candidateSection">
                          <h3>Rejected ({categorized.rejected.length})</h3>
                          <div className="candidateGrid">
                            {categorized.rejected.map((candidate) => (
                              <div key={candidateKey(candidate)} className="candidateCard" style={{ backgroundColor: '#f8f8f8' }}>
                                <div className="candidateName">{candidateName(candidate)}</div>
                                <div className="candidateInfo">Email: {safeField(candidate, "email")}</div>
                                <div className="candidateInfo">Status: Rejected</div>
                                <div>
                                  <button
                                    className="actionButton removeButton"
                                    onClick={() => handleRemoveCandidate(candidate?.candidateId)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interviews Page */}
        {activePage === "Interviews" && (
          <div className="section">
            <h2 className="sectionTitle">All Scheduled Interviews</h2>
            {interviews.length === 0 ? (
              <p>No interviews scheduled yet.</p>
            ) : (
              <div className="candidateGrid">
                {interviews.map((interview) => {
                  const candidate = allCandidates.find(
                    (c) => String(c?.candidateId ?? c?.CandidateId ?? c?.id) === String(interview?.CandidateId ?? interview?.candidateId)
                  );
                  const evaluator = evaluators.find(
                    (e) => String(e?.evaluatorId ?? e?.EvaluatorId ?? e?.id) === String(interview?.RecruiterId ?? interview?.recruiterId)
                  );
                  return (
                    <div key={interview?.InterviewId ?? interview?.interviewId ?? interview?.id ?? Math.random()} className="candidateCard">
                      <div className="candidateName">
                        {candidate ? candidateName(candidate) : `Candidate ID: ${interview?.CandidateId ?? interview?.candidateId}`}
                      </div>
                      <div className="candidateInfo">
                        Date: {formatInterviewDate(interview?.Date ?? interview?.date)}
                      </div>
                      <div className="candidateInfo">Round: {interview?.RoundNumber ?? interview?.roundNumber ?? "-"}</div>
                      <div className="candidateInfo">Status: {interview?.Status ?? interview?.status ?? "-"}</div>
                      <div className="candidateInfo">
                        Interviewer: {(interview?.RoundNumber ?? interview?.roundNumber) === 3 ? "HR Team" : (evaluator?.name ?? evaluator?.Name ?? "TBD")}
                      </div>
                      {(interview?.Notes ?? interview?.notes) && <div className="candidateInfo">Notes: {interview?.Notes ?? interview?.notes}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Last Rounds Page - FIXED */}
        {activePage === "Last Rounds" && (
          <div className="section">
            <h2 className="sectionTitle">🎯 Final Round - HR Decision Center</h2>

            {interviews.filter(i => (i?.RoundNumber ?? i?.roundNumber) === 3).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No Final Round Interviews Yet</h3>
                <p style={{ color: '#6c757d' }}>Candidates who pass Round 2 will appear here for your final decision.</p>
              </div>
            ) : (
              <div className="candidateGrid">
                {interviews
                  .filter(i => (i?.RoundNumber ?? i?.roundNumber) === 3)
                  .map((interview) => {
                    const candidate = allCandidates.find(
                      c => String(c?.candidateId ?? c?.CandidateId ?? c?.id) === String(interview?.CandidateId ?? interview?.candidateId)
                    );
                    const interviewId = interview?.InterviewId ?? interview?.interviewId ?? interview?.id;
                    const currentStatus = interview?.Status ?? interview?.status ?? "Scheduled";
                    const isLoading = loadingStatusMap[interviewId] !== null && loadingStatusMap[interviewId] !== undefined;

                    return (
                      <div key={interviewId} className="candidateCard" style={{
                        border: '3px solid #2c5aa0',
                        borderRadius: '12px',
                        padding: '20px',
                        backgroundColor: currentStatus === 'Accepted' ? '#d4f6d4' :
                                        currentStatus === 'Rejected' ? '#f8d7da' :
                                        currentStatus === 'On Hold' ? '#fff3cd' : 'white',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ borderBottom: '2px solid #e9ecef', paddingBottom: '15px', marginBottom: '15px' }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c5aa0' }}>
                            {candidate ? candidateName(candidate) : `Candidate ID: ${interview?.CandidateId ?? interview?.candidateId}`}
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#495057', marginTop: '5px' }}>
                            🏆 FINAL ROUND CANDIDATE
                          </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                          <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                            📅 <strong>Interview Date:</strong> {formatInterviewDate(interview?.Date ?? interview?.date)}
                          </div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: currentStatus === 'Accepted' ? '#28a745' :
                                   currentStatus === 'Rejected' ? '#dc3545' :
                                   currentStatus === 'On Hold' ? '#856404' : '#6c757d',
                            marginBottom: '8px'
                          }}>
                            📊 <strong>Status:</strong> {currentStatus}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '2px solid #e9ecef', paddingTop: '15px' }}>
                          {buttonConfig.map((btn) => (
                            <button
                              key={btn.status}
                              style={{
                                backgroundColor: btn.bg,
                                color: btn.textColor,
                                fontSize: '14px',
                                fontWeight: 'bold',
                                padding: '10px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: isLoading ? 'wait' : 'pointer',
                                flex: '1',
                                minWidth: '120px',
                                opacity: isLoading ? 0.7 : 1
                              }}
                              onClick={() => handleAction(interviewId, btn.status, btn.note)}
                              disabled={isLoading}
                            >
                              {isLoading && loadingStatusMap[interviewId] === btn.status
                                ? "Processing..."
                                : btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* HR Info Page */}
        {activePage === "HR Info" && (
          <div className="section">
            <h2 className="sectionTitle">HR Information</h2>
            <p>Add company policies, procedures, and HR resources here.</p>
          </div>
        )}

        {/* Reports Page */}
        {activePage === "Reports" && (
          <div className="section">
            <h2 className="sectionTitle">Reports & Analytics</h2>
            <div className="reportsGrid">
              <div className="reportCard">
                <h4>Total Jobs</h4>
                <div className="reportNumber jobs">{jobs.length}</div>
              </div>
              <div className="reportCard">
                <h4>Total Candidates</h4>
                <div className="reportNumber candidates">{allCandidates.length}</div>
              </div>
              <div className="reportCard">
                <h4>Scheduled Interviews</h4>
                <div className="reportNumber interviews">{interviews.length}</div>
              </div>
              <div className="reportCard">
                <h4>Available Evaluators</h4>
                <div className="reportNumber evaluators">{evaluators.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interview Scheduling Modal */}
      {showScheduleModal && selectedCandidate && (
        <div className="modal">
          <div className="modalContent">
            <h3>Schedule Interview - Round {scheduleForm.roundNumber}</h3>
            <button className="closeButton" onClick={() => setShowScheduleModal(false)} type="button">×</button>

            <form onSubmit={handleSubmitSchedule} className="modalForm">
              <div className="formGroup">
                <label>Candidate: <strong>{candidateName(selectedCandidate)}</strong></label>
              </div>

              <div className="formGroup">
                <label>Interview Date & Time: *</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  className="input"
                  min={getLocalDatetimeForInput()}
                  required
                />
              </div>

              {scheduleForm.roundNumber !== 3 && (
                <div className="formGroup">
                  <label>Assign Manager: *</label>
                  <select
                    value={scheduleForm.recruiterId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, recruiterId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select Manager</option>
                    {evaluators.map((ev) => (
                      <option key={ev?.evaluatorId ?? ev?.id} value={ev?.evaluatorId ?? ev?.id}>
                        {ev?.name ?? "Unnamed"} {ev?.designation ? `- ${ev.designation}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {scheduleForm.roundNumber === 3 && (
                <div className="formGroup">
                  <label>Interviewer: <strong>HR Team (Final Round)</strong></label>
                </div>
              )}

              <div className="formGroup">
                <label>Notes (Optional):</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  className="textarea"
                  rows="3"
                  placeholder="Any special instructions..."
                />
              </div>

              <div className="modalActions">
                <button type="button" className="cancelButton" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                <button type="submit" className="submitButton">Schedule Interview</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HRPage;