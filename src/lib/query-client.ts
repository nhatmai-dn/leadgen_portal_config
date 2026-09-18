import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

// ----------------------------------------------------------------------

/**
 * Do not retry on 4xx: a 401/403/404 will never succeed on a retry,
 * retrying only delays the error reaching the UI.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status && status >= 400 && status < 500) return false;
  }
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
