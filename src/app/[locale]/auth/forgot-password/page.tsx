import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import ForgotPasswordPageClient from '@/components/ForgotPasswordPageClient';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ForgotPasswordPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dictionary = await getDictionary(locale);

  return <ForgotPasswordPageClient dictionary={dictionary} locale={locale} />;
}