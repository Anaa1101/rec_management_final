import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./JobList.css";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // FIXED: Changed to HTTP to match your working API
      console.log("Fetching jobs from: http://localhost:5117/api/Job");
      const response = await axios.get("http://localhost:5117/api/Job");
      
      console.log("Jobs API Response:", response.data);
      console.log("Total jobs found:", response.data.length);
      
      if (response.data.length > 0) {
        console.log("First job structure:", response.data[0]);
      }
      
      setJobs(response.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        request: err.request
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Error Loading Jobs</h2>
        <p>Error: {error}</p>
        <button onClick={fetchJobs}>Retry</button>
      </div>
    );
  }

  return (
    <div className="job-list-container">
      <h2>Available Job Openings</h2>
      
      {jobs.length === 0 ? (
        <p>No job openings available at the moment.</p>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => {
            console.log("Rendering job:", job); // Debug each job
            
            // Handle both Pascal case (C#) and camel case (JavaScript) property names
            const jobId = job.jobId || job.JobId;
            const jobName = job.jobName || job.JobName;
            const description = job.description || job.Description;
            const type = job.type || job.Type;
            const workMode = job.workMode || job.WorkMode;
            
            return (
              <div key={jobId} className="job-card">
                <div className="job-header">
                  <h3>{jobName || 'Untitled Job'}</h3>
                  <span className="job-id">ID: {jobId}</span>
                </div>
                
                <div className="job-details">
                  <p className="job-description">
                    {description || 'No description available'}
                  </p>
                  
                  <div className="job-meta">
                    <span className="job-type">
                      <strong>Type:</strong> {type || 'Not specified'}
                    </span>
                    <span className="work-mode">
                      <strong>Work Mode:</strong> {workMode || 'Not specified'}
                    </span>
                  </div>
                </div>
                
                <div className="job-actions">
                  <Link 
                    to={`/apply/${jobId}`} 
                    className="apply-button"
                    onClick={() => console.log(`Navigating to apply for job ${jobId}`)}
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobList;