import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
  withCredentials: true, // Sends HTTP-only cookies (accessToken & refreshToken)
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000,
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Single active refresh promise to coordinate all concurrent 401s across tabs/requests
let activeRefreshPromise: Promise<void> | null = null;

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/google') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/logout-all') ||
    url.includes('/auth/send-email-otp') ||
    url.includes('/auth/verify-email-otp') ||
    url.includes('/auth/send-whatsapp-otp') ||
    url.includes('/auth/verify-whatsapp-otp') ||
    url.includes('/auth/send-otp') ||
    url.includes('/auth/verify-otp') ||
    url.includes('/auth/signup')
  );
};

// Response interceptor for unified response extraction & concurrency-safe token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response ? error.response.status : null;
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';

    // 1. Handle Network / Connection Errors Gracefully without redirecting or destroying session
    if (isNetworkError) {
      return Promise.reject({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server. Please check your internet connection.',
        },
      });
    }

    // 2. Handle 401 Unauthorized for refreshable endpoints
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint(originalRequest.url)) {
      originalRequest._retry = true;

      try {
        if (!activeRefreshPromise) {
          // Initiate unified refresh request
          activeRefreshPromise = axios
            .post(
              `${NEXT_PUBLIC_API_URL}/auth/refresh`,
              {},
              { withCredentials: true }
            )
            .then(() => {
              // Refresh completed successfully
            })
            .finally(() => {
              activeRefreshPromise = null;
            });
        }

        // Wait for active refresh promise (either current or shared one)
        await activeRefreshPromise;

        // Retry original request with newly set cookies
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails with 401 (e.g. session expired or revoked), notify caller
        const PROTECTED_PREFIXES = [
          '/resume',
          '/builder',
          '/demo',
          '/explore',
          '/settings',
          '/account',
          '/profile',
          '/history',
          '/download',
          '/ats',
          '/drive',
          '/myhub',
          '/geniustest',
          '/exams',
          '/edupie',
          '/mydive',
        ];

        const isProtectedRoute =
          typeof window !== 'undefined' &&
          PROTECTED_PREFIXES.some((prefix) => window.location.pathname.startsWith(prefix));

        if (typeof window !== 'undefined' && isProtectedRoute && !window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth';
        }

        return Promise.reject(
          error.response?.data || {
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Session expired. Please log in again.' },
          }
        );
      }
    }

    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject({
      success: false,
      error: {
        code: 'API_ERROR',
        message: error.message || 'An unexpected error occurred',
      },
    });
  }
);
