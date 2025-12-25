// src/features/auth/api.js
import client, { handleRequest } from '../../api.js';

export const authAPI = {
  login: (credentials) => handleRequest(client.post('/auth/login', credentials)),
  signup: (userData) => handleRequest(client.post('/auth/register', userData)),
  forgotPassword: (email) => handleRequest(client.post('/auth/forgot-password', { email })),
  resetPassword: (token, password) => handleRequest(client.post('/auth/reset-password', { token, password })),
  verifyEmail: (token) => handleRequest(client.post('/auth/verify-email', { token })),
  logout: () => handleRequest(client.post('/auth/logout')),
};