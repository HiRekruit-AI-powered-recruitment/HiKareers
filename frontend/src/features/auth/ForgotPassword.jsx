import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { forgetPassword } = useAuth();

  async function sendResetLink() {
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please provide email');
      return;
    }

    try {
      setLoading(true);

      const result = await forgetPassword(email);

      if (!result.success) {
        setError(
          result.message ||
            "Couldn't send the reset link. Check your email again."
        );
        return;
      }

      setSuccess('Password reset link sent to your email');
      setEmail('');
    } catch (error) {
      setError(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-[400px]">
        <h1 className="text-2xl font-bold mb-4 text-center">Forgot Password</h1>

        <label className="block mb-2 font-medium">Email</label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}

        {success && <p className="text-green-600 mb-2">{success}</p>}

        <button
          onClick={sendResetLink}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
