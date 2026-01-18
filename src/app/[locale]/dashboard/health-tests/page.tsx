import { requireRole } from '@/lib/auth/auth';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { HealthTestsClient } from '@/components/HealthTestsClient';
import { getAllAcademies } from '@/lib/db/repositories/academyRepository';
import { ROLES } from '@/config/roles';

// Mock data for now - replace with real data from LMDB
const mockHealthTestRequests = [
  {
    id: '1',
    playerId: 'player-1',
    playerName: 'Ahmed Ali',
    academyId: 'academy-1',
    academyName: 'Champions Academy',
    requestDate: new Date().toISOString(),
    status: 'pending' as const,
  },
  {
    id: '2',
    playerId: 'player-2',
    playerName: 'Sara Mohammed',
    academyId: 'academy-2',
    academyName: 'Elite Sports',
    requestDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'scheduled' as const,
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
  },
];

export default async function HealthTestsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  
  // Only admin can access
  await requireRole([ROLES.ADMIN], locale);

  const dictionary = await getDictionary(locale);
  const academies = (await getAllAcademies()).map((a) => ({ id: a.id, name: a.name }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <HealthTestsClient
        dictionary={dictionary}
        locale={locale}
        requests={mockHealthTestRequests}
        academies={academies}
      />
    </div>
  );
}
