import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import ForgotPasswordPageClient from '@/components/ForgotPasswordPageClient';

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function ForgotPasswordPage({ params }: PageProps) {
  const locale = params.locale as Locale;
  const dictionary = await getDictionary(locale);

  return <ForgotPasswordPageClient dictionary={dictionary} locale={locale} />;
}