import { requireAuth } from '@/lib/auth/auth';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { ROLE_LABELS } from '@/config/roles';
import { listUsers, getChildrenByParentId } from '@/lib/db/repositories/userRepository';
import { getAllAppointments } from '@/lib/db/repositories/appointmentRepository';
import { Users, Calendar, Clock, CheckCircle, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };
  const dictionary = await getDictionary(locale);
  const user = await requireAuth(locale);
  const roleLabel = ROLE_LABELS[user.role][locale] || user.role;

  // Fetch children for parent
  let children: any[] = [];
  if (user.role === 'parent') {
    children = await getChildrenByParentId(user.id);
  }

  // Fetch statistics for admin
  let stats = null;
  if (user.role === 'admin') {
    const users = await listUsers();
    const appointments = await getAllAppointments();
    const today = new Date().toISOString().split('T')[0];
    
    stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalAppointments: appointments.length,
      pendingAppointments: appointments.filter(a => a.status === 'pending').length,
      todayAppointments: appointments.filter(a => a.appointmentDate === today).length,
    };
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#1E3A8A]">
          {dictionary.common.welcome} {user.fullName || user.username}
        </h1>
        <p className="text-lg font-semibold text-[#F2574C]">
          {dictionary.users.role}: {roleLabel}
        </p>
      </div>

      {/* Statistics Cards for Admin */}
      {user.role === 'admin' && stats && (
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Users Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    {dictionary.dashboard.totalUsers}
                  </p>
                  <p className="text-4xl font-bold text-blue-900">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="bg-blue-500 p-4 rounded-full">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    {dictionary.dashboard.activeUsers}
                  </p>
                  <p className="text-4xl font-bold text-green-900">
                    {stats.activeUsers}
                  </p>
                </div>
                <div className="bg-green-500 p-4 rounded-full">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Total Appointments Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">
                    {dictionary.dashboard.totalAppointments}
                  </p>
                  <p className="text-4xl font-bold text-purple-900">
                    {stats.totalAppointments}
                  </p>
                </div>
                <div className="bg-purple-500 p-4 rounded-full">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Pending Appointments Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">
                    {dictionary.dashboard.pendingAppointments}
                  </p>
                  <p className="text-4xl font-bold text-orange-900">
                    {stats.pendingAppointments}
                  </p>
                </div>
                <div className="bg-orange-500 p-4 rounded-full">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Today's Appointments Card */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border-2 border-teal-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-600 mb-1">
                    {dictionary.dashboard.todayAppointments}
                  </p>
                  <p className="text-4xl font-bold text-teal-900">
                    {stats.todayAppointments}
                  </p>
                </div>
                <div className="bg-teal-500 p-4 rounded-full">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parent View: List of Children */}
      {user.role === 'parent' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#1E3A8A]">
            {dictionary.users.children}
          </h2>
          
          {children.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-300 text-center">
              <p className="text-gray-500 text-lg">{dictionary.users.noChildren}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {children.map((child) => (
                <Link 
                  key={child.id} 
                  href={`/${locale}/dashboard/kids/${child.id}`}
                  className="block group"
                >
                  <div className="bg-white p-6 rounded-xl border-2 border-blue-100 shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      {/* Left: Profile Image & Info */}
                      <div className="flex items-center gap-4 flex-1">
                        {/* Profile Image */}
                        <div className="relative flex-shrink-0">
                          {child.profilePicture ? (
                            <img
                              src={child.profilePicture}
                              alt={child.fullName || child.username}
                              className="w-16 h-16 rounded-full object-cover border-4 border-blue-200 group-hover:border-blue-400 transition-colors"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-200 group-hover:border-blue-400 transition-colors">
                              {(child.fullName || child.username).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Name & Info */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {child.fullName || child.username}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {child.nationalId ? `${dictionary.users.nationalId}: ${child.nationalId}` : child.username}
                          </p>
                        </div>
                      </div>

                      {/* Right: Achievements (Medals) */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          {/* Gold Medal */}
                          <div className="relative group/medal">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                              <span className="text-white text-xl">🥇</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 text-xs font-bold text-yellow-600 border border-yellow-400">
                              3
                            </div>
                          </div>

                          {/* Silver Medal */}
                          <div className="relative group/medal">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                              <span className="text-white text-xl">🥈</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 text-xs font-bold text-gray-600 border border-gray-400">
                              5
                            </div>
                          </div>

                          {/* Bronze Medal */}
                          <div className="relative group/medal">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                              <span className="text-white text-xl">🥉</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 text-xs font-bold text-orange-600 border border-orange-400">
                              8
                            </div>
                          </div>

                          {/* Star/Trophy */}
                          <div className="relative group/medal">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                              <span className="text-white text-xl">⭐</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 text-xs font-bold text-purple-600 border border-purple-400">
                              12
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {user.role === 'admin' && (
        <div className="bg-white p-6 rounded-lg border-2 border-[#1E3A8A]/20 shadow-md">
          <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">
            {dictionary.dashboard.quickActions}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href={`/${locale}/dashboard/users`}>
              <Button className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                {dictionary.dashboard.manageUsers}
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/appointments`}>
              <Button className="w-full bg-[#F2574C] hover:bg-[#F2574C]/90">
                {dictionary.dashboard.viewAppointments}
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/schedules`}>
              <Button className="w-full bg-[#30B2D2] hover:bg-[#30B2D2]/90">
                {dictionary.dashboard.manageSchedules}
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/roles`}>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {dictionary.dashboard.viewRoles}
              </Button>
            </Link>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
