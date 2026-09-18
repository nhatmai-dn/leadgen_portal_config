import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/config-global';
import { clearAuth, getAuthToken } from 'src/store/auth-store';

// ----------------------------------------------------------------------

export const baseURL = CONFIG.apiUrl;

const baseApiRequest: AxiosInstance = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

baseApiRequest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

baseApiRequest.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuth();

      if (window.location.pathname !== '/sign-in') {
        window.location.assign('/sign-in');
      }
    }

    return Promise.reject(error);
  }
);

export default baseApiRequest;
