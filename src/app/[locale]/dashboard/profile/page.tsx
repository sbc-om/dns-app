import { requireAuth } from '@/lib/auth/auth';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { ProfileClient } from '@/components/ProfileClient';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };
  const dictionary = await getDictionary(locale);
  const user = await requireAuth(locale);

  return (
    <div className="h-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <ProfileClient dictionary={dictionary} locale={locale} user={user} />
      </div>
    </div>
  );
}
