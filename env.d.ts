/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the portal service, e.g. https://staging-portal.datanest.vn */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
