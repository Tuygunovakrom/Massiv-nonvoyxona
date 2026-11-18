import axios from 'axios';

const http = axios.create({ baseURL: '/api' });

// Har so'rovga token qoshish
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('nv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Xatolarni bir joyda o'zbekcha qaytarish; 401 da chiqarib yuborish
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Server bilan aloqa yoq.';
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('nv_token');
      localStorage.removeItem('nv_user');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(message));
  }
);

export default http;
