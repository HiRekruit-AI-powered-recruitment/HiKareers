import React, { useState, useEffect } from 'react';
import { userAPI } from '../api';

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profileForm, setProfileForm] = useState({
    mobile: '',
  });

  const [highestQualification, setHighestQualification] = useState('');
  const [qualifications, setQualifications] = useState({
    tenth: { completed: false, percentage: '', cgpa: '', board: '', schoolName: '', yearOfPassing: '' },
    twelfth: { completed: false, percentage: '', cgpa: '', board: '', schoolName: '', stream: '', yearOfPassing: '' },
    graduation: { completed: false, percentage: '', cgpa: '', degree: '', university: '', collegeName: '', specialization: '', yearOfPassing: '' },
    postgraduation: { completed: false, percentage: '', cgpa: '', degree: '', university: '', collegeName: '', specialization: '', yearOfPassing: '' }
  });

  const [resumeFiles, setResumeFiles] = useState([null, null, null]);
  const [uploadedResumes, setUploadedResumes] = useState([null, null, null]);

  useEffect(() => {
    loadUserProfile();
  }, []);

  async function loadUserProfile() {
    try {
      const response = await userAPI.getCurrentUser();
      if (response.success) {
        const userData = response.data;
        setUser(userData);
        setProfileForm({ mobile: userData.mobile || '' });
        setHighestQualification(userData.highestQualification || '');
        setQualifications(userData.qualifications || qualifications);

        // Normalize resumes into a 3-slot array indexed 0..2
        const slots = [null, null, null];
        const resumes = userData.resumes || {};
        if (Array.isArray(resumes)) {
          resumes.forEach((r, idx) => {
            if (r) slots[idx] = { ...r, slot: idx + 1 };
          });
        } else {
          // resumes stored as object with numeric keys 1..3
          for (let i = 1; i <= 3; i++) {
            const r = resumes[i] || resumes[String(i)];
            if (r) slots[i - 1] = { ...r, slot: i };
          }
        }
        setUploadedResumes(slots);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleMobileChange(e) {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '');
    setProfileForm({ ...profileForm, mobile: numericValue });
    setError('');
  }

  function handleQualificationChange(level, field, value) {
    setQualifications(prev => ({
      ...prev,
      [level]: { ...prev[level], [field]: value }
    }));
  }

  function handleResumeChange(index, file) {
    const newFiles = [...resumeFiles];
    newFiles[index] = file;
    setResumeFiles(newFiles);
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (profileForm.mobile && profileForm.mobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits');
      setSaving(false);
      return;
    }

    if (profileForm.mobile && !/^\d{10}$/.test(profileForm.mobile)) {
      setError('Mobile number must contain only digits');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        mobile: profileForm.mobile,
        highestQualification,
        qualifications
      };

      const response = await userAPI.updateProfile(payload);
      if (response.success) {
        setSuccess('Profile updated successfully!');
        await loadUserProfile();
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadResume(index) {
    if (!resumeFiles[index]) {
      setError('No file selected for upload');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('resume', resumeFiles[index]);
      formData.append('sequence', index + 1);

      const response = await userAPI.uploadResume(formData);
      if (response.success) {
        setSuccess(response.message || 'Resume uploaded successfully');

        const slots = [null, null, null];
        const resumes = response.data || {};
        if (Array.isArray(resumes)) {
          resumes.forEach((r, idx) => {
            if (r) slots[idx] = { ...r, slot: idx + 1 };
          });
        } else {
          for (let i = 1; i <= 3; i++) {
            const r = resumes[i] || resumes[String(i)];
            if (r) slots[i - 1] = { ...r, slot: i };
          }
        }
        setUploadedResumes(slots);

        const newFiles = [...resumeFiles];
        newFiles[index] = null;
        setResumeFiles(newFiles);
      } else {
        setError(response.message || 'Failed to upload resume');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mb-4"></div>
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Card */}
      <div className="card">
        <h1 className="text-3xl font-semibold mb-2">Edit Profile</h1>
        <p className="text-neutral-600">Update your personal information and education details</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Basic Information Card */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={user?.fullName || ''}
                disabled
                className="input bg-neutral-100 text-neutral-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input flex-1 bg-neutral-100 text-neutral-500 cursor-not-allowed"
                />
                {user?.emailVerified ? (
                  <div className="flex items-end">
                    <span className="badge badge-success">✓ Verified</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => alert('Email verification will be implemented')}
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                value={profileForm.mobile}
                onChange={handleMobileChange}
                placeholder="9999999999"
                maxLength="10"
                className={`input ${
                  profileForm.mobile && profileForm.mobile.length !== 10
                    ? 'border-red-300 focus:ring-red-900'
                    : ''
                }`}
              />
              {profileForm.mobile && profileForm.mobile.length !== 10 && (
                <p className="text-xs text-red-600 mt-2">
                  Must be exactly 10 digits ({profileForm.mobile.length}/10)
                </p>
              )}
              {profileForm.mobile && profileForm.mobile.length === 10 && (
                <p className="text-xs text-emerald-600 mt-2">✓ Valid mobile number</p>
              )}
            </div>
            {profileForm.mobile && profileForm.mobile.length === 10 && (
              <div className="flex items-end">
                {user?.mobileVerified ? (
                  <span className="badge badge-success">✓ Verified</span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => alert('Mobile verification will be implemented')}
                  >
                    Verify
                  </button>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Resume Upload Card */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Upload Resumes</h2>
        <p className="text-neutral-600 text-sm mb-6">You can upload up to 3 resumes</p>
        
        <div className="space-y-4 mb-6">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <label className="block">
                <div className="relative border-2 border-dashed border-neutral-200 rounded-xl p-6 cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleResumeChange(index, e.target.files?.[0])}
                    className="hidden"
                  />
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      {resumeFiles[index] ? (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-emerald-700 font-medium">New: {resumeFiles[index].name}</span>
                        </div>
                      ) : uploadedResumes[index] ? (
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Resume {index + 1}</p>
                          <p className="text-xs text-neutral-600">{uploadedResumes[index].fileName}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Resume {index + 1}</p>
                          <p className="text-xs text-neutral-600">Click to select a PDF file</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </label>
              
              {uploadedResumes[index] && (
                <div className="flex items-center gap-2 mt-2 p-3 bg-neutral-50 rounded-lg">
                  <a
                    href={uploadedResumes[index].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    View Current Resume
                  </a>
                  <p className="text-xs text-neutral-500">
                    {new Date(uploadedResumes[index].uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleUploadResume(index)}
                  disabled={saving || !resumeFiles[index]}
                  className="btn btn-primary btn-sm"
                >
                  {saving ? 'Uploading...' : 'Upload'}
                </button>
                {resumeFiles[index] && (
                  <p className="text-sm text-neutral-600 self-center">Selected: {resumeFiles[index].name}</p>
                )}
              </div>
            </div>
          ))}
        </div>


      </div>

      {/* Education Details Card */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Education Details</h2>
        
        <div className="mb-8">
          <label className="label">Highest Qualification *</label>
          <select
            value={highestQualification}
            onChange={(e) => setHighestQualification(e.target.value)}
            className="input"
          >
            <option value="">Select your highest qualification</option>
            <option value="10th">10th Standard</option>
            <option value="12th">12th Standard</option>
            <option value="graduation">Graduation</option>
            <option value="postgraduation">Post Graduation</option>
          </select>
          <p className="text-xs text-neutral-500 mt-2">Select your highest completed qualification to fill in details</p>
        </div>

        {highestQualification && (
          <div className="space-y-6">
            {/* 10th Details */}
            {['10th', '12th', 'graduation', 'postgraduation'].includes(highestQualification) && (
              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
                <h3 className="font-semibold text-neutral-900 mb-5">10th Standard</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Percentage</label>
                    <input
                      type="number"
                      step="0.01"
                      value={qualifications.tenth.percentage}
                      onChange={(e) => handleQualificationChange('tenth', 'percentage', e.target.value)}
                      className="input"
                      placeholder="85.5"
                    />
                  </div>
                  <div>
                    <label className="label">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={qualifications.tenth.cgpa}
                      onChange={(e) => handleQualificationChange('tenth', 'cgpa', e.target.value)}
                      className="input"
                      placeholder="9.5"
                    />
                  </div>
                  <div>
                    <label className="label">Board</label>
                    <input
                      type="text"
                      value={qualifications.tenth.board}
                      onChange={(e) => handleQualificationChange('tenth', 'board', e.target.value)}
                      className="input"
                      placeholder="CBSE"
                    />
                  </div>
                  <div>
                    <label className="label">School Name</label>
                    <input
                      type="text"
                      value={qualifications.tenth.schoolName}
                      onChange={(e) => handleQualificationChange('tenth', 'schoolName', e.target.value)}
                      className="input"
                      placeholder="School Name"
                    />
                  </div>
                  <div>
                    <label className="label">Year of Passing</label>
                    <input
                      type="number"
                      value={qualifications.tenth.yearOfPassing}
                      onChange={(e) => handleQualificationChange('tenth', 'yearOfPassing', e.target.value)}
                      className="input"
                      placeholder="2020"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 12th Details */}
            {['12th', 'graduation', 'postgraduation'].includes(highestQualification) && (
              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
                <h3 className="font-semibold text-neutral-900 mb-5">12th Standard</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Percentage</label>
                    <input
                      type="number"
                      step="0.01"
                      value={qualifications.twelfth.percentage}
                      onChange={(e) => handleQualificationChange('twelfth', 'percentage', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={qualifications.twelfth.cgpa}
                      onChange={(e) => handleQualificationChange('twelfth', 'cgpa', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Board</label>
                    <input
                      type="text"
                      value={qualifications.twelfth.board}
                      onChange={(e) => handleQualificationChange('twelfth', 'board', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Stream</label>
                    <input
                      type="text"
                      value={qualifications.twelfth.stream}
                      onChange={(e) => handleQualificationChange('twelfth', 'stream', e.target.value)}
                      className="input"
                      placeholder="Science/Commerce/Arts"
                    />
                  </div>
                  <div>
                    <label className="label">School Name</label>
                    <input
                      type="text"
                      value={qualifications.twelfth.schoolName}
                      onChange={(e) => handleQualificationChange('twelfth', 'schoolName', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Year of Passing</label>
                    <input
                      type="number"
                      value={qualifications.twelfth.yearOfPassing}
                      onChange={(e) => handleQualificationChange('twelfth', 'yearOfPassing', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Graduation Details */}
            {['graduation', 'postgraduation'].includes(highestQualification) && (
              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
                <h3 className="font-semibold text-neutral-900 mb-5">Graduation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Percentage</label>
                    <input
                      type="number"
                      step="0.01"
                      value={qualifications.graduation.percentage}
                      onChange={(e) => handleQualificationChange('graduation', 'percentage', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={qualifications.graduation.cgpa}
                      onChange={(e) => handleQualificationChange('graduation', 'cgpa', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Degree</label>
                    <input
                      type="text"
                      value={qualifications.graduation.degree}
                      onChange={(e) => handleQualificationChange('graduation', 'degree', e.target.value)}
                      className="input"
                      placeholder="B.Tech, B.Sc, BCA"
                    />
                  </div>
                  <div>
                    <label className="label">Specialization</label>
                    <input
                      type="text"
                      value={qualifications.graduation.specialization}
                      onChange={(e) => handleQualificationChange('graduation', 'specialization', e.target.value)}
                      className="input"
                      placeholder="Computer Science"
                    />
                  </div>
                  <div>
                    <label className="label">University</label>
                    <input
                      type="text"
                      value={qualifications.graduation.university}
                      onChange={(e) => handleQualificationChange('graduation', 'university', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">College Name</label>
                    <input
                      type="text"
                      value={qualifications.graduation.collegeName}
                      onChange={(e) => handleQualificationChange('graduation', 'collegeName', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Year of Passing</label>
                    <input
                      type="number"
                      value={qualifications.graduation.yearOfPassing}
                      onChange={(e) => handleQualificationChange('graduation', 'yearOfPassing', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Post Graduation Details */}
            {highestQualification === 'postgraduation' && (
              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
                <h3 className="font-semibold text-neutral-900 mb-5">Post Graduation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Percentage</label>
                    <input
                      type="number"
                      step="0.01"
                      value={qualifications.postgraduation.percentage}
                      onChange={(e) => handleQualificationChange('postgraduation', 'percentage', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={qualifications.postgraduation.cgpa}
                      onChange={(e) => handleQualificationChange('postgraduation', 'cgpa', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Degree</label>
                    <input
                      type="text"
                      value={qualifications.postgraduation.degree}
                      onChange={(e) => handleQualificationChange('postgraduation', 'degree', e.target.value)}
                      className="input"
                      placeholder="M.Tech, M.Sc, MCA"
                    />
                  </div>
                  <div>
                    <label className="label">Specialization</label>
                    <input
                      type="text"
                      value={qualifications.postgraduation.specialization}
                      onChange={(e) => handleQualificationChange('postgraduation', 'specialization', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">University</label>
                    <input
                      type="text"
                      value={qualifications.postgraduation.university}
                      onChange={(e) => handleQualificationChange('postgraduation', 'university', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">College Name</label>
                    <input
                      type="text"
                      value={qualifications.postgraduation.collegeName}
                      onChange={(e) => handleQualificationChange('postgraduation', 'collegeName', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Year of Passing</label>
                    <input
                      type="number"
                      value={qualifications.postgraduation.yearOfPassing}
                      onChange={(e) => handleQualificationChange('postgraduation', 'yearOfPassing', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn btn-primary btn-lg w-full mt-2"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
