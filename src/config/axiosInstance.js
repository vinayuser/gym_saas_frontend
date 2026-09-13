import axios from 'axios';
import { getRefreshToken, setTokens, clearTokens } from '../helpers/utils';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    axiosInstance.defaults.headers.common.Accept = 'application/json';
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

let forceLogoutHandler = null;
let isRefreshing = false;
let failedQueue = [];
let logoutInProgress = false;

/** Called from store bootstrap to clear Redux + redirect without circular imports. */
export const bindForceLogout = (handler) => {
  forceLogoutHandler = handler;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

const isAuthPublicUrl = (url = '') =>
  /\/auth\/(login|register|refresh|forgot-password|reset-password|verify-otp|login\/2fa)(\?|$)/.test(
    url
  );

const forceLogout = () => {
  if (logoutInProgress) return;
  logoutInProgress = true;
  setAuthToken(null);
  clearTokens();
  try {
    if (forceLogoutHandler) forceLogoutHandler();
  } finally {
    // allow future sessions after redirect/login
    setTimeout(() => {
      logoutInProgress = false;
    }, 1500);
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status !== 401 || !original) {
      return Promise.reject(error);
    }

    const url = original.url || '';

    // Don't intercept failed login / refresh / public auth calls
    if (isAuthPublicUrl(url)) {
      return Promise.reject(error);
    }

    // Already retried or logout API — clear session immediately
    if (original._retry || url.includes('/auth/logout')) {
      forceLogout();
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // Plain axios — bypass this interceptor to avoid a refresh loop
      const { data } = await axios.post(
        `${API_BASE}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const tokens = data?.data?.tokens;
      if (!tokens?.accessToken) {
        throw new Error('Token refresh failed');
      }

      setTokens(tokens.accessToken, tokens.refreshToken);
      setAuthToken(tokens.accessToken);
      processQueue(null, tokens.accessToken);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return axiosInstance(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
