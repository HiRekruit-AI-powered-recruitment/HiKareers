import React, { useState, useEffect } from 'react';
import { Search, Filter, User as UserIcon } from 'lucide-react';
import { adminAPI } from './api';
import ApplicationTable from './components/ApplicationTable';

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
        setApplications(prev => prev.map(app =>
            app._id === appId ? { ...app, currentStatus: newStatus } : app
        ));

        try {
            const response = await adminAPI.updateApplicationStatus(appId, newStatus);
            if (!response.success) {
                setApplications(originalApplications);
                alert("Failed to update status. Please try again.");
            }
        } catch (err) {
            console.error('Failed to update status:', err);
            setApplications(originalApplications);
        }
    };

    const filteredApplications = applications.filter(app => {
        const searchLower = searchTerm.toLowerCase();
        return (
            app.userId?.fullName?.toLowerCase().includes(searchLower) ||
            app.userId?.email?.toLowerCase().includes(searchLower) ||
            app.fullName?.toLowerCase().includes(searchLower) ||
            app.email?.toLowerCase().includes(searchLower) ||
            app.jobId?.title?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">All Job Applicants</h1>
                <p className="text-gray-600 mt-1">
                    Manage and review applicants across all your job postings.
                </p>
            </div>

            {/* Filters bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by applicant name, email, or job title..."
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

            {loading && applications.length === 0 ? (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <ApplicationTable
                        applications={filteredApplications}
                        onUpdateStatus={handleUpdateStatus}
                        showJobTitle={true}
                    />
                </div>
            )}
        </div>
    );
}
