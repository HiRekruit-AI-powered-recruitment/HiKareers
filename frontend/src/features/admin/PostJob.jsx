import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    Plus,
    Trash2,
    Users,
    Globe,
    Lock
} from 'lucide-react';
import { adminAPI } from './api';

export default function PostJob() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        experienceLevel: 'Fresher',
        skills: '',
        // New fields
        jobId: '',
        role: '',
        numberOfPositions: 1,
        hiringType: 'Fresher',
        startDate: '',
        driveVisibility: 'public',
        interviewRounds: [
            { type: 'HR', description: '' }
        ]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddRound = () => {
        setFormData(prev => ({
            ...prev,
            interviewRounds: [...prev.interviewRounds, { type: 'Technical', description: '' }]
        }));
    };

    const handleRemoveRound = (index) => {
        setFormData(prev => ({
            ...prev,
            interviewRounds: prev.interviewRounds.filter((_, i) => i !== index)
        }));
    };

    const handleRoundChange = (index, field, value) => {
        const updatedRounds = [...formData.interviewRounds];
        updatedRounds[index][field] = value;
        setFormData(prev => ({ ...prev, interviewRounds: updatedRounds }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Process skills into array and dates into ISO
            const jobData = {
                ...formData,
                skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s !== '') : [],
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
                endDate: new Date(formData.endDate).toISOString(),
                numberOfPositions: Number(formData.numberOfPositions)
            };

            const response = await adminAPI.createJob(jobData);
            if (response.success) {
                navigate('/admin-dashboard');
            } else {
                // If there are specific validation errors, join them
                const detailError = response.error && Array.isArray(response.error)
                    ? `: ${response.error.join(', ')}`
                    : '';
                setError((response.message || 'Failed to create job') + detailError);
            }
        } catch (err) {
            const message = err.response?.data?.message || 'An error occurred. Please try again.';
            const detail = err.response?.data?.error && Array.isArray(err.response.data.error)
                ? `: ${err.response.data.error.join(', ')}`
                : '';
            setError(message + detail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Link */}
            <Link
                to="/admin-dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-600 px-8 py-6 text-white">
                    <h1 className="text-2xl font-bold">Post a New Job</h1>
                    <p className="text-blue-100 mt-1 opacity-90">Fill in the details to find your next great hire.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Job ID */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Job ID *</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    name="jobId"
                                    placeholder="e.g. JOB-2025-001"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.jobId}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Role *</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    name="role"
                                    placeholder="e.g. Software Engineer"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.role}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Job Title */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Job Title *</label>
                            <div className="relative">
                                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Senior Frontend Developer"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Company Name */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Company Name *</label>
                            <div className="relative">
                                <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    name="company"
                                    placeholder="e.g. Acme Inc"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.company}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Number of Positions */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Number of Candidates to Hire *</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="number"
                                    name="numberOfPositions"
                                    min="1"
                                    placeholder="e.g. 5"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.numberOfPositions}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Job Type */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Job Type *</label>
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

                        {/* Hiring Type */}
                        <div className="space-y-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700">Hiring Type</label>
                            <div className="flex gap-6 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="hiringType"
                                        value="Fresher"
                                        checked={formData.hiringType === 'Fresher'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Fresher</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="hiringType"
                                        value="Experienced"
                                        checked={formData.hiringType === 'Experienced'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Experienced</span>
                                </label>
                            </div>
                        </div>

                        {/* Salary */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Salary Range (Optional)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="salary"
                                    placeholder="e.g. ₹10 LPA or ₹50k - ₹80k"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.salary}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Work Mode */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Work Mode</label>
                            <select
                                name="workMode"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                value={formData.workMode}
                                onChange={handleChange}
                            >
                                <option>On-site</option>
                                <option>Remote</option>
                                <option>Hybrid</option>
                            </select>
                        </div>

                        {/* Experience Level */}
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

                        {/* Drive Visibility */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Drive Visibility</label>
                            <div className="relative">
                                {formData.driveVisibility === 'public' ? (
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                ) : (
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                )}
                                <select
                                    name="driveVisibility"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                    value={formData.driveVisibility}
                                    onChange={handleChange}
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Location *</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    name="location"
                                    placeholder="e.g. Bangalore, Remote, Hybrid"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Start Date *</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="date"
                                    name="startDate"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* End Date (Deadline) */}
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
                    </div>

                    {/* Job Description */}
                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Job Description *</label>
                        <textarea
                            required
                            rows="4"
                            name="description"
                            placeholder="Describe the role, responsibilities, and requirements..."
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Skills */}
                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Required Skills (Comma separated)</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="skills"
                                placeholder="React, JavaScript, Tailwind, etc."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={formData.skills}
                                onChange={handleChange}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Separate skills with commas (e.g. Node.js, AWS, Redis)</p>
                    </div>

                    {/* Interview Rounds */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800">Interview Rounds *</h3>
                            <button
                                type="button"
                                onClick={handleAddRound}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Add Round
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.interviewRounds.map((round, index) => (
                                <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative group animate-in fade-in slide-in-from-top-2 duration-300">
                                    {formData.interviewRounds.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRound(index)}
                                            className="absolute -right-2 -top-2 p-1.5 bg-white border border-gray-200 text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Round {index + 1} Type
                                            </label>
                                            <select
                                                required
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                value={round.type}
                                                onChange={(e) => handleRoundChange(index, 'type', e.target.value)}
                                            >
                                                <option value="HR">HR Round</option>
                                                <option value="Technical">Technical Round</option>
                                                <option value="Aptitude">Aptitude Test</option>
                                                <option value="Managerial">Managerial Round</option>
                                                <option value="Final">Final Interview</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Description (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Brief description of the round"
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                value={round.description}
                                                onChange={(e) => handleRoundChange(index, 'description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                            disabled={loading}
                            type="submit"
                            className="px-8 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-400"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Posting...' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
