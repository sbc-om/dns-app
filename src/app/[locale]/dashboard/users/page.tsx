import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { getUsersByIds, listUsers } from '@/lib/db/repositories/userRepository';
import { UsersClient } from '@/components/UsersClient';
import { requireRole } from '@/lib/auth/auth';
import { ROLES } from '@/config/roles';
import { requireAcademyContext } from '@/lib/academies/academyContext';
import { listAcademyMembers } from '@/lib/db/repositories/academyMembershipRepository';

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };
  
  // Admin and academy manager can access users page
  const currentUser = await requireRole([ROLES.ADMIN, ROLES.MANAGER], locale);
  
  const dictionary = await getDictionary(locale);

  const users =
    currentUser.role === ROLES.ADMIN
      ? await listUsers()
      : await (async () => {
          const ctx = await requireAcademyContext(locale);
          const members = await listAcademyMembers(ctx.academyId);
          const ids = Array.from(new Set(members.map((m) => m.userId)));
          return getUsersByIds(ids);
        })();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <UsersClient
        dictionary={dictionary}
        initialUsers={users}
        locale={locale}
      />
    </div>
  );
}
