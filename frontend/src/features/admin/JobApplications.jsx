import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Search, Filter } from 'lucide-react';
import { adminAPI } from './api';
import ApplicationTable from './components/ApplicationTable';

export default function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pendingStatus, setPendingStatus] = useState('');

  useEffect(() => {
    loadData();
  }, [jobId, filterStatus]);

  async function loadData() {
    try {
      setLoading(true);

      // Fetch Job Details
      const jobRes = await adminAPI.getJobDetails(jobId);

      if (jobRes.success) {
        setJob(jobRes.data);
      }

      const response = await adminAPI.getApplicationsForJob(
        jobId,
        filterStatus
      );

      if (response.success) {
        setApplications(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (appId, newStatus) => {
    // OPEN MODAL FOR REJECTION
    if (
      typeof newStatus === 'string' &&
      newStatus.trim().toUpperCase() === 'REJECTED'
    ) {
      setSelectedApplicationId(appId);

      setPendingStatus(newStatus);

      setRejectionReason('');

      setShowRejectModal(true);

      return;
    }

    // Optimistic update
    const originalApplications = [...applications];

    setApplications((prev) =>
      prev.map((app) =>
        app._id === appId
          ? {
              ...app,
              currentStatus: newStatus,
            }
          : app
      )
    );

    try {
      const response = await adminAPI.updateApplicationStatus(appId, newStatus);

      if (!response.success) {
        setApplications(originalApplications);

        alert('Failed to update status. Please try again.');
      }
    } catch (err) {
      console.error('Failed to update status:', err);

      setApplications(originalApplications);
    }
  };
  async function confirmReject() {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    try {
      const originalApplications = [...applications];

      setApplications((prev) =>
        prev.map((app) =>
          app._id === selectedApplicationId
            ? { ...app, currentStatus: pendingStatus }
            : app
        )
      );

      const response = await adminAPI.updateApplicationStatus(
        selectedApplicationId,
        pendingStatus,
        rejectionReason
      );

      if (!response.success) {
        setApplications(originalApplications);
        return;
      }

      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedApplicationId(null);
      setPendingStatus('');
    } catch (err) {
      console.error('Failed to reject application:', err);
    }
  }

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase();

    return (
      app.userId?.fullName?.toLowerCase().includes(searchLower) ||
      app.userId?.email?.toLowerCase().includes(searchLower) ||
      app.fullName?.toLowerCase().includes(searchLower) ||
      app.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading && !job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          to="/admin-dashboard"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Job Applications
            </h1>

            <p className="text-gray-600 mt-1">
              Reviewing applicants for{' '}
              <span className="font-semibold text-blue-600">{job?.title}</span>{' '}
              at {job?.company}
            </p>
          </div>

          <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {applications.length} total applications
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />

          <select
            className="flex-1 md:w-48 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>

            <option value="APPLIED">Applied</option>

            <option value="SHORTLISTED">Shortlisted</option>

            <option value="INTERVIEW">Interview</option>

            <option value="HIRED">Hired</option>

            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ApplicationTable
          applications={filteredApplications}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Reject Application
            </h2>

            <p className="text-gray-600 mb-4">
              Please provide a reason for rejection.
            </p>

            <textarea
              autoFocus
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={5}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
