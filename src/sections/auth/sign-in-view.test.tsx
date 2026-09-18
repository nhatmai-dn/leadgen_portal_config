import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import authApi from 'src/api/authApi';
import { ApiError } from 'src/api/baseApiRequest';

import { useAuthStore } from 'src/store/auth-store';

import { renderWithProviders } from 'src/test/render';

import { SignInView } from './sign-in-view';

// ----------------------------------------------------------------------

const user = { username: 'root', displayName: 'root' };

async function fillCredentials() {
  await userEvent.type(screen.getByLabelText('Username'), 'root');
  await userEvent.type(screen.getByLabelText('Password'), 'secret');
}

describe('SignInView', () => {
  beforeEach(() => useAuthStore.setState({ token: null, user: null }));

  it('blocks submission and shows field errors when empty', async () => {
    const login = vi.spyOn(authApi, 'login');
    renderWithProviders(<SignInView />);

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('sends just the credentials — the portal login takes no telco', async () => {
    const login = vi.spyOn(authApi, 'login').mockResolvedValue({ token: 'abc', user });
    renderWithProviders(<SignInView />);

    await fillCredentials();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // TanStack Query passes a context object as the second argument.
    await waitFor(() => expect(login).toHaveBeenCalled());
    expect(login.mock.calls[0][0]).toEqual({ username: 'root', password: 'secret' });
  });

  it('stores the session on success', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue({ token: 'abc', user });
    renderWithProviders(<SignInView />);

    await fillCredentials();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(useAuthStore.getState().token).toBe('abc'));
    expect(useAuthStore.getState().user?.username).toBe('root');
  });

  it('shows a credentials message when the portal answers 401', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(new ApiError(401, 'unauthorized'));
    renderWithProviders(<SignInView />);

    await fillCredentials();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Incorrect username or password.')).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('surfaces the portal message for any other failure', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(new ApiError(500, 'engine unreachable'));
    renderWithProviders(<SignInView />);

    await fillCredentials();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('engine unreachable')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    renderWithProviders(<SignInView />);

    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(password).toHaveAttribute('type', 'text');
  });
});
