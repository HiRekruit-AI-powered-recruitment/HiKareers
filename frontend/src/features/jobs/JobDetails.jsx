import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    MapPin,
    Clock,
    IndianRupee,
    Building2,
    Calendar,
    Users,
    Globe,
    Lock,
    Share2,
    ArrowLeft,
    CheckCircle2,
} from 'lucide-react';
import { jobAPI } from '../applications/api';
import { useAuth } from '../../contexts/AuthContext';

const JobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const isAdmin = user?.userType === 'admin';

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                const response = await jobAPI.getJobById(jobId);
                if (response.success) {
                    setJob(response.data);
                } else {
                    setError(response.message || 'Failed to load job details');
                }
            } catch (err) {
                setError('An error occurred while fetching job details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId]);

    const handleApply = () => {
        navigate(`/apply/${jobId}`);
    };

    const handleShare = () => {
        const link = `${window.location.origin}/apply/${jobId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowLeft className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Job not found</h2>
                    <p className="text-gray-600 mb-8">{error || "The job you're looking for doesn't exist or has been removed."}</p>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Jobs
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="flex items-start gap-6 mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                                <Building2 className="w-10 h-10 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                                <p className="text-xl text-gray-600 font-medium mb-4">{job.company}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                                        <MapPin className="w-4 h-4" />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                                        <Briefcase className="w-4 h-4" />
                                        {job.jobType || job.type}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                                        <Clock className="w-4 h-4" />
                                        {job.experienceLevel || job.experience}
                                    </span>
                                    {job.salary && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg font-semibold text-blue-700">
                                            <IndianRupee className="w-4 h-4" />
                                            {job.salary}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
                                <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-line">
                                    {job.description}
                                </div>
                            </div>

                            {job.skills && job.skills.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {job?.interviewRounds?.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Process</h2>
                                    <div className="space-y-4">
                                        {job.interviewRounds.map((round, index) => (
                                            <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-blue-600 border border-blue-100 flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{round.type || `Round ${index + 1}`}</h3>
                                                    <p className="text-gray-600 text-sm mt-1">{round.description || 'Details will be shared upon clearing previous rounds.'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                        <div className="space-y-4 mb-6">
                            <button
                                onClick={handleApply}
                                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transform active:scale-95 transition-all shadow-lg shadow-blue-200"
                            >
                                Apply Now
                            </button>
                            {(() => {
                                const visibility = job?.driveVisibility || 'public';
                                const isPrivate = visibility === 'private';
                                const shareDisabled = isPrivate && !isAdmin;
                                return (
                                    <div>
                                        <button
                                            onClick={!shareDisabled ? handleShare : undefined}
                                            disabled={shareDisabled}
                                            title={shareDisabled ? 'Private job link cannot be shared' : undefined}
                                            className={`w-full py-3.5 border-2 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                                                shareDisabled
                                                    ? 'bg-gray-50 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed'
                                                    : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                                            }`}
                                        >
                                            {copied ? (
                                                <><CheckCircle2 className="w-5 h-5" /> Link Copied!</>
                                            ) : (
                                                <><Share2 className="w-5 h-5" /> Share Apply Link</>
                                            )}
                                        </button>
                                        {shareDisabled && (
                                            <p className="text-xs text-center text-gray-400 mt-1.5">
                                                Private job link cannot be shared
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="space-y-4 py-6 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Users className="w-5 h-5" />
                                    <span>Positions</span>
                                </div>
                                <span className="font-bold text-gray-900">{job?.numberOfPositions || 1}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Globe className="w-5 h-5" />
                                    <span>Visibility</span>
                                </div>
                                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                    {job?.driveVisibility || 'public'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Calendar className="w-5 h-5" />
                                    <span>Start Date</span>
                                </div>
                                <span className="font-bold text-gray-900">
                                    {job?.startDate ? new Date(job.startDate).toLocaleDateString() : 'Immediate'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Calendar className="w-5 h-5" />
                                    <span>End Date</span>
                                </div>
                                <span className="font-bold text-red-600">
                                    {job?.endDate ? new Date(job.endDate).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
