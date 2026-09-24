import { createContext, useCallback, useContext } from 'react';

export type LanguageCode = 'EN' | 'CN' | 'HK';
export type TranslationCatalog = Record<string, readonly [string, string]>;

export const LanguageContext = createContext<LanguageCode>('EN');
export const LANGUAGE_TAGS = { EN: 'en', CN: 'zh-CN', HK: 'zh-HK' } as const;

// English is the source copy; each entry contains Simplified, then Traditional Chinese.
export function translate(catalog: TranslationCatalog, language: LanguageCode, text: string) {
  return language === 'EN' ? text : catalog[text]?.[language === 'CN' ? 0 : 1] ?? text;
}

export function usePageTranslation(catalog: TranslationCatalog) {
  const language = useContext(LanguageContext);
  const t = useCallback((text: string) => translate(catalog, language, text), [catalog, language]);
  return { language, lang: LANGUAGE_TAGS[language], t };
}
