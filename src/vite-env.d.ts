/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key. Must be registered against the sales inbox. */
  readonly VITE_WEB3FORMS_ACCESS_KEY?: string;
  /** Demo booking Apps Script URL, for local testing against another deployment. */
  readonly VITE_DEMO_BOOKING_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
