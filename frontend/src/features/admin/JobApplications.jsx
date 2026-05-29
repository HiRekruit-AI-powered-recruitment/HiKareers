import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Search, Filter, Briefcase, Download } from 'lucide-react';
import { adminAPI } from './api';

// ─── Status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  APPLIED: {
    label: 'Applied',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  INTERVIEW: {
    label: 'Interview',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-400',
  },
  HIRED: {
    label: 'Hired',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-400',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-400',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
  },
};

function getAvailableOptions(currentStatus) {
  switch (currentStatus) {
    case 'APPLIED':
      return ['SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED'];
    case 'SHORTLISTED':
      return ['INTERVIEW', 'HIRED', 'REJECTED'];
    case 'INTERVIEW':
      return ['INTERVIEW', 'HIRED', 'REJECTED'];
    default:
      return [];
  }
}

// ─── Status pill ─────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Avatar initials color map ────────────────────────────────────────────────
const AVATAR_COLORS = [
  'from-indigo-400 to-violet-500',
  'from-teal-400 to-emerald-500',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-blue-500',
];

function avatarGradient(name) {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ─── Single applicant row ─────────────────────────────────────────────────────
function ApplicantRow({ app, onUpdateStatus }) {
  const name = app.userId?.fullName || app.fullName || '—';
  const email = app.userId?.email || app.email || '—';
  const status = app.currentStatus || 'APPLIED';
  const options = getAvailableOptions(status);

  return (
    <tr className="group hover:bg-slate-50 transition-colors duration-150">
      {/* Applicant */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{name}</p>
            <p className="text-xs text-slate-400">{email}</p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <StatusPill status={status} />
      </td>

      {/* Applied date */}
      <td className="px-5 py-3.5 text-sm text-slate-500">
        {app.createdAt
          ? new Date(app.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '—'}
      </td>

      {/* Resume */}
      <td className="px-5 py-3.5">
        {app.resumeUrl ? (
          <a
            href={app.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-xs text-slate-400">No Resume</span>
        )}
      </td>

      {/* Update status */}
      <td className="px-5 py-3.5 text-right">
        {options.length === 0 ? (
          <span className="text-xs text-slate-400 italic">
            No actions available
          </span>
        ) : (
          <select
            value={status}
            onChange={(e) => onUpdateStatus(app._id, e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer hover:border-slate-300 transition-colors"
          >
            <option value={status} disabled>
              {STATUS_CONFIG[status]?.label || status}
            </option>
            {options
              .filter((v) => v !== status)
              .map((val) => (
                <option key={val} value={val}>
                  {STATUS_CONFIG[val].label}
                </option>
              ))}
          </select>
        )}
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
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
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    loadData();
  }, [jobId, filterStatus]);

  async function loadData() {
    try {
      setLoading(true);
      const jobRes = await adminAPI.getJobDetails(jobId);
      if (jobRes.success) setJob(jobRes.data);

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

    const originalApplications = [...applications];
    setApplications((prev) =>
      prev.map((app) =>
        app._id === appId ? { ...app, currentStatus: newStatus } : app
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

    setRejecting(true);
    const originalApplications = [...applications];
    setApplications((prev) =>
      prev.map((app) =>
        app._id === selectedApplicationId
          ? { ...app, currentStatus: pendingStatus }
          : app
      )
    );

    try {
      const response = await adminAPI.updateApplicationStatus(
        selectedApplicationId,
        pendingStatus,
        rejectionReason
      );

      if (!response.success) {
        setApplications(originalApplications);
        setRejecting(false);
        return;
      }

      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedApplicationId(null);
      setPendingStatus('');
    } catch (err) {
      console.error('Failed to reject application:', err);
    } finally {
      setRejecting(false);
    }
  }

  const filteredApplications = applications.filter((app) => {
    const q = searchTerm.toLowerCase();
    return (
      app.userId?.fullName?.toLowerCase().includes(q) ||
      app.userId?.email?.toLowerCase().includes(q) ||
      app.fullName?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q)
    );
  });

  if (loading && !job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-100" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin-dashboard"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Job Applications
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Reviewing applicants for{' '}
              <span className="font-semibold text-indigo-600">
                {job?.title}
              </span>{' '}
              at {job?.company}
            </p>
          </div>

          {!loading && (
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start md:self-auto">
              {applications.length} total applications
            </span>
          )}
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            className="flex-1 md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all text-sm text-slate-700"
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

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700">No applicants found</p>
          <p className="text-slate-400 text-sm mt-1">
            Try adjusting your search or filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Applicant
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Applied
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Resume
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                  Update
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredApplications.map((app) => (
                <ApplicantRow
                  key={app._id}
                  app={app}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

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
                disabled={rejecting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
