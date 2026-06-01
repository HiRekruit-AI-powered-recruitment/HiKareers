import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || '/', { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  function validateForm() {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (!form.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    const email = form.email.trim();
    if (!email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      errors.password = 'Password is required';
    } else if (!passwordRegex.test(form.password)) {
      errors.password =
        'Password must be at least 8 characters and include a letter and a number';
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
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

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('email', form.email);
      formData.append('password', form.password);
      if (profilePhoto) formData.append('profilePhoto', profilePhoto);

      const result = await signup(formData);

      if (result.success) {
        navigate('/login', {
          state: { success: true, from: location.state?.from },
          replace: true,
        });
        return;
      }

      setError(result.message || 'Failed to create account. Please try again.');
    } catch (error) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-600">Join HiKareers to get started</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full px-4 py-2 border rounded-md ${
                formErrors.fullName ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              disabled={loading}
            />
            {formErrors.fullName && (
              <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full px-4 py-2 border rounded-md ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              disabled={loading}
              autoComplete="email"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-md ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={loading}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-md ${
                  formErrors.confirmPassword
                    ? 'border-red-500'
                    : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={loading}
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo (Optional)
            </label>
            <div className="w-full">
              <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                {photoPreview ? (
                  <div className="text-center">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover mb-2 mx-auto border-2 border-gray-200"
                    />
                    <p className="text-sm text-gray-600">
                      Click to change photo
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-2">
                      <svg
                        className="w-6 h-6 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-900 text-sm font-medium">
                      Upload profile photo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 2MB
                    </p>
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              state={{ from: location.state?.from }}
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
