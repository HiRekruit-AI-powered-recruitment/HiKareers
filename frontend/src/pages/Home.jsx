import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/auth.js';
import { userAPI } from '../api.js';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner.jsx';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    if (isLoggedIn) {
      loadUserData();
    }
  }, [isLoggedIn]);

  async function loadUserData() {
    try {
      setLoading(true);
      const response = await userAPI.getCurrentUser();
      if (response.success) {
        setUser(response.data);
        // Update session storage with latest user data
        sessionStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      setUser(getCurrentUser());
    } finally {
      setLoading(false);
    }
  }

  const showCompletionBanner = isLoggedIn && user && !user.profileCompleted;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Profile Completion Banner */}
        {showCompletionBanner && !loading && <ProfileCompletionBanner />}
        
        {/* Main Card */}
        <div className="card text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-100 mb-4">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
          <h1 className="text-3xl mb-3">Welcome to HireKruit</h1>
          <p className="text-neutral-600 text-lg mb-2">
            Your AI-powered recruitment platform
          </p>
          <p className="text-neutral-500 mb-8">
            Built with modern technology for a seamless hiring experience.
          </p>
          <div className="flex gap-3 justify-center">
            {!isLoggedIn ? (
              <>
                <NavLink to="/login" className="btn btn-primary">
                  Get Started
                </NavLink>
                <NavLink to="/apply" className="btn btn-secondary">
                  Apply Now
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/profile" className="btn btn-primary">
                  View Profile
                </NavLink>
                <NavLink to="/apply" className="btn btn-secondary">
                  Apply for Jobs
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
