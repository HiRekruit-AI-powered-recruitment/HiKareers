import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated: loggedIn, logout } = useAuth();

  function handleLogout() {
    logout();
  }

  function handleApply() {
    navigate('/apply');
  }

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <NavLink to="/" className="text-lg font-bold text-neutral-900">HireKruit</NavLink>
          <nav className="hidden md:flex items-center gap-3">
            <NavLink to="/" className={({ isActive }) => `px-3 py-1 rounded ${isActive ? 'bg-neutral-100' : ''}`}>Home</NavLink>
            <NavLink to="/applications" className={({ isActive }) => `px-3 py-1 rounded ${isActive ? 'bg-neutral-100' : ''}`}>Applications</NavLink>
            <NavLink to="/profile" className={({ isActive }) => `px-3 py-1 rounded ${isActive ? 'bg-neutral-100' : ''}`}>Profile</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleApply} className="btn btn-primary btn-sm">Apply</button>
          {loggedIn ? (
            <>
              <span className="hidden sm:inline text-sm text-neutral-700">{user?.fullName || user?.userName}</span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="btn btn-ghost btn-sm">Login</NavLink>
              <NavLink to="/signup" className="btn btn-primary btn-sm">Sign up</NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
