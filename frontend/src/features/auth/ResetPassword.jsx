import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function ResetPassword() {
  const { token } = useParams();

  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const result = await resetPassword(token, password);

      if (!result.success) {
        setError(result.message || 'Failed to reset password');
        return;
      }

      setSuccess('Password reset successful. You can now login.');

      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-[400px]">
        <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>

        <label className="block mb-2 font-medium">New Password</label>

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <label className="block mb-2 font-medium">Confirm Password</label>

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}

        {success && <p className="text-green-600 mb-2">{success}</p>}

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
