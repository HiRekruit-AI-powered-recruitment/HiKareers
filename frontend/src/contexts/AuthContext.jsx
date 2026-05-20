// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../features/auth/api';
import { userAPI } from '../features/profile/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const userData = sessionStorage.getItem('user');

        if (token && userData) {
          // Set the user from session storage initially
          setUser(JSON.parse(userData));

          // Then verify the token in the background
          verifyToken();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        setIsLoading(false);
      }
    };

    const verifyToken = async () => {
      try {
        const response = await userAPI.getCurrentUser();
        if (response.success) {
          setUser(response.data);
          sessionStorage.setItem('user', JSON.stringify(response.data));
        } else {
          // Token is invalid, clear it
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response.success && response.data) {
        const { accessToken, user } = response.data;
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);

      if (response.success && response.data) {
        return { success: true };
      }
      return { success: false, message: response.message || 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || 'Signup failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn('Server logout failed:', err);
    } finally {
      // Clear session storage
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');

      // Clear user state
      setUser(null);

      // Navigate to login page directly
      navigate('/login');
    }
  };

  const forgetPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);

      return response;
    } catch (err) {
      console.log(err);

      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.message ||
          'Failed to send reset link',
      };
    }
  };
  const resetPassword = async (token, password) => {
    try {
      const response = await authAPI.resetPassword(token, password);

      return response;
    } catch (err) {
      console.log(err);

      return {
        success: false,
        message:
          err.response?.data?.message || err.message || 'Password reset failed',
      };
    }
  };
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    forgetPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
