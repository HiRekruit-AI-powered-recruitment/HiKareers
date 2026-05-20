import React, { useState } from 'react';
import {
  Menu,
  X,
  Briefcase,
  User,
  FileText,
  LogOut,
  ChevronDown,
  Bookmark,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/hikareers_logo.png';
import { useAuth } from '../contexts/AuthContext.jsx';

// Updated Header Component
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated: loggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.userType === 'admin';

  function handleLogout() {
    logout();
  }

  function handleApply() {
    navigate('/apply');
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <img src={logo} alt="HiKareers Logo" className="h-12 w-auto" />
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href={isAdmin ? '/admin-dashboard' : '/'}
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              Home
            </a>
            <a
              href={isAdmin ? '/admin/jobs' : '/jobs'}
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              Jobs
            </a>
            {loggedIn && !isAdmin && (
              <a
                href="/applications"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                Applications
              </a>
            )}

            {isAdmin && (
              <>
                <a
                  href="/admin/applications"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  Job Applicants
                </a>
                <a
                  href="/admin/jobs/new"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  Post Job
                </a>
              </>
            )}
            {!isAdmin && (
              <a
                href="/interview"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                Mock Interview
              </a>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {loggedIn ? (
              <>
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    {user?.profilePhoto?.imageUrl ? (
                      <img
                        src={user.profilePhoto.imageUrl}
                        alt={user?.fullName || 'User'}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}

                    <span className="font-medium text-sm max-w-32 truncate">
                      {user?.fullName || user?.userName}
                    </span>

                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <a
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">My Profile</span>
                    </a>
                    {!isAdmin && (
                      <a
                        href="/applications"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">My Applications</span>
                      </a>
                    )}
                    {!isAdmin && (
                      <a
                        href="/saved-jobs"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span className="text-sm">Saved Jobs</span>
                      </a>
                    )}
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-2">
              <a
                href={isAdmin ? '/admin-dashboard' : '/'}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Home
              </a>
              <a
                href={isAdmin ? '/admin/jobs' : '/jobs'}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Jobs
              </a>
              {loggedIn && !isAdmin && (
                <a
                  href="/applications"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Applications
                </a>
              )}

              {isAdmin && (
                <>
                  <a
                    href="/admin/applications"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Job Applicants
                  </a>
                  <a
                    href="/admin/jobs/new"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Post Job
                  </a>
                </>
              )}
              {!isAdmin && (
                <a
                  href="/interview"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Mock Interview
                </a>
              )}

              {loggedIn ? (
                <>
                  <a
                    href="/profile"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    My Profile
                  </a>
                  <button
                    onClick={
                      user?.userType === 'admin'
                        ? () => {
                            navigate('/admin/jobs/new');
                            setMobileMenuOpen(false);
                          }
                        : handleApply
                    }
                    className="mx-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {user?.userType === 'admin'
                      ? 'Post a Job'
                      : 'Apply for Job'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="mx-4 px-4 py-2 border border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4 pt-2">
                  <a
                    href="/login"
                    className="px-4 py-2 text-center border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href="/signup"
                    className="px-4 py-2 text-center bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
