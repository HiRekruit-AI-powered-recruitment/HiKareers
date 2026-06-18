import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldX,
  ShieldOff,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { superAdminAPI } from './api';

// ── Stat Card (matches AdminDashboard style) ──────────────────────────────────
function StatCard({ icon: Icon, value, label, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${confirmClass}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Admin table row ───────────────────────────────────────────────────────────
function AdminRow({ admin, onApprove, onReject, onRevoke, actionLoadingId }) {
  const name = admin.fullName || '—';
  const email = admin.email || '—';
  const status = admin.approvalStatus || 'pending';
  const joined = admin.createdAt
    ? new Date(admin.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';
  const isLoading = actionLoadingId === admin._id;

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      {/* Admin info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {name}
            </p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <StatusPill status={status} />
      </td>

      {/* Joined */}
      <td className="px-6 py-4 text-sm text-gray-500">{joined}</td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {isLoading && (
            <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          )}

          {status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(admin._id, name)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={() => onReject(admin._id, name)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldX className="w-3.5 h-3.5" />
                Reject
              </button>
            </>
          )}

          {status === 'rejected' && (
            <button
              onClick={() => onApprove(admin._id, name)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Approve
            </button>
          )}

          {status === 'approved' && (
            <button
              onClick={() => onRevoke(admin._id, name)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldOff className="w-3.5 h-3.5" />
              Revoke
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [modal, setModal] = useState({ open: false });

  useEffect(() => {
    loadAdmins();
  }, [filterStatus]);

  async function loadAdmins() {
    try {
      setLoading(true);
      const res = await superAdminAPI.getAllAdmins(filterStatus);
      if (res.success) setAdmins(res.data?.admins || []);
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoading(false);
    }
  }

  function openModal(config) {
    setModal({ open: true, ...config });
  }
  function closeModal() {
    setModal({ open: false });
  }

  function handleApprove(id, name) {
    openModal({
      title: 'Approve Admin',
      description: `Approve "${name}"? They'll be able to log in immediately.`,
      confirmLabel: 'Approve',
      confirmClass: 'bg-green-600 hover:bg-green-700',
      onConfirm: () => executeApproval(id, 'approved'),
    });
  }

  function handleReject(id, name) {
    openModal({
      title: 'Reject Admin',
      description: `Reject "${name}"? They'll be notified via email.`,
      confirmLabel: 'Reject',
      confirmClass: 'bg-red-600 hover:bg-red-700',
      onConfirm: () => executeApproval(id, 'rejected'),
    });
  }

  function handleRevoke(id, name) {
    openModal({
      title: 'Revoke Admin Access',
      description: `Revoke access for "${name}"? They'll be logged out immediately and notified via email.`,
      confirmLabel: 'Revoke Access',
      confirmClass: 'bg-red-600 hover:bg-red-700',
      onConfirm: () => executeRevoke(id),
    });
  }

  async function executeApproval(id, action) {
    closeModal();
    setActionLoadingId(id);
    try {
      const res = await superAdminAPI.updateApproval(id, action);
      if (res.success) {
        setAdmins((prev) =>
          prev.map((a) => (a._id === id ? { ...a, approvalStatus: action } : a))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function executeRevoke(id) {
    closeModal();
    setActionLoadingId(id);
    try {
      const res = await superAdminAPI.revokeAdmin(id);
      if (res.success) {
        setAdmins((prev) =>
          prev.map((a) =>
            a._id === id ? { ...a, approvalStatus: 'rejected' } : a
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  }

  // Derived counts
  const counts = admins.reduce(
    (acc, a) => {
      acc[a.approvalStatus] = (acc[a.approvalStatus] || 0) + 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 }
  );

  // Search filter (client-side)
  const filtered = admins.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      a.fullName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.fullName}. Review and manage admin accounts.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Users}
          value={counts.pending}
          label="Pending Approval"
          color="amber"
        />
        <StatCard
          icon={CheckCircle}
          value={counts.approved}
          label="Approved Admins"
          color="green"
        />
        <StatCard
          icon={XCircle}
          value={counts.rejected}
          label="Rejected Admins"
          color="red"
        />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-gray-900">All Admins</h2>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-56"
              />
            </div>
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No admins found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((admin) => (
                  <AdminRow
                    key={admin._id}
                    admin={admin}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRevoke={handleRevoke}
                    actionLoadingId={actionLoadingId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        description={modal.description}
        confirmLabel={modal.confirmLabel}
        confirmClass={modal.confirmClass}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
        loading={!!actionLoadingId}
      />
    </div>
  );
}
