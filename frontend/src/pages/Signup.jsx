import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userName: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError('');
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError('');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError('Pasdo not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.signup({
        userName: form.userName,
        fullName: form.fullName,
        email: form.email,
        password: form.password
      });

      if (response.success) {
        alert('Account created successfully!');
        navigate('/profile');
      } else {
        setError(response.message || 'Signup failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="card max-w-md w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl mb-2">Create your account</h1>
          <p className="text-neutral-600">Join HireKruit to get started</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="label">Username</label>
            <input
              type="text"
              name="userName"
              value={form.userName}
              onChange={handleChange}
              placeholder="johndoe"
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="label">Confirm</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="input"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="label">Profile Photo (Optional)</label>
            <div className="w-full">
              <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl py-6 px-6 cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition">
                {photoPreview ? (
                  <div className="text-center">
                    <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover mb-2 mx-auto" />
                    <p className="text-sm text-neutral-600">Click to change photo</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 mb-2">
                      <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-neutral-900 text-sm font-medium">Upload profile photo</p>
                    <p className="text-xs text-neutral-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                )}
                <input
                  type="file"
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 divider"></div>
        <p className="text-center text-sm text-neutral-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-neutral-900 hover:text-neutral-700 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
