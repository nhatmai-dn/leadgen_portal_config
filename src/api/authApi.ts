import type { AuthUser } from 'src/store/auth-store';

import { post } from './baseApiRequest';

// ----------------------------------------------------------------------

/** Login sits under `/p`, outside the authenticated `/r` group. */
const LOGIN_PATH = '/p/login';

export type SignInBody = {
  username: string;
  password: string;
};

/** Only `token` is relied on; the portal may send more alongside it. */
type LoginData = string;

export type SignInResult = {
  token: string;
  user: AuthUser;
};

const authApi = {
  async login({ username, password }: SignInBody): Promise<SignInResult> {
    const token = await post<LoginData>(LOGIN_PATH, { username, password });

    if (!token) {
      throw new Error('Login succeeded but the response carried no token.');
    }

    return {
      token,
      user: { username: username, displayName: username },
    };
  },
};

export default authApi;
