import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.MODE === 'development' 
    ? 'http://localhost:5001/api' 
    : '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
