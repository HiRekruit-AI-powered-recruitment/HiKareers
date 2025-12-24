// src/features/profile/api.js
import client, { handleRequest } from '../../api.js';

export const userAPI = {
  getCurrentUser: () => handleRequest(client.get('/user/me')),
  updateProfile: (payload) => handleRequest(client.patch('/user/profile', payload)),
  uploadResume: (formData) => handleRequest(
    client.patch('/user/resumes', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    })
  ),
  getUserById: (id) => handleRequest(client.get(`/user/${id}`)),

  // Verification stubs (no backend call yet)
  sendEmailOtp: (email)=>handleRequest(client.post('/verification/send-email-verification-otp', { email })),
  
  verifyEmailOtp: ({ email, otp }) => {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'OTP verified (stub)' }), 300));
  },
  sendMobileOtp: (mobile) => {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: `OTP sent to ${mobile}` }), 400));
  },
  verifyMobileOtp: ({ mobile, otp }) => {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'OTP verified (stub)' }), 300));
  },
};