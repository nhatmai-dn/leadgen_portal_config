import { Route, Routes } from 'react-router';
import { screen } from '@testing-library/react';
import { it, expect, describe, beforeEach } from 'vitest';

import { useAuthStore } from 'src/store/auth-store';

import { renderWithProviders } from 'src/test/render';

import { AuthGuard, GuestGuard } from './auth-guard';

// ----------------------------------------------------------------------

const user = { username: 'nhat', displayName: 'Nhat' };

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthGuard>
            <p>dashboard</p>
          </AuthGuard>
        }
      />
      <Route path="/reports" element={<AuthGuard><p>reports</p></AuthGuard>} />
      <Route
        path="/sign-in"
        element={
          <GuestGuard>
            <p>sign in</p>
          </GuestGuard>
        }
      />
    </Routes>
  );
}

describe('route guards', () => {
  beforeEach(() => useAuthStore.setState({ token: null, user: null }));

  it('sends a signed-out visitor to sign-in', () => {
    renderWithProviders(<App />, { route: '/' });

    expect(screen.getByText('sign in')).toBeInTheDocument();
    expect(screen.queryByText('dashboard')).not.toBeInTheDocument();
  });

  it('lets a signed-in user through', () => {
    useAuthStore.setState({ token: 'abc', user });
    renderWithProviders(<App />, { route: '/' });

    expect(screen.getByText('dashboard')).toBeInTheDocument();
  });

  it('keeps a signed-in user off the sign-in page', () => {
    useAuthStore.setState({ token: 'abc', user });
    renderWithProviders(<App />, { route: '/sign-in' });

    expect(screen.getByText('dashboard')).toBeInTheDocument();
    expect(screen.queryByText('sign in')).not.toBeInTheDocument();
  });

  it('guards every protected route, not just the index', () => {
    renderWithProviders(<App />, { route: '/reports' });

    expect(screen.getByText('sign in')).toBeInTheDocument();
  });
});
