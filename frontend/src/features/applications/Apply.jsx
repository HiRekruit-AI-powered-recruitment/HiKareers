import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applicationAPI } from './api';
import { userAPI } from '../profile/api';
import { isAuthenticated, getCurrentUser } from '../../utils/auth.js';
import ProfileCompletionBanner from '../profile/components/ProfileCompletionBanner.jsx';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

export default function Apply() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

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

  const isLoggedIn = isAuthenticated();

  const [form, setForm] = useState({
    jobId: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    educationDetails: {
      highestQualification: '',
      percentage: '',
      cgpa: '',
      yearOfPassing: '',
    },
    backlogs: '0',
    selectedResumeUrl: '',
  });

  // New state for direct file upload
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [resumeMode, setResumeMode] = useState('profile'); // 'profile' | 'upload'

  const params = useParams();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    loadUserData();
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (params?.jobId) {
      setForm((prev) => ({ ...prev, jobId: params.jobId }));
    }
  }, [params?.jobId]);

  function isProfileComplete(user) {
    if (!user) return false;
    const hasResume = normalizeResumes(user.resumes).length > 0;
    return Boolean(
      user.profileCompleted ||
      (user.fullName && user.mobile && user.highestQualification && hasResume)
    );
  }

  async function loadUserData() {
    try {
      setLoading(true);
      const response = await userAPI.getCurrentUser();
      if (response.success) {
        const userData = response.data;
        setUser(userData);

        // Map highestQualification to qualifications object key
        const qualificationMap = {
          '10th': 'tenth',
          '12th': 'twelfth',
          graduation: 'graduation',
          postgraduation: 'postgraduation',
        };

        const qualKey = qualificationMap[userData.highestQualification];
        const qualData = qualKey ? userData.qualifications?.[qualKey] : null;

        // Pre-fill form with user data
        setForm((prev) => ({
          ...prev,
          fullName: userData.fullName || '',
          email: userData.email || '',
          mobileNumber: userData.mobile || '',
          educationDetails: {
            highestQualification: userData.highestQualification || '',
            percentage: qualData?.percentage || '',
            cgpa: qualData?.cgpa || '',
            yearOfPassing: qualData?.yearOfPassing || '',
          },
        }));

        // Set first resume as default if available
        const firstResume = normalizeResumes(userData.resumes)[0];
        if (firstResume && firstResume.url) {
          setForm((prev) => ({
            ...prev,
            selectedResumeUrl: firstResume.url,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      const cachedUser = getCurrentUser();
      setUser(cachedUser);
      if (cachedUser) {
        setForm((prev) => ({
          ...prev,
          fullName: cachedUser.fullName || '',
          email: cachedUser.email || '',
        }));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setFileError('');
    setUploadedFile(null);
    if (!file) return;

    // Validate file type
    const ext = file.name.split('.').pop().toLowerCase();
    if (
      !ALLOWED_FILE_TYPES.includes(file.type) &&
      !ALLOWED_EXTENSIONS.includes(ext)
    ) {
      setFileError('Only PDF, DOC, or DOCX files are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size must be under 5MB.');
      e.target.value = '';
      return;
    }
    setUploadedFile(file);
  }

  function handleEducationChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      educationDetails: {
        ...prev.educationDetails,
        [name]: value,
      },
    }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (!form.jobId.trim()) {
      setError('Job ID is required');
      return;
    }

    if (!form.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!form.mobileNumber.toString().trim()) {
      setError('Mobile number is required');
      return;
    }

    // Resume validation
    if (resumeMode === 'upload' && !uploadedFile) {
      setError('Please upload your resume (PDF, DOC, or DOCX).');
      return;
    }

    if (resumeMode === 'profile' && !form.selectedResumeUrl) {
      setError('Please select a resume from your profile.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    // allows UI to update instantly before upload starts
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      let response;

      if (resumeMode === 'upload' && uploadedFile) {
        // Send as multipart/form-data with the actual file
        const formData = new FormData();

        formData.append('resume', uploadedFile);
        formData.append('jobId', form.jobId);
        formData.append('fullName', form.fullName);
        formData.append('email', form.email);
        formData.append('mobileNumber', form.mobileNumber);
        formData.append('backlogs', form.backlogs);

        if (form.educationDetails.highestQualification) {
          formData.append(
            'educationDetails',
            JSON.stringify(form.educationDetails)
          );
        }

        response = await applicationAPI.createApplicationWithFile(formData);
      } else {
        // Send JSON with existing resume URL from profile
        response = await applicationAPI.createApplication({
          jobId: form.jobId,
          fullName: form.fullName,
          email: form.email,
          mobileNumber: form.mobileNumber,
          educationDetails: form.educationDetails.highestQualification
            ? form.educationDetails
            : null,
          backlogs: form.backlogs,
          resumeUrl: form.selectedResumeUrl,
        });
      }

      if (response.success) {
        setSuccess('Application submitted successfully!');

        // removed unnecessary 2 second delay
        navigate('/applications');
      } else {
        setError(response.message || 'Application submission failed');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Application submission failed'
      );

      console.error('Application error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mb-4"></div>
          <p className="text-neutral-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const showCompletionBanner = user && !user.profileCompleted;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Profile Completion Banner */}
      {showCompletionBanner && (
        <div className="mb-6">
          <ProfileCompletionBanner />
        </div>
      )}

      {/* Apply Form Card */}
      <div className="card">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Application</h1>
          <p className="text-neutral-600">
            Fill in the details below to submit your application
          </p>
        </div>

        {/* Error Alert */}
        {error && <div className="alert alert-error mb-6">{error}</div>}

        {/* Success Alert */}
        {success && <div className="alert alert-success mb-6">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job ID Section */}
          <div className="space-y-2">
            <label className="label font-semibold">Job ID *</label>
            <input
              type="text"
              name="jobId"
              value={form.jobId}
              onChange={handleFormChange}
              placeholder="e.g., JOB-1234"
              className="input"
              required
              disabled={submitting}
            />
            <p className="text-xs text-neutral-500">
              Enter the ID of the job position you're applying for
            </p>
          </div>

          {/* Personal Information Section */}
          <div className="pt-6 border-t border-neutral-200">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="label font-semibold">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleFormChange}
                  placeholder="Your full name"
                  className="input"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <label className="label font-semibold">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="your@email.com"
                  className="input"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <label className="label font-semibold">Mobile Number *</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={form.mobileNumber}
                  onChange={handleFormChange}
                  placeholder="10-digit mobile number"
                  className="input"
                  required
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Education Details Section */}
          <div className="pt-6 border-t border-neutral-200">
            <h2 className="text-xl font-semibold mb-4">
              Education Details (Optional)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="label font-semibold">
                  Highest Qualification
                </label>
                <select
                  name="highestQualification"
                  value={form.educationDetails.highestQualification}
                  onChange={handleEducationChange}
                  className="input"
                  disabled={submitting}
                >
                  <option value="">Select qualification</option>
                  <option value="10th">10th</option>
                  <option value="12th">12th</option>
                  <option value="graduation">Graduation</option>
                  <option value="postgraduation">Postgraduation</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="label font-semibold">Percentage / CGPA</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="percentage"
                    value={form.educationDetails.percentage}
                    onChange={handleEducationChange}
                    placeholder="Percentage"
                    min="0"
                    max="100"
                    step="0.01"
                    className="input"
                    disabled={submitting}
                  />
                  <input
                    type="number"
                    name="cgpa"
                    value={form.educationDetails.cgpa}
                    onChange={handleEducationChange}
                    placeholder="CGPA"
                    min="0"
                    max="10"
                    step="0.01"
                    className="input"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label font-semibold">Year of Passing</label>
                <input
                  type="number"
                  name="yearOfPassing"
                  value={form.educationDetails.yearOfPassing}
                  onChange={handleEducationChange}
                  placeholder="e.g., 2024"
                  min="1990"
                  max={new Date().getFullYear() + 5}
                  className="input"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Academic Details Section */}
          <div className="pt-6 border-t border-neutral-200">
            <h2 className="text-xl font-semibold mb-4">Academic Details</h2>

            <div className="space-y-2">
              <label className="label font-semibold">Backlogs *</label>
              <select
                name="backlogs"
                value={form.backlogs}
                onChange={handleFormChange}
                className="input"
                required
                disabled={submitting}
              >
                <option value="0">No backlogs (0)</option>
                <option value="1">1 backlog</option>
                <option value="2+">2 or more backlogs (2+)</option>
              </select>
            </div>
          </div>

          {/* Resume Section */}
          <div className="pt-6 border-t border-neutral-200">
            <h2 className="text-xl font-semibold mb-4">Resume *</h2>

            {/* Resume mode toggle */}
            <div className="flex gap-3 mb-5">
              <button
                type="button"
                onClick={() => setResumeMode('profile')}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  resumeMode === 'profile'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                }`}
              >
                Select from Profile
              </button>
              <button
                type="button"
                onClick={() => setResumeMode('upload')}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  resumeMode === 'upload'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                }`}
              >
                Upload New Resume
              </button>
            </div>

            {/* Profile resume selection */}
            {resumeMode === 'profile' &&
              (normalizeResumes(user?.resumes).length > 0 ? (
                <div className="space-y-3">
                  {normalizeResumes(user?.resumes).map((resume, index) => (
                    <label
                      key={index}
                      className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition"
                      style={{
                        borderColor:
                          form.selectedResumeUrl === resume.url
                            ? '#171717'
                            : '#e5e7eb',
                        backgroundColor:
                          form.selectedResumeUrl === resume.url
                            ? '#f5f5f5'
                            : 'transparent',
                      }}
                    >
                      <input
                        type="radio"
                        name="selectedResumeUrl"
                        value={resume.url}
                        checked={form.selectedResumeUrl === resume.url}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            selectedResumeUrl: e.target.value,
                          }))
                        }
                        className="mt-1"
                        disabled={submitting}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <svg
                            className="w-5 h-5 text-neutral-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4 4a2 2 0 012-2h6a1 1 0 00-1-1H6a3 3 0 00-3 3v10a3 3 0 003 3h6a3 3 0 003-3V9a1 1 0 10-2 0v5a1 1 0 11-2 0V4z" />
                          </svg>
                          <p className="font-medium text-neutral-900">
                            Resume {index + 1}
                          </p>
                        </div>
                        <p className="text-sm text-neutral-600">
                          {resume.fileName || 'Resume PDF'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Uploaded{' '}
                          {new Date(resume.uploadedAt).toLocaleDateString(
                            'en-US',
                            { year: 'numeric', month: 'short', day: 'numeric' }
                          )}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200">
                  <svg
                    className="w-12 h-12 text-neutral-300 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-neutral-600 font-medium">
                    No resumes in your profile
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Switch to "Upload New Resume" above, or add one in your
                    profile
                  </p>
                </div>
              ))}

            {/* Direct file upload */}
            {resumeMode === 'upload' && (
              <div className="space-y-3">
                <label
                  htmlFor="resume-upload"
                  className="flex flex-col items-center justify-center w-full py-10 border-2 border-dashed rounded-xl cursor-pointer transition"
                  style={{
                    borderColor: uploadedFile ? '#171717' : '#e5e7eb',
                    backgroundColor: uploadedFile ? '#f5f5f5' : 'transparent',
                  }}
                >
                  {uploadedFile ? (
                    <div className="text-center">
                      <svg
                        className="w-10 h-10 text-green-600 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="font-semibold text-neutral-900">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">
                        {(uploadedFile.size / 1024).toFixed(1)} KB — click to
                        change
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="w-10 h-10 text-neutral-400 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <p className="text-neutral-600 font-medium">
                        Click to upload your resume
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">
                        PDF, DOC, or DOCX — max 5MB
                      </p>
                    </div>
                  )}
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={submitting}
                  />
                </label>
                {fileError && (
                  <p className="text-sm text-red-600">{fileError}</p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-neutral-200">
            <button
              type="submit"
              disabled={
                submitting ||
                (resumeMode === 'profile' && !form.selectedResumeUrl) ||
                (resumeMode === 'upload' && !uploadedFile)
              }
              className="btn btn-primary btn-lg w-full"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Application...</span>
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>

        {/* Info Card */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-neutral-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">
                Application Guidelines
              </p>
              <ul className="text-sm text-neutral-600 mt-2 space-y-1 list-disc list-inside">
                <li>Ensure all required fields are filled accurately</li>
                <li>You can only apply once per job position</li>
                <li>Your resume will be uploaded to our secure server</li>
                <li>Applications after the deadline will not be accepted</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
