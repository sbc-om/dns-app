import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { listUsers } from '@/lib/db/repositories/userRepository';
import { listRoles } from '@/lib/db/repositories/roleRepository';
import { listResources } from '@/lib/db/repositories/resourceRepository';
import { listPermissions } from '@/lib/db/repositories/permissionRepository';
import { Users, Shield, FolderTree, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCurrentUser, hasPermission } from '@/lib/auth/auth';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };
  const dictionary = await getDictionary(locale);
  
  // Get current user for permission checks
  const currentUser = await getCurrentUser();
  
  // Check permissions for quick actions
  const canManageUsers = currentUser ? await hasPermission(currentUser.id, 'dashboard.users', 'create') : false;
  const canManageRoles = currentUser ? await hasPermission(currentUser.id, 'dashboard.roles', 'create') : false;

  // Get statistics
  const [users, roles, resources, permissions] = await Promise.all([
    listUsers(),
    listRoles(),
    listResources(),
    listPermissions(),
  ]);

  const stats = [
    {
      title: dictionary.nav.users,
      description: 'Total system users',
      value: users.length,
      icon: Users,
      href: `/${locale}/dashboard/users`,
    },
    {
      title: dictionary.nav.roles,
      description: 'User roles and groups',
      value: roles.length,
      icon: Shield,
      href: `/${locale}/dashboard/roles`,
    },
    {
      title: dictionary.nav.resources,
      description: 'Registered resources',
      value: resources.length,
      icon: FolderTree,
      href: `/${locale}/dashboard/resources`,
    },
    {
      title: dictionary.nav.permissions,
      description: 'Total permissions',
      value: permissions.length,
      icon: Lock,
      href: `/${locale}/dashboard/permissions`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <img 
            src="/logo.png" 
            alt="DNA Logo" 
            className="h-20 w-20 object-contain filter drop-shadow-lg"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-4xl font-bold mb-2">{dictionary.dashboard.title}</h1>
            <p className="text-purple-100 text-lg">{dictionary.dashboard.welcomeMessage}</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = [
            'from-purple-500 to-purple-600',
            'from-pink-500 to-pink-600',
            'from-orange-500 to-orange-600',
            'from-blue-500 to-blue-600'
          ];
          
          return (
            <Link key={stat.href} href={stat.href}>
              <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <div className={`absolute inset-0 bg-gradient-to-br ${colors[index]} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[index]} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold bg-gradient-to-br ${colors[index]} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Bottom Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {(canManageUsers || canManageRoles) && (
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Common management tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {canManageUsers && (
                <Link href={`/${locale}/dashboard/users`}>
                  <Button variant="outline" className="w-full justify-start hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 transition-all">
                    <Users className="mr-2 h-4 w-4 text-purple-600" />
                    {dictionary.users.createUser}
                  </Button>
                </Link>
              )}
              {canManageRoles && (
                <Link href={`/${locale}/dashboard/roles`}>
                  <Button variant="outline" className="w-full justify-start hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-300 transition-all">
                    <Shield className="mr-2 h-4 w-4 text-pink-600" />
                    {dictionary.roles.createRole}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              System Status
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Current system overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Users</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {users.filter((u) => u.isActive).length} / {users.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Roles</span>
              <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                {roles.filter((r) => r.isActive).length} / {roles.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Registered Resources</span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{resources.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
