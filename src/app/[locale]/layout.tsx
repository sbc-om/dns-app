import { ReactNode } from 'react';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale, localeDirections } from '@/config/i18n';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };
  const dictionary = await getDictionary(locale);
  const direction = localeDirections[locale];

  return (
    <div dir={direction}>
      {children}
      <PWAInstallPrompt />
    </div>
  );
}