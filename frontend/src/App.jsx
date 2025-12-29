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

function App() {
  const location = useLocation();
  const showHeader =
    location.pathname !== '/login' && location.pathname !== '/signup';
  const showFooter =
    location.pathname !== '/login' && location.pathname !== '/signup';

  return (
    <AuthProvider>
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
              path="/applications"
              element={
                <ProtectedRoute>
                  <Applications />
                </ProtectedRoute>
              }
            />
            {/* Add more protected routes as needed */}
            <Route path="/jobs" element={<Jobs />} />
          </Routes>
        </main>

        {showFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
