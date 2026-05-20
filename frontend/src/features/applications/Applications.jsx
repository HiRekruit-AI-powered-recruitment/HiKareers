import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationAPI } from './api';
import { isAuthenticated } from '../../utils/auth.js';

export default function Applications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    companyName: '',
  });

  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    loadApplications();
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  async function loadApplications() {
    try {
      setLoading(true);
      const response = await applicationAPI.getMyApplications();
      if (response.success) {
        // Sort by updatedAt descending (most recent first)
        const sorted = response.data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setApplications(sorted);
        setFilteredApplications(sorted);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
      console.error('Load applications error:', err);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...applications];

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(
        (app) => new Date(app.createdAt) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((app) => new Date(app.createdAt) <= endDate);
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((app) => app.currentStatus === filters.status);
    }

    // Filter by company name
    if (filters.companyName.trim()) {
      const searchTerm = filters.companyName.toLowerCase().trim();
      filtered = filtered.filter((app) =>
        app.jobId?.company?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredApplications(filtered);
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      companyName: '',
    });
  }

  function getStatusColor(status) {
    const colors = {
      APPLIED: 'bg-blue-100 text-blue-700',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
      SHORTLISTED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      WITHDRAWN: 'bg-gray-100 text-gray-700',
      OFFERED: 'bg-purple-100 text-purple-700',
      ACCEPTED: 'bg-emerald-100 text-emerald-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function handleWithdrawClick(applicationId) {
    setSelectedApplicationId(applicationId);
    setWithdrawError('');
    setShowWithdrawModal(true);
  }

  async function confirmWithdraw() {
    try {
      setWithdrawLoading(true);

      const response = await applicationAPI.withdrawApplication(
        selectedApplicationId
      );

      if (response.success) {
        setShowWithdrawModal(false);

        loadApplications();
      }
    } catch (err) {
      setWithdrawError(
        err.response?.data?.message || 'Failed to withdraw application'
      );

      console.error('Withdraw error:', err);
    } finally {
      setWithdrawLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mb-4"></div>
          <p className="text-neutral-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Applications</h1>
        <p className="text-neutral-600">
          Track and manage all your job applications
        </p>
      </div>

      {/* Error Alert */}
      {error && <div className="alert alert-error mb-6">{error}</div>}

      {/* Filters Card */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-neutral-600 hover:text-neutral-900 underline"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="label text-sm">From Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input"
            />
          </div>

          <div className="space-y-2">
            <label className="label text-sm">To Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="label text-sm">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
              <option value="OFFERED">Offered</option>
              <option value="ACCEPTED">Accepted</option>
            </select>
          </div>

          {/* Company Name Search */}
          <div className="space-y-2">
            <label className="label text-sm">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={filters.companyName}
              onChange={handleFilterChange}
              placeholder="Search company..."
              className="input"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="text-sm text-neutral-600">
            Showing{' '}
            <span className="font-semibold text-neutral-900">
              {filteredApplications.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-neutral-900">
              {applications.length}
            </span>{' '}
            applications
          </p>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="card text-center py-12">
          <svg
            className="w-16 h-16 text-neutral-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            No applications found
          </h3>
          <p className="text-neutral-600 mb-6">
            {applications.length === 0
              ? "You haven't applied to any jobs yet."
              : 'Try adjusting your filters to see more results.'}
          </p>
          {applications.length === 0 && (
            <button
              onClick={() => navigate('/apply')}
              className="btn btn-primary"
            >
              Apply for a Job
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div
              key={app._id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-neutral-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                        {app.jobId?.title || 'Job Title'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span>{app.jobId?.company || 'Company'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>{app.jobId?.location || 'Location'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600 mt-3 pt-3 border-t border-neutral-200">
                    <div>
                      <span className="text-neutral-500">Applied:</span>{' '}
                      <span className="font-medium text-neutral-900">
                        {formatDate(app.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Updated:</span>{' '}
                      <span className="font-medium text-neutral-900">
                        {formatDate(app.updatedAt)}
                      </span>
                    </div>
                    {app.backlogs && (
                      <div>
                        <span className="text-neutral-500">Backlogs:</span>{' '}
                        <span className="font-medium text-neutral-900">
                          {app.backlogs}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(app.currentStatus)}`}
                  >
                    {app.currentStatus.replace('_', ' ')}
                  </span>

                  <div className="flex gap-2">
                    {app.resumeUrl && (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        View Resume
                      </a>
                    )}

                    {app.currentStatus === 'APPLIED' && (
                      <button
                        onClick={() => handleWithdrawClick(app._id)}
                        className="btn btn-sm px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Withdraw Application
            </h2>

            <p className="text-gray-600 mb-5">
              Are you sure you want to withdraw this application?
            </p>

            {withdrawError && (
              <div className="bg-red-50 text-red-600 px-3 py-2 rounded mb-4 text-sm">
                {withdrawError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                disabled={withdrawLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmWithdraw}
                disabled={withdrawLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                {withdrawLoading ? 'Withdrawing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
