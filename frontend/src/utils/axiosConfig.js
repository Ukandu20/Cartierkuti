// src/utils/axiosConfig.js
import axios from 'axios';

// 1. Read and validate our API base URL
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error(
    'Missing VITE_API_URL environment variable. ' +
    'Define it in .env.development as VITE_API_URL=http://localhost:5050'
  );
}

// 2. Create a dedicated axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
});

// 3. Request interceptor: inject admin secret on writes
apiClient.interceptors.request.use(
  config => {
    const secret = sessionStorage.getItem('adminSecret');
    const method = config.method?.toLowerCase();
    const needsAuth = ['post', 'put', 'patch', 'delete'].includes(method);
    const isFormData =
      typeof FormData !== 'undefined' && config.data instanceof FormData;
    const headers = config.headers ?? {};

    // only attach the secret for methods that modify data
    if (secret && needsAuth) {
      headers['x-admin-secret'] = secret;
    }
    // ensure JSON content-type for non-FormData writes
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
    console.debug('[API Request]', config.method?.toUpperCase(), config.url, config);
    return config;
  },
  error => Promise.reject(error)
);

// 5. Response interceptor: log and unwrap data
apiClient.interceptors.response.use(
  response => {
    console.debug('[API Response]', response.status, response.config.url, response.data);
    return response;
  },
  error => {
    console.error(
      '[API Error]',
      error.config?.url,
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default apiClient;
