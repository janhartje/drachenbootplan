import de from '@/locales/de.json';
import en from '@/locales/en.json';

export type Language = 'de' | 'en';

const locales: Record<Language, Record<string, unknown>> = { de, en };

/**
 * Simple translation function for emails.
 * @param lang - The language code ('de' or 'en')
 * @param key - The translation key
 * @returns The translated string, or the key if not found
 */
export const t = (lang: Language, key: string): string => {
  const locale = locales[lang];
  if (!locale) return key;

  // Support nested keys like "Login.welcomeBack"
  const parts = key.split('.');
  let current: unknown = locale;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current !== 'string') {
    // Only warn if not one of the keys we expect to be missing during transitions
    if (!['imprint', 'privacy'].includes(key)) {
      console.warn(`[WARN] Translation key not found or not a string for lang ${lang}: ${key}`);
    }
    return key;
  }

  return current;
};
