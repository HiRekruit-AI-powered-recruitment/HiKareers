import React from 'react';
import {
    Mail,
    Calendar,
    Download,
    User as UserIcon,
    CheckCircle2,
    XCircle
} from 'lucide-react';

const STATUS_BADGES = {
    'APPLIED': 'bg-blue-100 text-blue-800',
    'SHORTLISTED': 'bg-purple-100 text-purple-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'INTERVIEW': 'bg-yellow-100 text-yellow-800',
    'HIRED': 'bg-green-100 text-green-800',
    'DEFAULT': 'bg-gray-100 text-gray-800'
};

const getApplicationStatus = (app) => app.currentStatus || app.status || 'APPLIED';

export default function ApplicationTable({
    applications,
    onUpdateStatus,
    showJobTitle = false
}) {
    if (applications.length === 0) {
        return (
            <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                    <UserIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No applicants found</h3>
                <p className="text-gray-500">No applications match your current search or filters.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 shadow-inner">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                        {showJobTitle && (
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</th>
                        )}
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resume</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Decision</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {applications.map((app) => {
                        const status = getApplicationStatus(app);
                        return (
                            <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                                            {app.userId?.fullName?.charAt(0) || app.fullName?.charAt(0) || <UserIcon className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{app.userId?.fullName || app.fullName}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {app.userId?.email || app.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                {showJobTitle && (
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="font-medium text-gray-900">{app.jobId?.title || 'Unknown Job'}</div>
                                        <div className="text-xs text-gray-500">{app.jobId?.company}</div>
                                    </td>
                                )}
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {new Date(app.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[status] || STATUS_BADGES.DEFAULT}`}>
                                        {status.charAt(0) + status.slice(1).toLowerCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <a
                                        href={app.resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium group transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        View PDF
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        {status !== 'HIRED' && (
                                            <>
                                                {/* Always show Accept (Shortlist) button */}
                                                <button
                                                    onClick={() => onUpdateStatus(app._id, 'SHORTLISTED')}
                                                    className={`p-2 rounded-lg transition-all ${status === 'SHORTLISTED' ? 'bg-purple-100 text-purple-700' : 'text-purple-600 hover:bg-purple-50'}`}
                                                    title="Accept / Shortlist"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>

                                                {/* Show Interview button if Shortlisted */}
                                                {status === 'SHORTLISTED' && (
                                                    <button
                                                        onClick={() => onUpdateStatus(app._id, 'INTERVIEW')}
                                                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                                                        title="Schedule Interview"
                                                    >
                                                        <Calendar className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {/* Show Hire button if in Interview stage */}
                                                {status === 'INTERVIEW' && (
                                                    <button
                                                        onClick={() => onUpdateStatus(app._id, 'HIRED')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Mark as Hired"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {/* Always show Reject button */}
                                                <button
                                                    onClick={() => onUpdateStatus(app._id, 'REJECTED')}
                                                    className={`p-2 rounded-lg transition-all ${status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'text-red-600 hover:bg-red-50'}`}
                                                    title="Reject Applicant"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
