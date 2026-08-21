import axios from 'axios';
import { getTurnstileGateToken } from '../analytics/tracker';

const ADMIN_TOKEN_KEY = 'admin_token';

export const getAdminToken = () => {
  try {
    return window.localStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setAdminToken = (token) => {
  try {
    if (token) {
      window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
      return;
    }
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // Ignore storage failures and let auth checks fail gracefully.
  }
};

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const gateToken = getTurnstileGateToken();
  if (gateToken) {
    config.headers['x-turnstile-gate-token'] = gateToken;
  }

  const adminToken = getAdminToken();
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default API;
