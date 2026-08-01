import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
  withCredentials: true, // Enables sending HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for unified response extraction & error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Unable to connect to backend server',
      },
    });
  }
);
