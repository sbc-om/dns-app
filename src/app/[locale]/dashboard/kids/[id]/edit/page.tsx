import { requireAuth } from '@/lib/auth/auth';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { findUserById } from '@/lib/db/repositories/userRepository';
import { notFound, redirect } from 'next/navigation';
import { EditKidProfileClient } from '@/components/EditKidProfileClient';

export default async function EditKidProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params as { locale: Locale; id: string };
  const dictionary = await getDictionary(locale);
  const user = await requireAuth(locale);

  // Only admin can edit kid profiles
  if (user.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
  }

  // Fetch the kid
  const kid = await findUserById(id);

  if (!kid) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
      <EditKidProfileClient
        dictionary={dictionary}
        locale={locale}
        kid={kid}
      />
    </div>
  );
}
