import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import AboutPageClient from '@/components/AboutPageClient';
import { getCurrentUser } from '@/lib/auth/auth';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as Locale;
  const dictionary = await getDictionary(locale);
  const user = await getCurrentUser();

  return <AboutPageClient dictionary={dictionary} locale={locale} user={user} />;
}
