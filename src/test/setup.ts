import { cleanup } from '@testing-library/react';
import { vi, afterEach, beforeAll } from 'vitest';
import '@testing-library/jest-dom/vitest';

// ----------------------------------------------------------------------

beforeAll(() => {
  // jsdom's CSS parser chokes on the modern syntax MUI emits and logs
  // "Could not parse CSS stylesheet" for every render. Drop just that line so
  // real console errors stay visible.
  const { error } = console;
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Could not parse CSS stylesheet')) return;
    error(...args);
  });
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
