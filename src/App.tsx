import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './routes/ProtectedRoute';

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


function App() {
  return (
    <Router>
      <Toaster />
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
