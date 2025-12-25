import React, { useEffect, useState } from "react";
import { userAPI } from "./api";
import EmailVerificationDialog from "./components/EmailVerificationDialog.jsx";
import MobileVerificationDialog from "./components/MobileVerificationDialog.jsx";

const EMPTY_QUALIFICATIONS = {
  tenth: { startYear: "", endYear: "", percentage: ""},
  twelfth: { startYear: "", endYear: "", percentage: ""},
  graduation: { courseName: "", startYear: "", endYear: "", cgpa: "", degree: "", specialization: ""},
  postgraduation: { courseName: "", startYear: "", endYear: "", cgpa: "", degree: "",  specialization: ""},
};

function normalizeQualifications(value = {}) {
  const { completed: _, ...tenthRest } = value.tenth || {};
  const { completed: __, ...twelfthRest } = value.twelfth || {};
  const { completed: ___, ...graduationRest } = value.graduation || {};
  const { completed: ____, ...postgraduationRest } = value.postgraduation || {};

  return {
    tenth: { ...EMPTY_QUALIFICATIONS.tenth, ...tenthRest },
    twelfth: { ...EMPTY_QUALIFICATIONS.twelfth, ...twelfthRest },
    graduation: { ...EMPTY_QUALIFICATIONS.graduation, ...graduationRest },
    postgraduation: { ...EMPTY_QUALIFICATIONS.postgraduation, ...postgraduationRest },
  };
}

function buildPayload({ form, highestQualification, qualifications, original }) {
  const payload = {};

  if (form.fullName !== original.fullName) payload.fullName = form.fullName;

  const nextMobile = form.mobile?.replace(/\D/g, "");
  const prevMobile = original.mobile?.replace(/\D/g, "");
  if (nextMobile && nextMobile !== prevMobile) payload.mobile = nextMobile;

  if (highestQualification !== original.highestQualification)
    payload.highestQualification = highestQualification;

  if (JSON.stringify(qualifications) !== JSON.stringify(normalizeQualifications(original.qualifications)))
    payload.qualifications = qualifications;

  return payload;
}

export default function EditProfile() {
  // all your existing state here:
  // user, originalUser, form, qualifications, resumeFiles, etc.
  // loadProfile, saveProfile, uploadResume, onFormChange, onQualificationChange...
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ fullName: "", mobile: "" });
  const [highestQualification, setHighestQualification] = useState("");
  const [qualifications, setQualifications] = useState(EMPTY_QUALIFICATIONS);

  const [resumeFiles, setResumeFiles] = useState([null, null, null]);
  const [uploadedResumes, setUploadedResumes] = useState([null, null, null]);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showMobileDialog, setShowMobileDialog] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await userAPI.getCurrentUser();
      if (res.success) {
        const u = res.data;
        setUser(u);
        setOriginalUser(u);
        setForm({ fullName: u.fullName || "", mobile: u.mobile || "" });
        setHighestQualification(u.highestQualification || "");
        setQualifications(normalizeQualifications(u.qualifications));

        const slots = [null, null, null];
        const resumes = u.resumes || {};
        Object.keys(resumes).forEach((key) => {
          const idx = parseInt(key, 10) - 1;
          if (idx >= 0 && idx < 3) {
          slots[idx] = { ...resumes[key], slot: idx + 1 };
        }
      });

      setUploadedResumes(slots);
      }
    } catch (e) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  function onFormChange(e) {
    const { name, value } = e.target;
    if (name === "mobile" && user?.mobileVerified) return;
    setForm((f) => ({
      ...f,
      [name]: value
    }));
  }

  function onQualificationChange(level, field, value) {
    setQualifications((q) => ({
      ...q,
      [level]: {
        ...q[level],
        [field]: value
      }
    }));
  }

  async function saveProfile(e) {
    e?.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (form.mobile && form.mobile.length !== 10) {
      setError("Mobile must be 10 digits");
      setSaving(false);
      return;
    }

    try {
      const payload = buildPayload({ form, highestQualification, qualifications, original: originalUser });
      if (!Object.keys(payload).length) {
        setSuccess("No changes to apply");
        setSaving(false);
        return;
      }

      const res = await userAPI.updateProfile(payload);
      if (res.success) {
        setSuccess("Profile updated successfully!");
        await loadProfile();
      } else setError(res.message || "Update failed");
    } catch (e) {
      setError(e.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  function onResumeChange(i, file) {
    const arr = [...resumeFiles];
    arr[i] = file;
    setResumeFiles(arr);
  }

  async function uploadResume(i) {
    if (!resumeFiles[i]) return setError("No file selected");
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const fd = new FormData();
      fd.append("resume", resumeFiles[i]);
      fd.append("sequence", i + 1);
      const res = await userAPI.uploadResume(fd);
      if (res.success) {
        setSuccess(res.message || "Resume uploaded");
        await loadProfile();
        const arr = [...resumeFiles];
        arr[i] = null;
        setResumeFiles(arr);
      } else setError(res.message || "Upload failed");
    } catch (e) {
      setError(e.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
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
      <EmailVerificationDialog
        open={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        email={user?.email}
        onVerified={loadProfile}
      />
      <MobileVerificationDialog
        open={showMobileDialog}
        onClose={() => setShowMobileDialog(false)}
        mobile={form.mobile || user?.mobile}
      />

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <BasicInfoSection
        user={user}
        form={form}
        onFormChange={onFormChange}
        onShowEmail={() => setShowEmailDialog(true)}
        onShowMobile={() => setShowMobileDialog(true)}
      />

      <ResumeSection
        resumeFiles={resumeFiles}
        uploadedResumes={uploadedResumes}
        uploading={uploading}
        onResumeChange={onResumeChange}
        onUploadResume={uploadResume}
      />

      <EducationSection
        highestQualification={highestQualification}
        setHighestQualification={setHighestQualification}
        qualifications={qualifications}
        onQualificationChange={onQualificationChange}
      />

      <div className="mt-4">
        <button
          onClick={saveProfile}
          disabled={saving}
          className="btn btn-primary btn-lg w-full"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}


function EducationSection({
  highestQualification,
  setHighestQualification,
  qualifications,
  onQualificationChange,
}) {
  const LEVELS = ["tenth", "twelfth", "graduation", "postgraduation"];

  const endIndex = LEVELS.indexOf(highestQualification);
  const visibleLevels =
    endIndex >= 0 ? LEVELS.slice(0, endIndex + 1) : [];

  return (
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
          <option value="tenth">10th Standard</option>
          <option value="twelfth">12th Standard</option>
          <option value="graduation">Graduation</option>
          <option value="postgraduation">Post Graduation</option>
        </select>
      </div>

      {visibleLevels.map((level) => (
        <div
          key={level}
          className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl mb-6"
        >
          <h3 className="font-semibold mb-4 capitalize">
            {level}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(qualifications[level]).map((field) => (
              <div key={field}>
                <label className="label">{field}</label>
                <input
                  value={qualifications[level][field]}
                  onChange={(e) =>
                    onQualificationChange(
                      level,
                      field,
                      e.target.value
                    )
                  }
                  className="input"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


function ResumeCard({
  index,
  file,
  uploaded,
  uploading,
  onFileChange,
  onUpload,
}) {
  return (
    <div>
      <label className="block">
        <div className="relative border-2 border-dashed border-neutral-200 rounded-xl p-6 cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => onFileChange(index, e.target.files?.[0])}
            className="hidden"
          />
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="flex-1">
              {file ? (
                <span className="text-sm text-emerald-700 font-medium">
                  New: {file.name}
                </span>
              ) : uploaded ? (
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Resume {index + 1}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {uploaded.fileName || "Resume PDF"}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Resume {index + 1}
                  </p>
                  <p className="text-xs text-neutral-600">
                    Click to select a PDF file
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </label>

      {uploaded && (
        <div className="flex items-center gap-2 mt-2 p-3 bg-neutral-50 rounded-lg">
          <a
            href={uploaded.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm flex-1"
          >
            View Current Resume
          </a>
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => onUpload(index)}
          disabled={uploading || !file}
          className="btn btn-primary btn-sm"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

function ResumeSection({
  resumeFiles,
  uploadedResumes,
  uploading,
  onResumeChange,
  onUploadResume,
}) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">Upload Resumes</h2>
      <p className="text-neutral-600 text-sm mb-6">
        You can upload up to 3 resumes
      </p>

      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <ResumeCard
            key={i}
            index={i}
            file={resumeFiles[i]}
            uploaded={uploadedResumes[i]}
            uploading={uploading}
            onFileChange={onResumeChange}
            onUpload={onUploadResume}
          />
        ))}
      </div>
    </div>
  );
}


function BasicInfoSection({
  user,
  form,
  onFormChange,
  onShowEmail,
  onShowMobile,
}) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={onFormChange}
            className="input"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="label">Email Address</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={user?.email || ""}
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
                onClick={onShowEmail}
              >
                Verify
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="label">Mobile Number</label>
          <input
            name="mobile"
            value={form.mobile}
            onChange={onFormChange}
            maxLength={10}
            disabled={user?.mobileVerified}
            placeholder="9999999999"
            className="input"
          />
          {user?.mobileVerified && (
            <p className="text-xs text-emerald-600 mt-2">
              Mobile verified and locked
            </p>
          )}
        </div>

        <div className="flex items-end">
          {user?.mobileVerified ? (
            <span className="badge badge-success">✓ Verified</span>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={!form.mobile || form.mobile.length !== 10}
              onClick={onShowMobile}
            >
              Verify
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

