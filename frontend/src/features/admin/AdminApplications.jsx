import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  Building2,
  Users,
  Briefcase,
} from 'lucide-react';
import { adminAPI } from './api';
import ApplicationTable from './components/ApplicationTable';

// Status badge config — APPLIED is the implicit default, not a selectable option
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

function ApplicantRow({ app, onUpdateStatus }) {
  const name = app.userId?.fullName || app.fullName || '—';
  const email = app.userId?.email || app.email || '—';
  const job = app.jobId?.title || '—';
  const status = app.currentStatus || 'APPLIED';

  return (
    <tr className="group hover:bg-slate-50 transition-colors duration-150">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{name}</p>
            <p className="text-xs text-slate-400">{email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          {job}
        </div>
      </td>
      <td className="px-5 py-3.5">
        <StatusPill status={status} />
      </td>
      <td className="px-5 py-3.5 text-right">
        {(() => {
          const options = getAvailableOptions(status);
          if (options.length === 0) {
            return (
              <span className="text-xs text-slate-400 italic">
                No actions available
              </span>
            );
          }
          return (
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
          );
        })()}
      </td>
    </tr>
  );
}

function CompanyCard({ companyName, applications, onUpdateStatus }) {
  const [isOpen, setIsOpen] = useState(false);

  // Tally by status
  const hired = applications.filter((a) => a.currentStatus === 'HIRED').length;
  const pending = applications.filter(
    (a) => !['HIRED', 'REJECTED', 'WITHDRAWN'].includes(a.currentStatus)
  ).length;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden
            ${isOpen ? 'border-indigo-200 shadow-lg shadow-indigo-100/60' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'}`}
    >
      {/* Card Header */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left group"
      >
        {/* Company Icon */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200
                    ${isOpen ? 'bg-indigo-600' : 'bg-slate-100 group-hover:bg-indigo-50'}`}
        >
          <Building2
            className={`w-5 h-5 transition-colors duration-200 ${isOpen ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'}`}
          />
        </div>

        {/* Company info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-base truncate">
            {companyName}
          </h3>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Users className="w-3 h-3" />
              {applications.length} applicant
              {applications.length !== 1 ? 's' : ''}
            </span>
            {hired > 0 && (
              <span className="text-xs text-green-600 font-medium">
                · {hired} hired
              </span>
            )}
            {pending > 0 && (
              <span className="text-xs text-amber-600 font-medium">
                · {pending} pending
              </span>
            )}
          </div>
        </div>

        {/* Status pills summary (desktop) */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {['APPLIED', 'INTERVIEW', 'HIRED', 'WITHDRAWN'].map((s) => {
            const count = applications.filter(
              (a) => a.currentStatus === s
            ).length;
            if (!count) return null;
            const cfg = STATUS_CONFIG[s];
            return (
              <span
                key={s}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}
              >
                {count} {cfg.label}
              </span>
            );
          })}
        </div>

        {/* Chevron */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                    ${isOpen ? 'bg-indigo-100 rotate-180' : 'bg-slate-100 group-hover:bg-slate-200'}`}
        >
          <ChevronDown
            className={`w-4 h-4 ${isOpen ? 'text-indigo-600' : 'text-slate-500'}`}
          />
        </div>
      </button>

      {/* Expandable applicant table */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="border-t border-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Applicant
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Role
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                  Update
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {applications.map((app) => (
                <ApplicantRow
                  key={app._id}
                  app={app}
                  onUpdateStatus={onUpdateStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadApplications();
  }, [filterStatus]);

  async function loadApplications() {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const response = await adminAPI.getAllApplications(params);
      if (response.success) {
        setApplications(response.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (appId, newStatus) => {
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

  // Filter by search
  const filtered = applications.filter((app) => {
    const q = searchTerm.toLowerCase();
    return (
      app.userId?.fullName?.toLowerCase().includes(q) ||
      app.userId?.email?.toLowerCase().includes(q) ||
      app.fullName?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q) ||
      app.jobId?.title?.toLowerCase().includes(q) ||
      app.companyId?.name?.toLowerCase().includes(q) ||
      app.jobId?.company?.toLowerCase().includes(q)
    );
  });

  // Group by company
  const grouped = filtered.reduce((acc, app) => {
    const company =
      app.companyId?.name ||
      app.jobId?.company ||
      app.jobId?.companyId?.name ||
      'Unknown Company';
    if (!acc[company]) acc[company] = [];
    acc[company].push(app);
    return acc;
  }, {});

  const companyEntries = Object.entries(grouped).sort(
    (a, b) => b[1].length - a[1].length
  );
  const totalApplicants = filtered.length;
  const totalCompanies = companyEntries.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          All Job Applicants
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Manage and review applicants across all your job postings.
        </p>
        {!loading && (
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-bold text-indigo-700">
                {totalCompanies}
              </span>
              <span className="text-sm text-indigo-500">Companies</span>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-bold text-violet-700">
                {totalApplicants}
              </span>
              <span className="text-sm text-violet-500">Applicants</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, job title or company..."
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
            <option value="APPLIED">Applied (Default)</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        </div>
      ) : companyEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700">No applicants found</p>
          <p className="text-slate-400 text-sm mt-1">
            Try adjusting your search or filter.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {companyEntries.map(([companyName, apps]) => (
            <CompanyCard
              key={companyName}
              companyName={companyName}
              applications={apps}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
