import { requireAuth } from '@/lib/auth/auth';
import { requireAcademyContext } from '@/lib/academies/academyContext';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { findUserById, getChildrenByParentId } from '@/lib/db/repositories/userRepository';
import { notFound } from 'next/navigation';
import { ParentProfileClient } from '@/components/ParentProfileClient';
import { KidProfileClient } from '@/components/KidProfileClient';

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params as { locale: Locale; userId: string };
  const dictionary = await getDictionary(locale);
  const currentUser = await requireAuth(locale);
  const academyCtx = await requireAcademyContext(locale);

  // Get user
  const targetUser = await findUserById(userId);
  
  if (!targetUser) {
    notFound();
  }

  // If user is a kid, show kid profile
  if (targetUser.role === 'kid') {
    return (
      <KidProfileClient
        dictionary={dictionary}
        locale={locale}
        kid={targetUser}
        currentUser={currentUser}
        academyId={academyCtx.academyId}
      />
    );
  }

  // Get children of this parent
  const children = await getChildrenByParentId(userId);

  return (
    <ParentProfileClient
      dictionary={dictionary}
      locale={locale}
      parent={targetUser}
      children={children}
      currentUser={currentUser}
    />
  );
}
