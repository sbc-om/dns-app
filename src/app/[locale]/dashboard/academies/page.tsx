import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { requireAdmin } from '@/lib/auth/auth';
import { AcademiesManagement } from '@/components/AcademiesManagement';

export default async function AcademiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  await requireAdmin(locale);
  const dictionary = await getDictionary(locale);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <AcademiesManagement locale={locale} dictionary={dictionary} />
    </div>
  );
}
