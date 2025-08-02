import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import LoginPage from "./login"; // Make sure filename matches
import ManagerPage from "./ManagerPage";
import JobList from "./JobList";
import HRPage from "./HRPage";
import SuperAdmin from "./SuperAdmin"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/joblist" element={<JobList />} />
        <Route path="/hr" element={<HRPage />} />
        <Route path="/superuser" element={<SuperAdmin/>}/>
      </Routes>
    </Router>
  );
}

export default App;
