import { ReactNode } from 'react';
import { Locale, localeDirections } from '@/config/i18n';
import { LocaleHtmlAttributes } from '@/components/LocaleHtmlAttributes';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };
  const direction = localeDirections[locale];

  return (
    <div dir={direction}>
      <LocaleHtmlAttributes locale={locale} direction={direction} />
      {children}
    </div>
  );
}