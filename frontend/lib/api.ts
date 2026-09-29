import axios, { AxiosError } from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
// Static uploads are served from the API origin, without the /api prefix.
export const FILES_URL = API_URL.replace(/\/api\/?$/, '');

const KEYS = { access: 'ec.access', refresh: 'ec.refresh', user: 'ec.user' } as const;

export const session = {
  get accessToken() {
    return typeof window === 'undefined' ? null : localStorage.getItem(KEYS.access);
  },
  get refreshToken() {
    return typeof window === 'undefined' ? null : localStorage.getItem(KEYS.refresh);
  },
  readUser<T = unknown>(): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(KEYS.user);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  save(user: unknown, accessToken?: string, refreshToken?: string) {
    localStorage.setItem(KEYS.user, JSON.stringify(user));
    if (accessToken) localStorage.setItem(KEYS.access, accessToken);
    if (refreshToken) localStorage.setItem(KEYS.refresh, refreshToken);
  },
  clear() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = session.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// One in-flight refresh at a time; concurrent 401s wait for it and retry.
let refreshing: Promise<void> | null = null;

async function refreshTokens() {
  const refreshToken = session.refreshToken;
  if (!refreshToken) throw new Error('No refresh token');
  const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
  localStorage.setItem(KEYS.access, data.accessToken);
  localStorage.setItem(KEYS.refresh, data.refreshToken);
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const url = original?.url ?? '';
    const isAuthRoute = /\/auth\/(login|register|refresh)/.test(url);

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute && session.refreshToken) {
      original._retry = true;
      try {
        refreshing = refreshing ?? refreshTokens().finally(() => (refreshing = null));
        await refreshing;
        return api(original);
      } catch {
        session.clear();
        if (typeof window !== 'undefined') window.location.assign('/');
      }
    }
    return Promise.reject(error);
  },
);

/** Turns any thrown value into a message that is safe to show to a person. */
export function apiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const data = (err as AxiosError<{ message?: string | string[] }>)?.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return message[0] ?? fallback;
  if (typeof message === 'string' && message) return message;
  if ((err as AxiosError)?.code === 'ERR_NETWORK') return 'Cannot reach the server. Check that the API is running.';
  return fallback;
}

export function fileUrl(path?: string | null) {
  return path ? `${FILES_URL}${path}` : '#';
}
