import axios from 'axios';

// In production (Vercel), use the VITE_API_URL env variable
// In development, use the Vite proxy (/api → localhost:5001)
const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  withCredentials: false,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hs_token');
  if (token && token !== 'demo-token') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
