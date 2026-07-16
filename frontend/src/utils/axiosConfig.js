import axios from 'axios';
import { requireApiBaseUrl } from './apiConfig';

const API_URL = requireApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('adminToken');
    const method = config.method?.toLowerCase();
    const needsAuth = ['post', 'put', 'patch', 'delete'].includes(method);
    const protectedRead =
      config.url?.includes('/api/admin/verify') ||
      config.url?.includes('/api/projects/archived') ||
      config.url?.includes('/api/activities');
    const isFormData =
      typeof FormData !== 'undefined' && config.data instanceof FormData;
    const headers = config.headers ?? {};

    if (token && (needsAuth || protectedRead)) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (needsAuth) {
      if (isFormData) {
        if (typeof headers.delete === 'function') {
          headers.delete('Content-Type');
        } else if (headers['Content-Type']) {
          delete headers['Content-Type'];
        }
      } else if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    config.headers = headers;
    if (import.meta.env.DEV) {
      console.debug('[API Request]', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => {
    if (import.meta.env.DEV) {
      console.debug('[API Response]', response.status, response.config.url);
    }
    return response;
  },
  error => {
    if (import.meta.env.DEV) {
      console.error(
        '[API Error]',
        error.config?.url,
        error.response?.status,
        error.response?.data || error.message
      );
    }
    return Promise.reject(error);
  }
);

export default apiClient;
