import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1';

// ─── Axios Instance ────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // sends refresh cookie on every request
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Token getter (avoids circular import with Zustand store) ──
let getToken: (() => string | null) | null = null;
let clearAuth: (() => void) | null = null;

export function registerAuthHandlers(
  tokenGetter: () => string | null,
  authClearer: () => void,
) {
  getToken = tokenGetter;
  clearAuth = authClearer;
}

// ─── Request Interceptor: attach Bearer token ──────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken?.();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Refresh state management ──────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: AxiosError | null, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

// ─── Response Interceptor: silent refresh on 401 ──────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Never intercept 401s from the refresh endpoint itself — those are
    // expected when there is no valid session (incognito, expired cookie).
    // Let them bubble up so QueryProvider's .catch() handles them cleanly.
    const url = originalRequest?.url ?? '';
    if (url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers)
              originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken: string = data?.data?.accessToken;

        // Update Zustand store via dynamic import to avoid circular dep
        const { useAuthStore } = await import('@/stores/auth-store');
        if (newToken && data?.data?.user) {
          useAuthStore.getState().setAuth(newToken, data.data.user);
        }

        processQueue(null, newToken);
        if (originalRequest.headers)
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        clearAuth?.();
        // Do NOT use window.location.href here — it causes a full-page
        // reload which restarts the auth cycle and creates an infinite loop.
        // The route guards (admin layout, etc.) will handle the redirect.
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
