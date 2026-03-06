import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    ChevronLeft,
    Briefcase,
    MapPin,
    IndianRupee,
    Type,
    Monitor,
    TrendingUp,
    Tag,
    Calendar,
    Loader2,
    Save,
    Trash2
} from 'lucide-react';
import { adminAPI } from './api';

export default function EditJob() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        description: '',
        endDate: '',
        salary: '',
        jobType: 'Full-time',
        workMode: 'On-site',
        experienceLevel: 'Entry Level',
        skills: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        loadJobData();
    }, [jobId]);

    async function loadJobData() {
        try {
            setLoading(true);
            const response = await adminAPI.getJobDetails(jobId);
            if (response.success) {
                const job = response.data;
                setFormData({
                    title: job.title || '',
                    company: job.company || '',
                    location: job.location || '',
                    description: job.description || '',
                    endDate: job.endDate ? new Date(job.endDate).toISOString().split('T')[0] : '',
                    salary: job.salary || '',
                    jobType: job.jobType || 'Full-time',
                    workMode: job.workMode || 'On-site',
                    experienceLevel: job.experienceLevel || 'Entry Level',
                    skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
                    status: job.status || 'ACTIVE'
                });
            } else {
                setError('Failed to load job details');
            }
        } catch (err) {
            setError('An error occurred loading job data');
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            const jobData = {
                ...formData,
                skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s !== '') : []
            };

            const response = await adminAPI.updateJob(jobId, jobData);
            if (response.success) {
                navigate('/admin-dashboard');
            } else {
                const detailError = response.error && Array.isArray(response.error)
                    ? `: ${response.error.join(', ')}`
                    : '';
                setError((response.message || 'Failed to update job') + detailError);
            }
        } catch (err) {
            const message = err.response?.data?.message || 'An error occurred. Please try again.';
            const detail = err.response?.data?.error && Array.isArray(err.response.data.error)
                ? `: ${err.response.data.error.join(', ')}`
                : '';
            setError(message + detail);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) return;

        try {
            setSaving(true);
            const response = await adminAPI.deleteJob(jobId);
            if (response.success) {
                navigate('/admin-dashboard');
            } else {
                setError(response.message || 'Failed to delete job');
            }
        } catch (err) {
            setError('Failed to delete job. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
                to="/admin-dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-amber-600 px-8 py-6 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Job Posting</h1>
                        <p className="text-amber-100 mt-1 opacity-90">Update your job details and requirements.</p>
                    </div>
                    <button
                        onClick={handleDelete}
                        type="button"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                        title="Delete Job"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Job Title *</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    name="title"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Company Name *</label>
                            <div className="relative">
                                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    name="company"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.company}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Location *</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    name="location"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Application Deadline *</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="date"
                                    name="endDate"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Salary Range</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="salary"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.salary}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Job Type</label>
                            <select
                                name="jobType"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                value={formData.jobType}
                                onChange={handleChange}
                            >
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contract</option>
                                <option>Internship</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Work Mode</label>
                            <div className="relative">
                                <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    name="workMode"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                    value={formData.workMode}
                                    onChange={handleChange}
                                >
                                    <option>On-site</option>
                                    <option>Remote</option>
                                    <option>Hybrid</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Experience Level</label>
                            <div className="relative">
                                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    name="experienceLevel"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                    value={formData.experienceLevel}
                                    onChange={handleChange}
                                >
                                    <option>Fresher</option>
                                    <option>Junior</option>
                                    <option>Experienced</option>
                                    <option>Entry Level</option>
                                    <option>Mid-Senior Level</option>
                                    <option>Director</option>
                                    <option>Executive</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Posting Status</label>
                            <select
                                name="status"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="CLOSED">Closed/Hidden</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Job Description *</label>
                        <textarea
                            required
                            rows="6"
                            name="description"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Required Skills (Comma separated)</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="skills"
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={formData.skills}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Link
                            to="/admin-dashboard"
                            className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            disabled={saving}
                            type="submit"
                            className="px-8 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:bg-amber-400"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
