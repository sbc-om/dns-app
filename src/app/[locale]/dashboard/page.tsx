import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dictionary.dashboard.title}</h1>
        <p className="text-muted-foreground mt-2">{dictionary.dashboard.welcomeMessage}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.nav.users}</CardTitle>
            <CardDescription>Manage system users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dictionary.nav.roles}</CardTitle>
            <CardDescription>Manage user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dictionary.nav.permissions}</CardTitle>
            <CardDescription>Manage permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
