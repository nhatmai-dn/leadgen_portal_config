import type { ReactElement } from 'react';

import { MemoryRouter } from 'react-router';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from 'src/theme/theme-provider';

// ----------------------------------------------------------------------

/**
 * Renders inside the providers the app really uses. Each call gets a fresh
 * QueryClient with retries off, so a failing request surfaces immediately
 * instead of being retried inside the test.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: { route?: string } = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <ThemeProvider>{ui}</ThemeProvider>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  };
}
