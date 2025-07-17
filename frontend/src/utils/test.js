// src/utils/axiosConfig.js
import axios from 'axios';

// 1. Read and validate our API base URL
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error(
    'Missing VITE_API_URL environment variable. ' +
    'Define it in .env as VITE_API_URL=https://your-api.com'
  );
}

// 2. Create a dedicated axios instance
const apiClient = axios.create({
  baseURL:  API_URL,
  timeout:  10000,                       // 10 second timeout
  headers: {
    'Content-Type': 'application/json',  // always JSON
  },
});

// 3. Request interceptor: inject admin secret if it exists
apiClient.interceptors.request.use(
  config => {
    const secret = sessionStorage.getItem('adminSecret');
    if (secret) {
      config.headers['x-admin-secret'] = secret;
    }
    console.debug('[API Request]', config.method, config.url, config);
    return config;
  },
  error => Promise.reject(error),
);

// 4. Response interceptor: log and unwrap data
apiClient.interceptors.response.use(
  response => {
    console.debug('[API Response]', response.status, response.config.url, response.data);
    return response;
  },
  error => {
    console.error('[API Error]', error.config?.url, error.response?.status, error.response?.data || error.message);
    // You could trigger a global toast here
    return Promise.reject(error);
  }
);

export default apiClient;
