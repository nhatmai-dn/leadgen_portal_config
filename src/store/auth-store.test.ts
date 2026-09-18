import { it, expect, describe, beforeEach } from 'vitest';

import { clearAuth, getAuthToken, useAuthStore } from './auth-store';

// ----------------------------------------------------------------------

const user = { username: 'nhat', displayName: 'Nhat' };

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null });
    localStorage.clear();
  });

  it('starts signed out', () => {
    expect(useAuthStore.getState().token).toBeNull();
    expect(getAuthToken()).toBeNull();
  });

  it('stores the token and user on sign in', () => {
    useAuthStore.getState().signIn({ token: 'abc', user });

    expect(useAuthStore.getState().user).toEqual(user);
    expect(getAuthToken()).toBe('abc');
  });

  it('persists the session so a reload keeps the user signed in', () => {
    useAuthStore.getState().signIn({ token: 'abc', user });

    const persisted = JSON.parse(localStorage.getItem('leadgen-auth') ?? '{}');
    expect(persisted.state.token).toBe('abc');
    expect(persisted.state.user.username).toBe(user.username);
  });

  it('clears both token and user on sign out', () => {
    useAuthStore.getState().signIn({ token: 'abc', user });
    clearAuth();

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
