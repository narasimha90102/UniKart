import axios from 'axios';

const api = axios.create({
  // In dev, Vite proxies /api → http://localhost:5000/api
  baseURL: import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('unikart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle session expiration

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if the error is 401 AND we are NOT currently trying to log in
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      // Clear session data if token is invalid or expired
      localStorage.removeItem('unikart_token');
      localStorage.removeItem('unikart_user');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);


export default api;
