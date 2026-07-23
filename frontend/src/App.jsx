import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobOffers from './pages/JobOffers';
import JobDetails from './pages/JobDetails';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import Candidates from './pages/Candidates';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/jobs" element={
            <ProtectedRoute>
              <JobOffers />
            </ProtectedRoute>
          } />
          
          <Route path="/jobs/:id" element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/candidates" element={
            <ProtectedRoute roles={['ROLE_RECRUITER', 'ROLE_ADMIN']}>
              <Candidates />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/stats" element={
            <ProtectedRoute roles={['ROLE_RECRUITER', 'ROLE_ADMIN']}>
              <Stats />
            </ProtectedRoute>
          } />

          {/* Default fallback redirects to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
