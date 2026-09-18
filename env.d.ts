/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the LeadGen backend API, e.g. https://api.example.com/v1 */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
