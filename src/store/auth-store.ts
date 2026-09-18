import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ----------------------------------------------------------------------

export type AuthUser = {
  username: string;
  displayName: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  signIn: (payload: { token: string; user: AuthUser }) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      signIn: ({ token, user }) => set({ token, user }),
      signOut: () => set({ token: null, user: null }),
    }),
    { name: 'leadgen-auth' }
  )
);

/**
 * Read the session outside React (axios interceptor). Going through
 * `getState` avoids a second source of truth in localStorage.
 */
export const getAuthToken = () => useAuthStore.getState().token;

export const clearAuth = () => useAuthStore.getState().signOut();
