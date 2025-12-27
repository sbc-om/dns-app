import { redirect } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/getDictionary';
import type { Locale } from '@/config/i18n';
import { requireAuth } from '@/lib/auth/auth';
import { requireAcademyContext } from '@/lib/academies/academyContext';
import { hasRolePermission } from '@/lib/db/repositories/rolePermissionRepository';
import { listAcademyMembers } from '@/lib/db/repositories/academyMembershipRepository';
import { getUsersByIds } from '@/lib/db/repositories/userRepository';
import { listTrainingDaysByAcademy } from '@/lib/db/repositories/trainingDaysRepository';
import { TrainingDaysClient } from '@/components/TrainingDaysClient';

export default async function TrainingDaysPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale };

  const user = await requireAuth(locale);
  const canManage = await hasRolePermission(user.role, 'canManageTrainingDays');
  if (!canManage) {
    redirect(`/${locale}/dashboard/forbidden`);
  }

  const ctx = await requireAcademyContext(locale);
  const dict = await getDictionary(locale);

  const members = await listAcademyMembers(ctx.academyId);
  const ids = Array.from(new Set(members.map((m) => m.userId)));
  const users = await getUsersByIds(ids);
  const groupsFromPlayers = Array.from(
    new Set(users.filter((u) => u.role === 'player').map((u) => (u.ageCategory || 'Unassigned').trim()))
  ).filter(Boolean);

  const records = await listTrainingDaysByAcademy(ctx.academyId);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <TrainingDaysClient locale={locale} dictionary={dict} groups={groupsFromPlayers} initialRecords={records} />
    </div>
  );
}
