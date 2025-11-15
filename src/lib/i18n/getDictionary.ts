import { Locale } from '../../config/i18n';
import enTranslations from '../../locales/en.json';
import arTranslations from '../../locales/ar.json';

const dictionaries: Record<Locale, typeof enTranslations> = {
  en: enTranslations,
  ar: arTranslations,
};

export type Dictionary = typeof enTranslations;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale] || dictionaries.en;
}
