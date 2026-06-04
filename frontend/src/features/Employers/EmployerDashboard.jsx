import { useAuth } from '../../contexts/AuthContext.jsx';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EmployerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.userType === 'admin';

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // ── Logged in as candidate ───────────────────────────────────────────────
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 15v2m0-6v.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Recruiters Only
        </h1>
        <p className="text-slate-500 text-base max-w-sm mb-10">
          This area is exclusively for HiKareers recruiters and admins. You're
          logged in as a candidate — head back to browse open roles.
        </p>
        <div className="flex gap-4">
          <a
            href="/"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            Home
          </a>
          <a
            href="/jobs"
            className="px-6 py-3 rounded-xl border border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition"
          >
            Browse Jobs
          </a>
        </div>
      </div>
    );
  }

  // ── Not logged in ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Employer Dashboard
        </h1>
        <p className="text-slate-500 text-base max-w-sm mb-10">
          This area is for HiKareers recruiters and admins. Sign in to your
          admin account or request access.
        </p>
        <div className="flex gap-4">
          <a
            href="/admin/login"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            Admin Login
          </a>
          <a
            href="/admin/signup"
            className="px-6 py-3 rounded-xl border border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition"
          >
            Request Access
          </a>
        </div>
      </div>
    );
  }

  // Fallback while redirect fires for admin
  return null;
}
