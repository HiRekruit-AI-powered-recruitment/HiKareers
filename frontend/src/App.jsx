import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Apply from './pages/Apply.jsx';
import Profile from './pages/Profile.jsx';
import EditProfile from './pages/EditProfile.jsx';
import Home from './pages/Home.jsx';
import Applications from './pages/Applications.jsx';
import { isAuthenticated, getCurrentUser, logout } from './utils/auth.js';
import { authAPI } from './api.js';

export default function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = React.useRef(null);

  useEffect(() => {
    checkAuth();
    // Add event listener for storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    // Close menu when clicking outside
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const checkAuth = () => {
    const authStatus = isAuthenticated();
    setIsLoggedIn(authStatus);
    if (authStatus) {
      setUser(getCurrentUser());
    } else {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    logout();
    setIsLoggedIn(false);
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
  };
  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-glass border-b border-white/40 shadow-glass">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="text-xl font-semibold tracking-tight text-neutral-900">
              HireKruit
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`
                }
                end
              >
                Home
              </NavLink>
              {isLoggedIn && (
                <>
                  <NavLink
                    to="/applications"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                        isActive
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`
                    }
                  >
                    Applications
                  </NavLink>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                        isActive
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`
                    }
                  >
                    Profile
                  </NavLink>
                </>
              )}
              <NavLink
                to="/apply"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`
                }
              >
                Apply
              </NavLink>
            </div>
          </div>

          {/* Auth Links / User Menu */}
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-neutral-100 text-neutral-900'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="btn btn-primary btn-sm"
                >
                  Sign Up
                </NavLink>
              </>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-100 transition"
                >
                  <img
                    src={user?.profilePhoto?.imageUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user?.userName}
                    alt={user?.fullName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-neutral-200"
                  />
                  <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-200">
                      <p className="text-sm font-medium text-neutral-900">{user?.fullName}</p>
                      <p className="text-xs text-neutral-500">@{user?.userName}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/edit-profile');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition"
                    >
                      Edit Profile
                    </button>
                    <div className="border-t border-neutral-200 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/apply" element={<Apply />} />
        </Routes>
      </main>
    </div>
  );
}
