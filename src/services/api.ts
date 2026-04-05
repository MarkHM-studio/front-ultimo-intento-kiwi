import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const API_ROOT_URL =
  import.meta.env.VITE_API_ROOT ||
  (API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL);

const getStoredToken = (): string | null => {
  const token = sessionStorage.getItem('auth-storage');
  if (!token) return null;

  try {
    const parsed = JSON.parse(token);
    return parsed.state?.token || null;
  } catch (e) {
    console.error('Error parsing auth token:', e);
    return null;
  }
};

const shouldLogApiDetails = () => {
  const envToggle = import.meta.env.VITE_SHOW_API_ERROR_DETAILS === 'true';
  const localToggle = localStorage.getItem('show_api_error_details') === 'true';
  return envToggle || localToggle;
};

const getFriendlyApiMessage = (error: any): string => {
  const payload = error?.response?.data;
  if (!payload) return error?.message || 'Ocurrió un error inesperado.';

  if (Array.isArray(payload.subErrors) && payload.subErrors.length > 0) {
    const first = payload.subErrors[0];
    if (first?.field && first?.message) {
      return `${first.field}: ${first.message}`;
    }
    if (first?.message) return first.message;
  }

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error;
  }

  return error?.message || 'Ocurrió un error inesperado.';
};

const attachAuthInterceptor = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.request.use(
    (config) => {
      const token = getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const base = String(config.baseURL || '');
      const url = String(config.url || '');
      const target = `${base}${url}`;
      if (target.includes('ngrok-free.app') || target.includes('ngrok-free.dev')) {
        config.headers['ngrok-skip-browser-warning'] = 'true';
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const requestUrl = String(error.config?.url || '');
      const normalizedUrl = requestUrl.startsWith('http')
        ? requestUrl
        : `${window.location.origin}${requestUrl.startsWith('/') ? requestUrl : `/${requestUrl}`}`;
      const path = (() => {
        try {
          return new URL(normalizedUrl).pathname;
        } catch {
          return requestUrl;
        }
      })();
      const isAuthEndpoint = /\/auth\/(login|register|forgot-password|verify-reset-token|reset-password)$/.test(path);

      if (error.response?.status === 401 && !isAuthEndpoint) {
        sessionStorage.removeItem('auth-storage');
      }

      const friendlyMessage = getFriendlyApiMessage(error);
      if (error.response?.data && typeof error.response.data === 'object') {
        error.response.data.message = friendlyMessage;
      }
      error.friendlyMessage = friendlyMessage;

      if (shouldLogApiDetails()) {
        console.error('[API ERROR DETAIL]', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          payload: error.response?.data,
        });
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