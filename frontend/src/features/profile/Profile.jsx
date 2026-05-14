import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI } from './api';
import { adminAPI } from '../admin/api';
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';

/* ----------------------- Helpers ----------------------- */

function normalizeResumes(resumes) {
  const result = Array(3).fill(null);
  if (!resumes) return result;

  Object.keys(resumes).forEach((key) => {
    const index = parseInt(key, 10) - 1;
    if (index >= 0 && index < 3 && resumes[key]) {
      result[index] = { ...resumes[key], slot: index + 1 };
    }
  });

  return result;
}

function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* ----------------------- Sections ----------------------- */

function HeaderSection({ onEdit, title = 'My Profile' }) {
  return (
    <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl mb-2">{title}</h1>
        <p className="text-neutral-600">
          Manage and view your profile information
        </p>
      </div>
      <button
        onClick={onEdit}
        className="btn btn-primary btn-lg w-full md:w-auto"
      >
        Edit Profile
      </button>
    </div>
  );
}

function BasicInfoSection({ user }) {
  return (
    <div className="card ">
      <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-neutral-200">
        Basic Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Info label="Full Name" value={user?.fullName} />
        <Info label="Username" value={user?.userName} />

        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Email Address
          </label>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-neutral-900 font-medium">{user?.email || '-'}</p>
            {user?.emailVerified ? (
              <span className="badge badge-success text-xs">✓ Verified</span>
            ) : (
              <span className="badge badge-warning text-xs">Pending</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Mobile Number
          </label>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-neutral-900 font-medium">
              {user?.mobile || 'Not provided'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
        {label}
      </label>
      <p className="text-neutral-900 mt-2 font-medium">{value || '-'}</p>
    </div>
  );
}

function ResumesSection({ resumes }) {
  const hasAnyResume = Array.isArray(resumes) && resumes.some((r) => r);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-neutral-200">
        Resume
      </h2>

      {hasAnyResume ? (
        <div className="space-y-4">
          {resumes.map((resume, index) => {
            if (!resume) return null;
            return (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-neutral-100 transition"
              >
                <div className="flex-1">
                  <p className="text-sm text-neutral-600">
                    {resume.fileName || 'Resume PDF'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Uploaded {formatDate(resume.uploadedAt)}
                  </p>
                </div>

                <a
                  href={resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm w-full md:w-auto"
                >
                  View Resume
                </a>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-neutral-500 text-center py-8">
          No resumes uploaded yet
        </p>
      )}
    </div>
  );
}

function EducationSection({ user }) {
  if (!user?.qualifications) return null;

  const ORDER = ['tenth', 'twelfth', 'graduation', 'postgraduation'];

  const LABELS = {
    tenth: '10th Standard',
    twelfth: '12th Standard',
    graduation: 'Graduation',
    postgraduation: 'Post Graduation',
  };

  const availableLevels = ORDER.filter(
    (level) => user.qualifications[level]?.startYear !== null
  );

  const renderBlock = (title, data) => {
    if (!data || typeof data !== 'object') return null;

    return (
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
        <h3 className="font-semibold text-neutral-900 mb-4">{title}</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(data).map(([key, value]) => {
            if (key === 'completed') return null;

            if (key === 'cgpa' && data.percentage) return null;
            if (key === 'percentage' && data.cgpa) return null;

            return (
              <div key={key}>
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {key === 'cgpa'
                    ? 'CGPA'
                    : key === 'percentage'
                      ? 'Percentage'
                      : key}
                </label>

                <p className="text-neutral-900 mt-1">
                  {value ? String(value) : '-'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-neutral-200">
        Education Details
      </h2>

      <div className="space-y-6">
        {availableLevels.length > 0 ? (
          availableLevels.map((level) =>
            renderBlock(LABELS[level], user.qualifications[level])
          )
        ) : (
          <p className="text-neutral-500">No education details available.</p>
        )}
      </div>
    </div>
  );
}
/* ----------------------- Admin Sections ----------------------- */

function RecruiterStatsSection({ stats }) {
  const cards = [
    {
      label: 'Jobs Posted',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Jobs',
      value: stats?.activeJobs || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Applications',
      value: stats?.totalApplications || 0,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="card p-6 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-neutral-900 mt-1">
              {card.value}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${card.bg}`}>
            <card.icon className={`w-6 h-6 ${card.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentActivitySection({ jobs }) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-neutral-200">
        Recent Job Posts
      </h2>
      <div className="space-y-4">
        {jobs.slice(0, 5).map((job) => (
          <Link
            key={job._id}
            to={`/admin/jobs/${job._id}/applications`}
            className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition group"
          >
            <div>
              <p className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors uppercase">
                {job.title}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {job.applicationCount || 0}{' '}
                  applicants
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Posted on{' '}
                  {formatDate(job.createdAt)}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-blue-500 transition-colors" />
          </Link>
        ))}
      </div>
      {jobs.length > 5 && (
        <Link
          to="/admin/jobs"
          className="block text-center mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View All Jobs
        </Link>
      )}
    </div>
  );
}

/* ----------------------- Main Container ----------------------- */

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const userRes = await userAPI.getCurrentUser();

      if (userRes?.success) {
        setUser(userRes.data);

        // If admin, load stats and jobs
        if (userRes.data.userType === 'admin') {
          const [statsRes, jobsRes] = await Promise.all([
            adminAPI.getAdminStats(),
            adminAPI.getAdminJobsAll(userRes.data._id),
          ]);

          if (statsRes.success) setStats(statsRes.data);
          if (jobsRes.success) setRecentJobs(jobsRes.data.jobs || []);
        }
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const isAdmin = user?.userType === 'admin';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 px-4 mt-6">
      <HeaderSection
        onEdit={() => navigate('/profile/edit')}
        title={isAdmin ? 'My Recruiter Profile' : 'My Profile'}
      />

      <BasicInfoSection user={user} />

      {isAdmin ? (
        <>
          <RecruiterStatsSection stats={stats} />
          <RecentActivitySection jobs={recentJobs} />
        </>
      ) : (
        <>
          <ResumesSection resumes={normalizeResumes(user?.resumes)} />
          <EducationSection user={user} />
        </>
      )}
    </div>
  );
}
