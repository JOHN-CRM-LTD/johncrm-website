/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key. Must be registered against the sales inbox alias. */
  readonly VITE_WEB3FORMS_ACCESS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
