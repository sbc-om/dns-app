import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import LoginPageClient from '@/components/LoginPageClient';
import { getCurrentUser } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function LoginPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dictionary = await getDictionary(locale);

  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect(`/${locale}/dashboard`);
  }

  return <LoginPageClient dictionary={dictionary} locale={locale} />;
}