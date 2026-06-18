import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../features/auth/api';
import { userAPI } from '../features/profile/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const userData = sessionStorage.getItem('user');

        if (token && userData) {
          setUser(JSON.parse(userData));
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

  // Replace ONLY the login function in your AuthContext.jsx with this:

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response.success && response.data) {
        const { accessToken, user } = response.data;

        if (user.userType !== 'applicant') {
          return {
            success: false,
            message: 'Please use the admin login page.',
          };
        }

        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true, userType: user.userType };
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
    const wasAdmin = ['admin', 'super-admin'].includes(user?.userType);

    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    setUser(null);

    try {
      await authAPI.logout();
    } catch (err) {
      console.warn('Server logout failed:', err);
    } finally {
      navigate(wasAdmin ? '/admin/login' : '/login');
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await authAPI.adminLogin({ email, password });

      if (response.success && response.data) {
        const { accessToken, user } = response.data;

        if (!['admin', 'super-admin'].includes(user.userType)) {
          return {
            success: false,
            message: 'Access denied. Not an admin account.',
          };
        }
        if (user.userType === 'admin' && user.approvalStatus !== 'approved') {
          return {
            success: false,
            message:
              user.approvalStatus === 'pending'
                ? 'Your account is pending approval. You will be notified via email.'
                : 'Your account request was rejected. Please contact support.',
          };
        }

        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true };
      }

      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const adminSignup = async (userData) => {
    try {
      const response = await authAPI.adminRegister(userData);
      if (response.success) {
        return { success: true };
      }
      return {
        success: false,
        message: response.message || 'Registration failed',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Registration failed',
      };
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
    adminLogin,
    adminSignup,
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
