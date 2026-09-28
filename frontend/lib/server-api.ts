import axios from 'axios';

// Axios instance used ONLY in Server Components (SSR). No localStorage here.
export const serverApi = axios.create({
  baseURL:
    process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});
