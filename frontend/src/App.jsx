// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileCompletionProvider } from './contexts/ProfileCompletionContext';

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
import PrivacyPolicy from './FooterPages/PrivacyPolicy';
import TermsofService from './FooterPages/TermsofService';
import CookiePolicy from './FooterPages/CookiePolicy';
import MockInterview from './features/mockInterview/MockInterview';
import EmployerDashboard from './features/Employers/EmployerDashboard';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import SavedJobs from './features/jobs/SavedJobs';
import AdminSignup from './features/admin/AdminSignup';
import AdminLogin from './features/admin/AdminLogin';
import SuperAdminDashboard from './features/super-admin/SuperAdminDashboard';
import SuperAdminAllJobs from './features/super-admin/Superadminalljobs';

function AppContent() {
  const { user } = useAuth();
  const resumes = user?.resumes?.['1'] ? [user.resumes['1']] : [];

  return (
    <ProfileCompletionProvider user={user}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
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
            <Route
              path="/saved-jobs"
              element={
                <ProtectedRoute>
                  <SavedJobs />
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

            {/* Super Admin Routes */}
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute roles={['super-admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/jobs"
              element={
                <ProtectedRoute roles={['super-admin']}>
                  <SuperAdminAllJobs />
                </ProtectedRoute>
              }
            />

            <Route path="/interview" element={<MockInterview />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsofService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/employer-dashboard" element={<EmployerDashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ProfileCompletionProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
