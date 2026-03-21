// src/App.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import Profile from './features/profile/Profile';
import EditProfile from './features/profile/EditProfile';
import Home from './features/home/Home';
import Apply from './features/applications/Apply';
import Applications from './features/applications/Applications';
import Jobs from './features/jobs/Jobs';
import JobDetails from './features/jobs/JobDetails';
import ChatBot from './features/chatbot/ChatBot';

import AdminDashboard from './features/admin/AdminDashboard';
import JobApplications from './features/admin/JobApplications';
import AdminApplications from './features/admin/AdminApplications';
import PostJob from './features/admin/PostJob';
import EditJob from './features/admin/EditJob';
import RecruiterJobs from './features/admin/RecruiterJobs';
import About from './FooterPages/About';
import Contact from './FooterPages/Contact';
import HelpCenter from './FooterPages/HelpCenter';

function App() {
  const location = useLocation();
  const showHeader =
    location.pathname !== '/login' && location.pathname !== '/signup';
  const showFooter =
    location.pathname !== '/login' && location.pathname !== '/signup';

  return (
    <AuthProvider>
      <ChatBot />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {showHeader && <Header />}

        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Home />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply"
              element={
                <ProtectedRoute>
                  <Apply />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply/:jobId"
              element={
                <ProtectedRoute>
                  <Apply />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <Applications />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs/new"
              element={
                <ProtectedRoute roles={['admin']}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs/:jobId/applications"
              element={
                <ProtectedRoute roles={['admin']}>
                  <JobApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <ProtectedRoute roles={['admin']}>
                  <RecruiterJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs/:jobId/edit"
              element={
                <ProtectedRoute roles={['admin']}>
                  <EditJob />
                </ProtectedRoute>
              }
            />

            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpCenter />} />
          </Routes>
        </main>

        {showFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
