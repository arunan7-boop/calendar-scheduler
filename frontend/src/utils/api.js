import axios from 'axios';
import { getStoredToken, clearToken } from './tokenStorage';

// Production: Railway backend
// Local dev: Vite proxy (configured in vite.config.js)
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? '/api'
  : 'https://calendar-scheduler-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
