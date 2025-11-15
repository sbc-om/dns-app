import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { listRoles } from '@/lib/db/repositories/roleRepository';
import { listResources } from '@/lib/db/repositories/resourceRepository';
import { RolesClient } from '@/components/RolesClient';

export default async function RolesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  const roles = await listRoles();
  const resources = await listResources();

  return (
    <RolesClient
      dictionary={dictionary}
      initialRoles={roles}
      resources={resources}
    />
  );
}
