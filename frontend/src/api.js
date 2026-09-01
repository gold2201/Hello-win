import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sustainer-removing-hassle.ngrok-free.dev/api/',
});

// Добавляем access-токен к каждому запросу
api.interceptors.request.use((config) => {
  config.headers['ngrok-skip-browser-warning'] = 'true';

  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
