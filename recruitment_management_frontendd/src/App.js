import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import LoginPage from "./login"; // Make sure filename matches
import ManagerPage from "./ManagerPage";
import JobList from "./JobList";
import HRPage from "./HRPage";
import SuperAdmin from "./SuperAdmin"
import JobApply from  "./JobApply"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/joblist" element={<JobList />} />
        <Route path="/hr" element={<HRPage />} />
        <Route path="/superuser" element={<SuperAdmin/>}/>
       
        <Route path="/apply/:jobId" element={<JobApply/>}/>
      </Routes>
    </Router>
  );
}

export default App;

