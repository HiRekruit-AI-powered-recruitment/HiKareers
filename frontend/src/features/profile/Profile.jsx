import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from './api';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function normalizeResumes(resumes) {
    if (!resumes) return [];
    if (Array.isArray(resumes)) return resumes;
    const arr = [];
    for (let i = 1; i <= 3; i++) {
      const r = resumes[i] || resumes[String(i)];
      if (r) arr.push({ ...r, slot: i });
    }
    return arr;
  }

  useEffect(() => {
    loadUserProfile();
  }, []);

  async function loadUserProfile() {
    try {
      const response = await userAPI.getCurrentUser();
      if (response.success) {
        setUser(response.data);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mb-4"></div>
          <p className="text-neutral-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  const qualificationLevels = {
    '10th': ['tenth'],
    '12th': ['tenth', 'twelfth'],
    'graduation': ['tenth', 'twelfth', 'graduation'],
    'postgraduation': ['tenth', 'twelfth', 'graduation', 'postgraduation']
  };

  const levelsToShow = user?.highestQualification
    ? qualificationLevels[user.highestQualification] || []
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Card */}
      <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">My Profile</h1>
          <p className="text-neutral-600">Manage and view your profile information</p>
        </div>
        <button
          onClick={() => navigate('/profile/edit')}
          className="btn btn-primary btn-lg w-full md:w-auto"
        >
          Edit Profile
        </button>
      </div>

      {/* Basic Info Card */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-neutral-200">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Full Name</label>
            <p className="text-neutral-900 mt-2 font-medium">{user?.fullName || '-'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Username</label>
            <p className="text-neutral-900 mt-2 font-medium">{user?.userName || '-'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Email Address</label>
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
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Mobile Number</label>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-neutral-900 font-medium">{user?.mobile || 'Not provided'}</p>
              {user?.mobile && (
                user?.mobileVerified ? (
                  <span className="badge badge-success text-xs">✓ Verified</span>
                ) : (
                  <span className="badge badge-warning text-xs">Pending</span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resumes Card */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-neutral-200">Resumes</h2>
        {normalizeResumes(user?.resumes).length > 0 ? (
          <div className="space-y-4">
            {normalizeResumes(user?.resumes).map((resume, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-neutral-100 transition">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h6a1 1 0 00-1-1H6a3 3 0 00-3 3v10a3 3 0 003 3h6a3 3 0 003-3V9a1 1 0 10-2 0v5a1 1 0 11-2 0V4z" />
                    </svg>
                    <p className="font-medium text-neutral-900">Resume {index + 1}</p>
                  </div>
                  <p className="text-sm text-neutral-600">{resume.fileName || 'Resume PDF'}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Uploaded {new Date(resume.uploadedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-neutral-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-neutral-500">No resumes uploaded yet</p>
          </div>
        )}
      </div>

      {/* Education Card */}
      {user?.highestQualification && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-neutral-200">Education Details</h2>

          <div className="mb-6 pb-6 border-b border-neutral-200">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Highest Qualification</label>
            <p className="text-neutral-900 mt-2 font-medium capitalize text-lg">{user.highestQualification}</p>
          </div>

          <div className="space-y-6">
            {/* 10th */}
            {levelsToShow.includes('tenth') && user.qualifications?.tenth && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                <h3 className="font-semibold text-neutral-900 mb-4">10th Standard</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['percentage', 'cgpa', 'board', 'schoolName', 'yearOfPassing'].map((field) => (
                    <div key={field}>
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                        {field === 'schoolName' ? 'School Name' : field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <p className="text-neutral-900 mt-1">{user.qualifications.tenth[field] || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 12th */}
            {levelsToShow.includes('twelfth') && user.qualifications?.twelfth && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                <h3 className="font-semibold text-neutral-900 mb-4">12th Standard</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['percentage', 'cgpa', 'board', 'stream', 'schoolName', 'yearOfPassing'].map((field) => (
                    <div key={field}>
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                        {field === 'schoolName' ? 'School' : field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <p className="text-neutral-900 mt-1">{user.qualifications.twelfth[field] || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Graduation */}
            {levelsToShow.includes('graduation') && user.qualifications?.graduation && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                <h3 className="font-semibold text-neutral-900 mb-4">Graduation</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['percentage', 'cgpa', 'degree', 'specialization', 'university', 'collegeName', 'yearOfPassing'].map((field) => (
                    <div key={field}>
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                        {field === 'collegeName' ? 'College' : field === 'yearOfPassing' ? 'Year' : field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <p className="text-neutral-900 mt-1">{user.qualifications.graduation[field] || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post Graduation */}
            {levelsToShow.includes('postgraduation') && user.qualifications?.postgraduation && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                <h3 className="font-semibold text-neutral-900 mb-4">Post Graduation</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['percentage', 'cgpa', 'degree', 'specialization', 'university', 'collegeName', 'yearOfPassing'].map((field) => (
                    <div key={field}>
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                        {field === 'collegeName' ? 'College' : field === 'yearOfPassing' ? 'Year' : field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <p className="text-neutral-900 mt-1">{user.qualifications.postgraduation[field] || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
