import axios from 'axios';

const api = axios.create({
  baseURL: 'https://online-quiz-8xb0.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
