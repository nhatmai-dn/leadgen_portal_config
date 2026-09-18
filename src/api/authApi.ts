import type { AuthUser } from 'src/store/auth-store';

import baseApiRequest from './baseApiRequest';

// ----------------------------------------------------------------------

export type SignInBody = {
  email: string;
  password: string;
};

export type SignInResponse = {
  token: string;
  user: AuthUser;
};

const authApi = {
  login: (body: SignInBody): Promise<SignInResponse> => baseApiRequest.post('login', body),

  logout: (): Promise<void> => baseApiRequest.get('logout'),

  me: (): Promise<AuthUser> => baseApiRequest.get('me'),
};

export default authApi;
