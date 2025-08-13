import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./JobApply.css"; // Optional: For styling

const JobApply = () => {
  const { jobId } = useParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    college: "",
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle text field change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle skill input and tag addition
  const handleSkillKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
        setSkillInput("");
      }
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("=== STARTING APPLICATION SUBMISSION ===");
    console.log("Job ID from URL:", jobId);

    // Validation
    if (!form.name || !form.email || !form.phone || !form.experience || !form.college) {
      alert("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    if (skills.length === 0) {
      alert("Please add at least one skill");
      setIsSubmitting(false);
      return;
    }

    if (!resumeFile) {
      alert("Please upload your resume");
      setIsSubmitting(false);
      return;
    }

    // Validate jobId
    if (!jobId || isNaN(parseInt(jobId))) {
      alert("Invalid job ID. Please try again from the job list.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("Name", form.name);
    formData.append("Email", form.email);
    formData.append("Phone", form.phone);
    formData.append("Experience", parseInt(form.experience));
    formData.append("College", form.college);
    formData.append("Skills", skills.join(", "));
    formData.append("JobId", parseInt(jobId));
    
    if (resumeFile) {
      formData.append("resumeFile", resumeFile);
    }

    console.log("Form data being sent:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      console.log("Posting to: http://localhost:5117/api/Candidates ");
      
      const response = await axios.post("http://localhost:5117/api/Candidates", formData, {
        headers: {
          // Don't set Content-Type for FormData - let axios handle it
        },
        timeout: 30000, // 30 second timeout for file upload
      });
      
      console.log("✅ Application submitted successfully!");
      console.log("Response:", response.data);
      alert("Application submitted successfully!");
      
      // Clear form
      setForm({ name: "", email: "", phone: "", experience: "", college: "" });
      setSkills([]);
      setSkillInput("");
      setResumeFile(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error("❌ Application submission failed!");
      console.error("Full error object:", err);
      
      let errorMessage = "Application failed: ";
      
      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        errorMessage = "Network Error: Cannot connect to server. Is the API running on http://localhost:5117?";
      } else if (err.response) {
        console.error("Server responded with error:");
        console.error("Status:", err.response.status);
        console.error("Status Text:", err.response.statusText);
        console.error("Response Data:", err.response.data);
        console.error("Response Headers:", err.response.headers);
        
        errorMessage += `Server Error (${err.response.status}): `;
        
        if (err.response.status === 400) {
          errorMessage += "Bad Request - Check your input data";
        } else if (err.response.status === 404) {
          errorMessage += "API endpoint not found - Check if Candidate controller exists";
        } else if (err.response.status === 500) {
          errorMessage += "Internal Server Error - Check server logs";
        } else {
          errorMessage += err.response.statusText;
        }
        
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage += ` | Details: ${err.response.data}`;
          } else {
            errorMessage += ` | Details: ${JSON.stringify(err.response.data)}`;
          }
        }
      } else if (err.request) {
        console.error("Request was made but no response received:");
        console.error("Request:", err.request);
        errorMessage += "No response from server";
      } else {
        console.error("Error setting up request:", err.message);
        errorMessage += err.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="job-apply-container">
      <h2>Apply for Job ID: {jobId}</h2>
      
      {/* Show current job ID for debugging */}
      <p style={{ color: '#666', fontSize: '14px' }}>
        Applying for Job ID: {jobId} {jobId ? '✅' : '❌ Missing Job ID'}
      </p>
      
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input 
          type="text" 
          name="name" 
          placeholder="Your Name *" 
          value={form.name} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting}
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Your Email *" 
          value={form.email} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting}
        />
        
        <input 
          type="tel" 
          name="phone" 
          placeholder="Phone Number *" 
          value={form.phone} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting}
        />
        
        <input 
          type="number" 
          name="experience" 
          placeholder="Experience (years) *" 
          value={form.experience} 
          onChange={handleChange} 
          min="0" 
          max="50"
          required 
          disabled={isSubmitting}
        />
        
        <input 
          type="text" 
          name="college" 
          placeholder="Your College *" 
          value={form.college} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting}
        />
        
        {/* Skills as tags */}
        <div className="skills-input">
          <label>Skills *</label>
          <input
            type="text"
            placeholder="Add skills (press Enter or comma)"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            disabled={isSubmitting}
          />
          <div className="tags">
            {skills.map((skill, index) => (
              <span className="tag" key={index}>
                {skill} 
                <button 
                  type="button" 
                  onClick={() => removeSkill(index)}
                  disabled={isSubmitting}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {skills.length === 0 && (
            <small style={{ color: '#666' }}>Add at least one skill</small>
          )}
        </div>

        {/* Resume file */}
        <div className="file-input">
          <label>Resume *</label>
          <input 
            type="file" 
            name="resumeFile" 
            onChange={handleFileChange} 
            accept=".pdf,.doc,.docx"
            required 
            disabled={isSubmitting}
          />
          {resumeFile && (
            <small style={{ color: '#666' }}>
              Selected: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
            </small>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            padding: '12px 24px',
            backgroundColor: '#4e8ef7',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Apply'}
        </button>
      </form>
    </div>
  );
};

export default JobApply;