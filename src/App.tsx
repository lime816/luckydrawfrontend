import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { WelcomeModal } from './components/WelcomeModal';

// Pages
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/Dashboard';
import { Contests } from './pages/Contests';
import { Participants } from './pages/Participants';
import { LuckyDraw } from './pages/LuckyDraw';
import { Winners } from './pages/Winners';
import { Analytics } from './pages/Analytics';
import Communication from './pages/Communication';
import { Settings } from './pages/Settings';
import { AdminManagement } from './pages/AdminManagement';
import { FlowBuilder } from './pages/FlowBuilder';

// Component to handle welcome modal
function WelcomeModalHandler() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [username, setUsername] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Check if we should show welcome modal on route change
    const shouldShow = sessionStorage.getItem('showWelcomeModal');
    const welcomeUsername = sessionStorage.getItem('welcomeUsername');
    
    if (shouldShow === 'true' && welcomeUsername) {
      setUsername(welcomeUsername);
      setShowWelcome(true);
      // Clear the flag so it doesn't show again
      sessionStorage.removeItem('showWelcomeModal');
    }
  }, [location.pathname]); // Re-check when route changes

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    sessionStorage.removeItem('welcomeUsername');
  };

  return showWelcome ? <WelcomeModal username={username} onClose={handleCloseWelcome} /> : null;
}

function App() {
  return (
    <Router>
      <Toaster />
      <WelcomeModalHandler />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="contests" element={<Contests />} />
          <Route path="flow-builder" element={<FlowBuilder />} />
          <Route path="participants" element={<Participants />} />
          <Route path="draw" element={<LuckyDraw />} />
          <Route path="winners" element={<Winners />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="communication" element={<Communication />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin-management" element={<AdminManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
