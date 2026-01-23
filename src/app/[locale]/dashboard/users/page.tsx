import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { listUsersByIdsPage, listUsersPage, countUsers } from '@/lib/db/repositories/userRepository';
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

  const pageSize = 25;

  let initialUsers: any[] = [];
  let totalUsers = 0;

  if (currentUser.role === ROLES.ADMIN) {
    const [usersPage, total] = await Promise.all([
      listUsersPage({ offset: 0, limit: pageSize }),
      countUsers(),
    ]);
    initialUsers = usersPage;
    totalUsers = total;
  } else {
    const ctx = await requireAcademyContext(locale);
    const members = await listAcademyMembers(ctx.academyId);
    const ids = Array.from(new Set(members.map((m) => m.userId)));
    const allowedRoles = [ROLES.PARENT, ROLES.COACH, ROLES.PLAYER];
    const result = await listUsersByIdsPage(ids, {
      offset: 0,
      limit: pageSize,
      allowedRoles,
    });
    initialUsers = result.users;
    totalUsers = result.total;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <UsersClient
        dictionary={dictionary}
        initialUsers={initialUsers}
        initialTotal={totalUsers}
        initialPageSize={pageSize}
        locale={locale}
        currentUserRole={currentUser.role}
      />
    </div>
  );
}
