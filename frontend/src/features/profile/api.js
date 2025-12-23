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
};