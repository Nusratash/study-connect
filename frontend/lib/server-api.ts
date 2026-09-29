import axios from 'axios';

// Used only from Server Components (SSR). Inside Docker the API_URL points at the
// backend container; locally it falls back to the public API URL.
export const serverApi = axios.create({
  baseURL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 8000,
});

/** Fetch on the server without ever throwing: pages render an error state instead of crashing. */
export async function safeGet<T>(path: string, params?: Record<string, unknown>): Promise<{ data: T | null; failed: boolean }> {
  try {
    const res = await serverApi.get<T>(path, { params });
    return { data: res.data, failed: false };
  } catch {
    return { data: null, failed: true };
  }
}
