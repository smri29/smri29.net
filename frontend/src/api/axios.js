import axios from 'axios';
import { getTurnstileGateToken } from '../analytics/tracker';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const gateToken = getTurnstileGateToken();
  if (gateToken) {
    config.headers['x-turnstile-gate-token'] = gateToken;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default API;
