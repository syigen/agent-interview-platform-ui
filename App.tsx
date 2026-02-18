
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store/store';
import { setSession } from './store/slices/authSlice';
import { AuthService } from './services/AuthService';

import { Gateway } from './pages/Gateway';
import { Dashboard } from './pages/Dashboard';
import { Templates } from './pages/Templates';
import { AgentRuns } from './pages/AgentRuns';
import { Agents } from './pages/Agents';
import { AgentProfileDetail } from './pages/AgentProfile';
import { Console } from './pages/Console';
import { Interview } from './pages/Interview';
import { CertificateList } from './pages/Certificate';
import { CertificateDetail } from './pages/CertificateDetail';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import AgentInterviews from './pages/AgentInterviews';
import PublicAgentProfile from './pages/PublicAgentProfile';
import PublicCertificate from './pages/PublicCertificate';
import { ProtectedRoute } from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Initialize session check
    AuthService.getSession().then(({ session }) => {
      dispatch(setSession({ session, user: session?.user ?? null }));
    });

    // Listen for changes
    const { data: { subscription } } = AuthService.onAuthStateChange((_event, session) => {
      dispatch(setSession({ session, user: session?.user ?? null }));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Gateway />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/public/agents/:id" element={<PublicAgentProfile />} />
      <Route path="/public/certificates/:id" element={<PublicCertificate />} />
      <Route path="/interview" element={<Interview />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/templates/*" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
      <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
      <Route path="/agents/:id" element={<ProtectedRoute><AgentProfileDetail /></ProtectedRoute>} />
      <Route path="/agents/:id" element={<ProtectedRoute><AgentProfileDetail /></ProtectedRoute>} />
      <Route path="/interviews" element={<ProtectedRoute><AgentRuns /></ProtectedRoute>} />
      <Route path="/session" element={<ProtectedRoute><Console /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute><CertificateList /></ProtectedRoute>} />
      <Route path="/certificate/:id" element={<ProtectedRoute><CertificateDetail /></ProtectedRoute>} />
      <Route path="/session" element={<ProtectedRoute><Console /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;