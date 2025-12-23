import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({
        email: form.email,
        password: form.password
      });

      if (response.success) {
        alert('Login successful!');
        navigate('/');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="card max-w-md w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl mb-2">Welcome back</h1>
          <p className="text-neutral-600">Sign in to your account to continue</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 divider"></div>
        <p className="text-center text-sm text-neutral-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-neutral-900 hover:text-neutral-700 underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
