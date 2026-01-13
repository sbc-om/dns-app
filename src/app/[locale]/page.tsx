import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import NewHomePage from '@/components/NewHomePage';
import { getCurrentUser } from '@/lib/auth/auth';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;

  const dictionary = await getDictionary(locale);
  const user = await getCurrentUser();

  return <NewHomePage dictionary={dictionary} locale={locale} user={user} />;
}
