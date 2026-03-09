import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AgentMessagesPage from './pages/AgentMessages';
import Utility from './components/Utility';
import './App.css';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agent-messages" element={<AgentMessagesPage />} />
          <Route path="/utility" element={<Utility />} />
          <Route path="/logout" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    </Router>
  );
}

export default App;
