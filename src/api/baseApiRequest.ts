import type { AxiosError } from 'axios';

import axios from 'axios';

import { clearAuth, getAuthToken } from 'src/store/auth-store';

import { CONFIG } from 'src/config-global';

import { API_CODE } from 'src/types/lead-criteria';
import type { ApiEnvelope } from 'src/types/lead-criteria';

// ----------------------------------------------------------------------

/**
 * The portal answers HTTP 200 for everything, success or not, and puts the
 * real status in `Error.Code`. So this is the error every caller catches —
 * an HTTP-level failure is translated into one too, with `code: 0`.
 */
export class ApiError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }

  get isUnauthorized(): boolean {
    return this.code === API_CODE.unauthorized;
  }

  get isPermissionDenied(): boolean {
    return this.code === API_CODE.permissionDenied;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// ----------------------------------------------------------------------

const client = axios.create({
  timeout: 30_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ----------------------------------------------------------------------

function transportMessage(error: AxiosError): string {
  if (!error.response) return 'Cannot reach the portal. Check your VPN connection.';

  return `Portal returned HTTP ${error.response.status}.`;
}

/**
 * Every call goes through here: one POST against the single portal base URL,
 * envelope unwrapped, a non-200 `Error.Code` raised as an ApiError. Which
 * telco a call concerns travels in the request body, not the host.
 */
export async function post<TData>(path: string, body: unknown): Promise<TData> {
  let envelope: ApiEnvelope<TData>;

  try {
    const response = await client.post<ApiEnvelope<TData>>(`${CONFIG.apiUrl}${path}`, body);
    envelope = response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(0, transportMessage(error));
    }
    throw error;
  }

  if (!envelope?.Error) {
    throw new ApiError(0, 'Unexpected response shape from the portal.');
  }

  if (envelope.Error.Code !== API_CODE.ok) {
    if (envelope.Error.Code === API_CODE.unauthorized) {
      clearAuth();
    }
    throw new ApiError(envelope.Error.Code, envelope.Error.Message || 'Request failed.');
  }

  return envelope.Data;
}

export default client;
