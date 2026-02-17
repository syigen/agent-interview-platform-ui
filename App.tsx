import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Gateway } from './pages/Gateway';
import { Dashboard } from './pages/Dashboard';
import { Templates } from './pages/Templates';
import { AgentRuns } from './pages/AgentRuns';
import { Console } from './pages/Console';
import { Interview } from './pages/Interview';
import { CertificateList } from './pages/Certificate';
import { CertificateDetail } from './pages/CertificateDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Gateway />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/templates/*" element={<Templates />} />
          <Route path="/runs" element={<AgentRuns />} />
          <Route path="/session" element={<Console />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/certificates" element={<CertificateList />} />
          <Route path="/certificate/:id" element={<CertificateDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;