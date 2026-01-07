import axios from 'axios';

const API = axios.create({
  // Ensure this matches your backend server port
  baseURL: 'http://localhost:5000/api', 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;