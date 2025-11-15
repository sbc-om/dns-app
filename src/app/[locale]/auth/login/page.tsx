import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import LoginPageClient from '@/components/LoginPageClient';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function LoginPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dictionary = await getDictionary(locale);

  return <LoginPageClient dictionary={dictionary} locale={locale} />;
}