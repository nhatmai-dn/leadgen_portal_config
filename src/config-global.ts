import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  apiUrl: string;
};

// ----------------------------------------------------------------------

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  // Fail loudly in dev instead of silently issuing requests against the app origin.
  console.error('[config] VITE_API_URL is not set — copy .env.example to .env');
}

export const CONFIG: ConfigValue = {
  appName: 'LeadGen Portal',
  appVersion: packageJson.version,
  apiUrl: apiUrl ?? '',
};
