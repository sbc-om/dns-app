import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import RegisterPageClient from '@/components/RegisterPageClient';

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function RegisterPage({ params }: PageProps) {
  const locale = params.locale as Locale;
  const dictionary = await getDictionary(locale);

  return <RegisterPageClient dictionary={dictionary} locale={locale} />;
}