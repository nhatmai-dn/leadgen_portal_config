import { it, expect, describe } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';

import { queryClient } from './query-client';

// ----------------------------------------------------------------------

function axiosErrorWithStatus(status: number): AxiosError {
  const error = new AxiosError('request failed');
  error.response = {
    status,
    statusText: '',
    data: null,
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

const retry = queryClient.getDefaultOptions().queries?.retry;
const shouldRetry = (count: number, error: Error) =>
  typeof retry === 'function' ? retry(count, error) : retry;

describe('query client retry policy', () => {
  it.each([400, 401, 403, 404, 422])('does not retry a %i', (status) => {
    expect(shouldRetry(0, axiosErrorWithStatus(status))).toBe(false);
  });

  it('retries a 500 until the attempt limit', () => {
    const error = axiosErrorWithStatus(500);
    expect(shouldRetry(0, error)).toBe(true);
    expect(shouldRetry(1, error)).toBe(true);
    expect(shouldRetry(2, error)).toBe(false);
  });

  it('retries a network error that has no response', () => {
    expect(shouldRetry(0, new AxiosError('Network Error'))).toBe(true);
  });

  it('never retries mutations', () => {
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false);
  });
});
