<<<<<<< HEAD
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 class="text-3xl font-bold underline">Welcome to HiRekruit Careers</h1>
    </>
  );
}

export default App;
=======
// src/App.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import Profile from './features/profile/Profile';
import EditProfile from './features/profile/EditProfile';
import Home from './features/home/Home';
import Apply from './features/applications/Apply';
import Applications from './features/applications/Applications';

function App() {
  const location = useLocation();
  const showHeader = location.pathname !== '/login' && location.pathname !== '/signup';

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {showHeader && <Header />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
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
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
>>>>>>> origin/shubh_goel
