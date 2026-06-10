import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import Jobs         from './pages/Jobs';
import JobDetail    from './pages/JobDetail';
import PostJob      from './pages/PostJob';
import Applicants   from './pages/Applicants';
import CandidateProfile from './pages/CandidateProfile';
import Pipeline     from './pages/Pipeline';
import Interviews   from './pages/Interviews';
import AIRanking    from './pages/AIRanking';
import Analytics    from './pages/Analytics';
import MyApplications from './pages/MyApplications';
import ApplyJob     from './pages/ApplyJob';

// Layout
import Layout from './components/Layout';

// Route guards
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function HRRoute({ children }) {
  const { user, loading, isHR } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isHR) return <Navigate to="/my-applications" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'candidate' ? '/my-applications' : '/'} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Candidate routes */}
          <Route path="/jobs"           element={<PrivateRoute><Layout><Jobs /></Layout></PrivateRoute>} />
          <Route path="/jobs/:id/apply" element={<PrivateRoute><Layout><ApplyJob /></Layout></PrivateRoute>} />
          <Route path="/my-applications"element={<PrivateRoute><Layout><MyApplications /></Layout></PrivateRoute>} />

          {/* HR/Admin routes */}
          <Route path="/"                    element={<HRRoute><Layout><Dashboard /></Layout></HRRoute>} />
          <Route path="/jobs/:id"            element={<HRRoute><Layout><JobDetail /></Layout></HRRoute>} />
          <Route path="/post-job"            element={<HRRoute><Layout><PostJob /></Layout></HRRoute>} />
          <Route path="/edit-job/:id"        element={<HRRoute><Layout><PostJob /></Layout></HRRoute>} />
          <Route path="/applicants"          element={<HRRoute><Layout><Applicants /></Layout></HRRoute>} />
          <Route path="/applicants/:id"      element={<HRRoute><Layout><CandidateProfile /></Layout></HRRoute>} />
          <Route path="/pipeline"            element={<HRRoute><Layout><Pipeline /></Layout></HRRoute>} />
          <Route path="/interviews"          element={<HRRoute><Layout><Interviews /></Layout></HRRoute>} />
          <Route path="/ai-ranking"          element={<HRRoute><Layout><AIRanking /></Layout></HRRoute>} />
          <Route path="/analytics"           element={<HRRoute><Layout><Analytics /></Layout></HRRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
