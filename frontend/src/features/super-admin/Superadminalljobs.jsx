// src/features/superAdmin/SuperAdminAllJobs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  MapPin,
  Clock,
  Search,
  ChevronLeft,
  Building2,
} from 'lucide-react';
import { superAdminAPI } from './api';

export default function SuperAdminAllJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadAllJobs();
  }, []);

  async function loadAllJobs() {
    try {
      setLoading(true);
      const response = await superAdminAPI.getAllJobs();
      if (response.success) {
        setJobs(response.data?.jobs || response.data || []);
      }
    } catch (err) {
      console.error('Failed to load all jobs:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = jobs.filter((job) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      job.title?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q) ||
      job.createdBy?.fullName?.toLowerCase().includes(q) ||
      job.company?.toLowerCase().includes(q);
    const matchesStatus = !filterStatus || job.status === filterStatus;
    return matchesSearch && matchesStatus;
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
        <Link
          to="/super-admin/dashboard"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              All Job Postings
            </h1>
            <p className="text-gray-600 mt-1">
              View all jobs posted across all admins — {jobs.length} total.
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, location, company or admin..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No jobs found
            </h3>
            <p className="text-gray-500 mb-4">
              {jobs.length === 0
                ? 'No jobs have been posted yet.'
                : 'Try adjusting your search or filter.'}
            </p>
            {(searchTerm || filterStatus) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('');
                }}
                className="text-blue-600 font-semibold hover:underline text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Posted By
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Applicants
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date Posted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((job) => (
                  <tr
                    key={job._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    {/* Job details */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors uppercase">
                        {job.title}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {job.jobType}
                        </span>
                      </div>
                    </td>

                    {/* Posted by admin */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(job.createdBy?.fullName || job.adminName || '?')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {job.createdBy?.fullName || job.adminName || '—'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {job.createdBy?.email || ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    {/* Applicants */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {job.applicationCount || 0}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
