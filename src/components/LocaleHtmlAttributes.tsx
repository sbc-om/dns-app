'use client';

import { useEffect } from 'react';

import type { Locale } from '@/config/i18n';

export type LocaleHtmlAttributesProps = {
  locale: Locale;
  direction: 'ltr' | 'rtl';
};

/**
 * Ensures <html> attributes match the active locale.
 *
 * This is important because Radix UI (shadcn/ui) portals (Dialog, Select, etc.)
 * render under document.body and won't inherit a nested wrapper's `dir`.
 */
export function LocaleHtmlAttributes({ locale, direction }: LocaleHtmlAttributesProps) {
  useEffect(() => {
    const html = document.documentElement;

    html.setAttribute('dir', direction);
    html.setAttribute('lang', locale);

    // Also mirror on <body> to reduce surprises with 3rd-party portals/styles.
    document.body?.setAttribute('dir', direction);
  }, [locale, direction]);

  return null;
}
