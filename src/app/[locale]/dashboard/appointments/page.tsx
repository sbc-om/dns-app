import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { AppointmentsClient } from '@/components/AppointmentsClient';

export default async function AppointmentsPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const dictionary = await getDictionary(params.locale);

  return <AppointmentsClient dictionary={dictionary} locale={params.locale} />;
}
