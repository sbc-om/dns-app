import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { NotificationsClient } from '@/components/NotificationsClient';

interface NotificationsPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return <NotificationsClient dictionary={dictionary} locale={locale} />;
}
