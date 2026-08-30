import axios from 'axios';
import { appRuntimeConfig } from './runtimeConfig';

const api = axios.create({
  baseURL: appRuntimeConfig.apiBaseUrl,
  timeout: appRuntimeConfig.apiTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally add interceptors here for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
