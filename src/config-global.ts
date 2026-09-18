import packageJson from '../package.json';

// ----------------------------------------------------------------------

export const CONFIG = {
  appName: 'LeadGen Portal',
  appVersion: packageJson.version,

  /**
   * Base URL of the portal service. Read at call time rather than module
   * load so tests can override it and module order cannot bite.
   */
  get apiUrl(): string {
    const url = import.meta.env.VITE_API_URL ?? '';

    if (!url) {
      console.error('[config] VITE_API_URL is not set — copy .env.example to .env');
    }

    return url;
  },
};
