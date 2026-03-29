import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const API_ROOT_URL =
  import.meta.env.VITE_API_ROOT ||
  (API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL);

const getStoredToken = (): string | null => {
  const token = localStorage.getItem('auth-storage');
  if (!token) return null;

  try {
    const parsed = JSON.parse(token);
    return parsed.state?.token || null;
  } catch (e) {
    console.error('Error parsing auth token:', e);
    return null;
  }
};

const attachAuthInterceptor = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.request.use(
    (config) => {
      const token = getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const rootApi = axios.create({
  baseURL: API_ROOT_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

attachAuthInterceptor(api);
attachAuthInterceptor(rootApi);

export default api;