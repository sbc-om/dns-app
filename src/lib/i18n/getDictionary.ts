import { Locale } from '../../config/i18n';
import enTranslations from '../../locales/en.json' assert { type: 'json' };
import arTranslations from '../../locales/ar.json' assert { type: 'json' };

// Force TypeScript to recognize all keys
export type DictionaryType = typeof enTranslations & {
  common: typeof enTranslations['common'] & {
    overview: string;
    adminOverviewDesc: string;
    totalRegisteredAcademies: string;
    pendingHealthTestRequests: string;
    pendingMedalRequests: string;
    quickActions: string;
    quickActionsDesc: string;
  };
};

const dictionaries: Record<Locale, typeof enTranslations> = {
  en: enTranslations,
  ar: arTranslations,
};

export type Dictionary = DictionaryType;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale] || dictionaries.en;
}
