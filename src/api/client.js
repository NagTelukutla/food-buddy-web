import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import {
  BUCKETS,
  getSession,
  getTokenForPath,
  resolveAuthForPath,
  setSession,
  clearSession,
} from '../utils/authSessions';
import { notifySessionExpired } from '../utils/authEvents';
import { getLoginPathForRoute, isPublicPath } from '../utils/routeGuard';

function isCustomerOrderRequest(url = '', method = 'get') {
  const path = (url.split('?')[0] || '').replace(/\/$/, '');
  const verb = (method || 'get').toLowerCase();

  if (path.includes('/api/payments/checkout')) return true;
  if (path.includes('/api/orders/my')) return true;
  if (path.endsWith('/api/orders') && verb === 'post') return true;

  return false;
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

function handleAuthFailure(bucket, status) {
  if (bucket) clearSession(bucket);
  notifySessionExpired({ bucket, status });

  if (typeof window === 'undefined') return;
  const pathname = window.location.pathname;
  const loginPath = getLoginPathForRoute(pathname);

  if (!isPublicPath(pathname) && !pathname.startsWith(loginPath)) {
    window.location.replace(loginPath);
  }
}

client.interceptors.request.use((config) => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const url = config.url || '';

  // Never attach a stored session to credential exchange endpoints.
  if (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/refresh')
  ) {
    delete config.headers.Authorization;
    config._authBucket = null;
    return config;
  }

  // Keep an explicit Bearer token (e.g. /me immediately after login, before session is saved).
  if (config.headers?.Authorization) {
    return config;
  }

  if (isCustomerOrderRequest(url, config.method)) {
    const customer = getSession(BUCKETS.CUSTOMER);
    if (customer?.access_token) {
      config.headers.Authorization = `Bearer ${customer.access_token}`;
      config._authBucket = BUCKETS.CUSTOMER;
    } else {
      delete config.headers.Authorization;
      config._authBucket = null;
    }
    return config;
  }

  const auth = resolveAuthForPath(pathname);
  const token = auth?.session?.access_token ?? getTokenForPath(pathname);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  config._authBucket = auth?.bucket ?? null;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 403 && original && !original._authRetry) {
      original._authRetry = true;
      return Promise.reject(error);
    }

    if (status === 401 && original && !original._retry) {
      const bucket = original._authBucket;
      const session = bucket ? getSession(bucket) : null;
      const refreshToken = session?.refresh_token;

      if (refreshToken && !original.url?.includes('/auth/')) {
        original._retry = true;
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          setSession(bucket, {
            ...session,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          });
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return client(original);
        } catch {
          handleAuthFailure(bucket, status);
        }
      } else if (bucket) {
        handleAuthFailure(bucket, status);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
