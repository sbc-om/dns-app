import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { getCurrentUser } from '@/lib/auth/auth';
import { BookAppointmentPageClient } from '@/components/BookAppointmentPageClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function BookAppointmentPage({ params }: PageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as Locale;
  const dictionary = await getDictionary(locale);
  const user = await getCurrentUser();

  return <BookAppointmentPageClient dictionary={dictionary} locale={locale} user={user} />;
}
