// src/api.js
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';

const client = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
client.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 Unauthorized
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function authHeaders() {
  const token = sessionStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function handleRequest(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      return { success: false, message: 'Session expired. Please log in again.', statusCode: 401 };
    }
    return { 
      success: false, 
      message: err.response?.data?.message || err.message || 'Network error',
      statusCode: err.response?.status 
    };
  }
}

export default client;