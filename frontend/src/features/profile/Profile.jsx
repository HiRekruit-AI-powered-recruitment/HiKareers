import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from './api';

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

function HeaderSection({ onEdit }) {
  return (
    <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl mb-2">My Profile</h1>
        <p className="text-neutral-600">Manage and view your profile information</p>
      </div>
      <button onClick={onEdit} className="btn btn-primary btn-lg w-full md:w-auto">
        Edit Profile
      </button>
    </div>
  );
}

function BasicInfoSection({ user }) {
  return (
    <div className="card">
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
            {user?.mobile &&
              (user?.mobileVerified ? (
                <span className="badge badge-success text-xs">✓ Verified</span>
              ) : (
                <span className="badge badge-warning text-xs">Pending</span>
              ))}
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
  console.log("ResumesSection resumes:", resumes);

  const hasAnyResume = Array.isArray(resumes) && resumes.some(r => r);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-neutral-200">
        Resumes
      </h2>

      {hasAnyResume ? (
        <div className="space-y-4">
          {resumes.map((resume, index) => {
            if (!resume) return null; // 👈 skip empty slots

            return (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-neutral-100 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 mb-1">
                    Resume {index + 1}
                  </p>
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
  if (!user?.highestQualification || !user?.qualifications) return null;
  console.log("EducationSection user:", user.highestQualification, user.qualifications);

  const qualificationLevels = {
    'tenth': ['tenth'],
    'twelfth': ['tenth', 'twelfth'],
    'graduation': ['tenth', 'twelfth', 'graduation'],
    'postgraduation': ['tenth', 'twelfth', 'graduation', 'postgraduation'],
  };

  const levelsToShow =
    qualificationLevels[user.highestQualification] || [];

  const renderBlock = (title, data) => {
    console.log(`Rendering block for ${title}:`, data);
  if (!data || typeof data !== 'object') return null;

  return (
    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
      <h3 className="font-semibold text-neutral-900 mb-4">{title}</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(data).map(([key, value]) => {
          if (key === 'completed') return null;
          console.log("Rendering qualification field:", key, value);

          const isMissing =
            value === null || value === undefined || value === '';

          return (
            <div key={key}>
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                {key}
              </label>

              {isMissing ? (
                <p className="mt-1 text-sm font-semibold text-red-600">
                  Missing
                </p>
              ) : (
                <p className="text-neutral-900 mt-1">
                  {String(value)}
                </p>
              )}
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

      <div className="mb-6 pb-6 border-b border-neutral-200">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Highest Qualification
        </label>
        <p className="text-neutral-900 mt-2 font-medium capitalize text-lg">
          {user.highestQualification}
        </p>
      </div>

      <div className="space-y-6">
        {levelsToShow.includes('tenth') &&
          renderBlock('10th Standard', user.qualifications.tenth)}

        {levelsToShow.includes('twelfth') &&
          renderBlock('12th Standard', user.qualifications.twelfth)}

        {levelsToShow.includes('graduation') &&
          renderBlock('Graduation', user.qualifications.graduation)}

        {levelsToShow.includes('postgraduation') &&
          renderBlock('Post Graduation', user.qualifications.postgraduation)}
      </div>
    </div>
  );
}


/* ----------------------- Main Container ----------------------- */

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getCurrentUser();
      if (response?.success) {
        setUser(response.data);
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
    loadUserProfile();
  }, [loadUserProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-neutral-600">Loading your profile...</p>
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

  const resumes = normalizeResumes(user?.resumes);
  console.log("Normalized resumes:", resumes);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <HeaderSection onEdit={() => navigate('/profile/edit')} />
      <BasicInfoSection user={user} />
      <ResumesSection resumes={resumes} />
      <EducationSection user={user} />
    </div>
  );
}
