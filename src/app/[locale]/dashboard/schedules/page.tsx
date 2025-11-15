import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { SchedulesClient } from '@/components/SchedulesClient';

export default async function SchedulesPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const dictionary = await getDictionary(params.locale);

  return <SchedulesClient dictionary={dictionary} locale={params.locale} />;
}
