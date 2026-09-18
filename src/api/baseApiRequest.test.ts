import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { useAuthStore } from 'src/store/auth-store';

import client, { post, ApiError, isApiError } from './baseApiRequest';

// ----------------------------------------------------------------------

function envelope(code: number, message: string, data: unknown = null) {
  return { data: { Data: data, Error: { Code: code, Message: message } } };
}

const session = { username: 'root', displayName: 'root' };

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null });
  vi.stubEnv('VITE_API_URL', 'https://staging-portal.datanest.vn');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('post', () => {
  it('posts to the single portal base URL', async () => {
    const spy = vi.spyOn(client, 'post').mockResolvedValue(envelope(200, 'Success', []));

    await post('/r/scheduler/criterias/view', { offset: 0, telco: 'vinaphone' });

    expect(spy.mock.calls[0][0]).toBe(
      'https://staging-portal.datanest.vn/r/scheduler/criterias/view'
    );
  });

  it('carries the telco in the body rather than the host', async () => {
    const spy = vi.spyOn(client, 'post').mockResolvedValue(envelope(200, 'Success', []));

    await post('/r/scheduler/criterias/view', { offset: 0, limit: 200, telco: 'viettel' });

    expect(spy.mock.calls[0][1]).toMatchObject({ telco: 'viettel' });
  });

  it('unwraps Data on success', async () => {
    vi.spyOn(client, 'post').mockResolvedValue(envelope(200, 'Success', [{ id: 'a' }]));

    await expect(post('/x', {})).resolves.toEqual([{ id: 'a' }]);
  });

  it('raises an ApiError when Error.Code is not 200, despite HTTP 200', async () => {
    vi.spyOn(client, 'post').mockResolvedValue(envelope(400, 'criteria not found'));

    const error = await post('/x', {}).catch((e) => e);

    expect(isApiError(error)).toBe(true);
    expect((error as ApiError).code).toBe(400);
    expect((error as ApiError).message).toBe('criteria not found');
  });

  it('flags a permission-denied code so the UI can explain the editor role', async () => {
    vi.spyOn(client, 'post').mockResolvedValue(envelope(1, 'permission denied'));

    const error = (await post('/x', {}).catch((e) => e)) as ApiError;

    expect(error.isPermissionDenied).toBe(true);
  });

  it('clears the session on a 401 envelope', async () => {
    useAuthStore.setState({ token: 'abc', user: session });
    vi.spyOn(client, 'post').mockResolvedValue(envelope(401, 'unauthorized'));

    await expect(post('/x', {})).rejects.toBeInstanceOf(ApiError);
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('leaves the session alone on a 500 envelope', async () => {
    useAuthStore.setState({ token: 'abc', user: session });
    vi.spyOn(client, 'post').mockResolvedValue(envelope(500, 'engine down'));

    await expect(post('/x', {})).rejects.toBeInstanceOf(ApiError);
    expect(useAuthStore.getState().token).toBe('abc');
  });

  it('turns an unreachable portal into a VPN hint rather than a raw axios error', async () => {
    const networkError = Object.assign(new Error('Network Error'), { isAxiosError: true });
    vi.spyOn(client, 'post').mockRejectedValue(networkError);

    const error = (await post('/x', {}).catch((e) => e)) as ApiError;

    expect(error.message).toMatch(/VPN/);
  });

  it('rejects a response that is not an envelope', async () => {
    vi.spyOn(client, 'post').mockResolvedValue({ data: { unexpected: true } });

    await expect(post('/x', {})).rejects.toThrow(/Unexpected response shape/);
  });
});

describe('request interceptor', () => {
  it('attaches the bearer token only when signed in', () => {
     
    const handler = (client.interceptors.request as any).handlers[0];

    const anonymous = handler.fulfilled({ headers: {} });
    expect(anonymous.headers.Authorization).toBeUndefined();

    useAuthStore.setState({ token: 'abc', user: null });
    const authed = handler.fulfilled({ headers: {} });
    expect(authed.headers.Authorization).toBe('Bearer abc');
  });
});
