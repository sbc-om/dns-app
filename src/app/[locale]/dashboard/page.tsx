import { requireAuth } from '@/lib/auth/auth';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { ROLE_LABELS } from '@/config/roles';
import { listUsers, getChildrenByParentId, getUsersByIds } from '@/lib/db/repositories/userRepository';
import { getAllAppointments } from '@/lib/db/repositories/appointmentRepository';
import { getCoursesByCoachId, type Course, getAllCourses } from '@/lib/db/repositories/courseRepository';
import { getPaidEnrollmentsByCourseId, getAllEnrollments } from '@/lib/db/repositories/enrollmentRepository';
import { Users, Calendar, Clock, CheckCircle, UserCheck, User, GraduationCap, TrendingUp, DollarSign, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChildMedalsPreview } from '@/components/ChildMedalsPreview';

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
  let userGrowthData: { date: string; count: number }[] = [];
  if (user.role === 'admin') {
    const users = await listUsers();
    const appointments = await getAllAppointments();
    const courses = await getAllCourses();
    const enrollments = await getAllEnrollments();
    const today = new Date().toISOString().split('T')[0];
    
    stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalAppointments: appointments.length,
      pendingAppointments: appointments.filter(a => a.status === 'pending').length,
      todayAppointments: appointments.filter(a => a.appointmentDate === today).length,
      totalCourses: courses.length,
      activeCourses: courses.filter(c => c.isActive).length,
      totalEnrollments: enrollments.length,
      paidEnrollments: enrollments.filter(e => e.paymentStatus === 'paid').length,
      totalCoaches: users.filter(u => u.role === 'coach').length,
      totalKids: users.filter(u => u.role === 'kid').length,
    };

    // Calculate user growth data for last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    userGrowthData = last30Days.map(date => {
      const count = users.filter(u => u.createdAt && u.createdAt.split('T')[0] <= date).length;
      return { date, count };
    });
  }

  // Fetch courses for coach
  let coachCourses: Array<{ course: Course; activePlayers: number }> = [];
  if (user.role === 'coach') {
    const courses = await getCoursesByCoachId(user.id);

    if (courses.length > 0) {
      coachCourses = await Promise.all(
        courses.map(async (course) => {
          const paidEnrollments = await getPaidEnrollmentsByCourseId(course.id);

          if (paidEnrollments.length === 0) {
            return { course, activePlayers: 0 };
          }

          const studentIds = Array.from(new Set(paidEnrollments.map((enrollment) => enrollment.studentId)));
          const students = await getUsersByIds(studentIds);
          const activeStudentIds = new Set(students.filter((student) => student.isActive).map((student) => student.id));
          const activePlayers = paidEnrollments.filter((enrollment) => activeStudentIds.has(enrollment.studentId)).length;

          return { course, activePlayers };
        })
      );
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#262626] dark:text-white">
          {dictionary.common.welcome} {user.fullName || user.username}
        </h1>
        <p className="text-lg font-semibold text-[#FF5F02]">
          {dictionary.users.role}: {roleLabel}
        </p>
      </div>

      {/* Statistics Cards for Admin */}
      {user.role === 'admin' && stats && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Users Card */}
            <div className="bg-white dark:bg-[#262626] p-6 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#FF5F02] mb-1">
                    {dictionary.dashboard.totalUsers}
                  </p>
                  <p className="text-4xl font-bold text-[#262626] dark:text-white">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="bg-[#FF5F02] p-4 rounded-full">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="bg-white dark:bg-[#262626] p-6 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#FF5F02] mb-1">
                    {dictionary.dashboard.activeUsers}
                  </p>
                  <p className="text-4xl font-bold text-[#262626] dark:text-white">
                    {stats.activeUsers}
                  </p>
                </div>
                <div className="bg-[#FF5F02] p-4 rounded-full">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Total Appointments Card */}
            <div className="bg-white dark:bg-[#262626] p-6 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#FF5F02] mb-1">
                    {dictionary.dashboard.totalAppointments}
                  </p>
                  <p className="text-4xl font-bold text-[#262626] dark:text-white">
                    {stats.totalAppointments}
                  </p>
                </div>
                <div className="bg-[#FF5F02] p-4 rounded-full">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Pending Appointments card */}
            <div className="bg-white dark:bg-[#262626] p-6 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#FF5F02] mb-1">
                    {dictionary.dashboard.pendingAppointments}
                  </p>
                  <p className="text-4xl font-bold text-[#262626] dark:text-white">
                    {stats.pendingAppointments}
                  </p>
                </div>
                <div className="bg-[#FF5F02] p-4 rounded-full">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Today's Appointments Card */}
            <div className="bg-white dark:bg-[#262626] p-6 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#FF5F02] mb-1">
                    {dictionary.dashboard.todayAppointments}
                  </p>
                  <p className="text-4xl font-bold text-[#262626] dark:text-white">
                    {stats.todayAppointments}
                  </p>
                </div>
                <div className="bg-[#FF5F02] p-4 rounded-full">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Total Courses Card */}
            <div className="bg-white dark:bg-[#262626] p-6 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#FF5F02] mb-1">
                    {locale === 'ar' ? 'إجمالي الدورات' : 'Total Courses'}
                  </p>
                  <p className="text-4xl font-bold text-[#262626] dark:text-white">
                    {stats.totalCourses}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.activeCourses} {locale === 'ar' ? 'نشط' : 'active'}
                  </p>
                </div>
                <div className="bg-[#FF5F02] p-4 rounded-full">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Total Enrollments Card */}
            <div className="bg-white dark:bg-[#262626] p-6 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#FF5F02] mb-1">
                    {locale === 'ar' ? 'إجمالي التسجيلات' : 'Total Enrollments'}
                  </p>
                  <p className="text-4xl font-bold text-[#262626] dark:text-white">
                    {stats.totalEnrollments}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.paidEnrollments} {locale === 'ar' ? 'مدفوع' : 'paid'}
                  </p>
                </div>
                <div className="bg-[#FF5F02] p-4 rounded-full">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Total Coaches Card */}
            <div className="bg-white dark:bg-[#262626] p-6 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#FF5F02] mb-1">
                    {locale === 'ar' ? 'إجمالي المدربين' : 'Total Coaches'}
                  </p>
                  <p className="text-4xl font-bold text-[#262626] dark:text-white">
                    {stats.totalCoaches}
                  </p>
                </div>
                <div className="bg-[#FF5F02] p-4 rounded-full">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Total Kids Card */}
            <div className="bg-white dark:bg-[#262626] p-6 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#FF5F02] mb-1">
                    {locale === 'ar' ? 'إجمالي الأطفال' : 'Total Kids'}
                  </p>
                  <p className="text-4xl font-bold text-[#262626] dark:text-white">
                    {stats.totalKids}
                  </p>
                </div>
                <div className="bg-[#FF5F02] p-4 rounded-full">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* User Growth Chart */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#262626] dark:text-white">
                  {locale === 'ar' ? 'نمو الأعضاء (آخر 30 يوم)' : 'User Growth (Last 30 Days)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userGrowthData.length > 0 && (
                    <>
                      <div className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'نمو الأعضاء على مدار الشهر الماضي' : 'Member growth over the past month'}
                      </div>
                      <div className="space-y-2">
                        {[...userGrowthData].reverse().slice(0, 10).map((data, index) => {
                          const maxCount = Math.max(...userGrowthData.map(d => d.count));
                          const percentage = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                          return (
                            <div key={index} className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground w-16">
                                {new Date(data.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                              </span>
                              <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                                <div 
                                  className="bg-orange-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                  title={`${data.count} users`}
                                  suppressHydrationWarning
                                  dangerouslySetInnerHTML={{ 
                                    __html: `<style>@keyframes grow-${index} { from { width: 0; } to { width: ${percentage}%; } } .bar-${index} { width: ${percentage}%; animation: grow-${index} 1s ease-out; }</style><div class="bar-${index} h-full bg-orange-500 rounded-full flex items-center justify-end pr-2"><span class="text-xs font-bold text-white">${data.count}</span></div>` 
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{locale === 'ar' ? 'المجموع:' : 'Total:'}</span>
                  <span className="font-bold text-orange-600">{stats.totalUsers} {locale === 'ar' ? 'مستخدم' : 'users'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Summary Statistics Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#262626] dark:text-white">
                  {locale === 'ar' ? 'ملخص النظام' : 'System Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Statistics */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{locale === 'ar' ? 'نسبة المستخدمين النشطين' : 'Active Users Rate'}</p>
                      <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'من إجمالي المستخدمين' : 'of total users'}</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                  </div>
                </div>

                {/* Appointment Statistics */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{locale === 'ar' ? 'نسبة المواعيد المعلقة' : 'Pending Appointments Rate'}</p>
                      <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'من إجمالي المواعيد' : 'of total appointments'}</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.totalAppointments > 0 ? Math.round((stats.pendingAppointments / stats.totalAppointments) * 100) : 0}%
                  </div>
                </div>

                {/* Course Statistics */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{locale === 'ar' ? 'نسبة الدورات النشطة' : 'Active Courses Rate'}</p>
                      <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'من إجمالي الدورات' : 'of total courses'}</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.totalCourses > 0 ? Math.round((stats.activeCourses / stats.totalCourses) * 100) : 0}%
                  </div>
                </div>

                {/* Enrollment Payment Statistics */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{locale === 'ar' ? 'نسبة الدفع' : 'Payment Rate'}</p>
                      <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'من إجمالي التسجيلات' : 'of total enrollments'}</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.totalEnrollments > 0 ? Math.round((stats.paidEnrollments / stats.totalEnrollments) * 100) : 0}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Parent View: List of Children */}
      {user.role === 'parent' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#262626] dark:text-white">
            {dictionary.users.children}
          </h2>
          
          {children.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-300 text-center">
              <p className="text-gray-500 text-lg">{dictionary.users.noChildren}</p>
            </div>
          ) : children.length === 1 ? (
            // Single Child - Large Featured Card
            <Link 
              href={`/${locale}/dashboard/kids/${children[0].id}`}
              className="block group"
            >
              <div className="bg-linear-to-br from-white to-blue-50 dark:from-[#262626] dark:to-[#1a1a1a] p-8 rounded-2xl border-2 border-[#FF5F02] shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                  {/* Large Profile Image */}
                  <div className="relative shrink-0">
                    {children[0].profilePicture ? (
                      <img
                        src={children[0].profilePicture}
                        alt={children[0].fullName || children[0].username}
                        className="w-32 h-32 rounded-full object-cover border-4 border-[#FF5F02] shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-linear-to-br from-[#FF5F02] to-[#ff7b33] flex items-center justify-center text-white text-5xl font-bold border-4 border-[#FF5F02]/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {(children[0].fullName || children[0].username).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name & Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl md:text-4xl font-bold text-[#262626] dark:text-white mb-2 group-hover:text-[#FF5F02] transition-colors">
                      {children[0].fullName || children[0].username}
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-3">
                      {children[0].nationalId ? `${dictionary.users.nationalId}: ${children[0].nationalId}` : children[0].username}
                    </p>
                    {children[0].dateOfBirth && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#262626] rounded-full shadow-md">
                        <Calendar className="h-4 w-4 text-[#FF5F02]" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {new Date(children[0].dateOfBirth).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medals Section */}
                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-[#FF5F02]/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-[#FF5F02]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{dictionary.users.createdAt || 'Member Since'}</p>
                        <p className="text-base font-semibold text-[#262626] dark:text-white">
                          {new Date(children[0].createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <ChildMedalsPreview childId={children[0].id} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            // Multiple Children - List Layout
            <div className="space-y-4">
              {children.map((child) => (
                <Link 
                  key={child.id} 
                  href={`/${locale}/dashboard/kids/${child.id}`}
                  className="block group"
                >
                  <div className="bg-white dark:bg-[#262626] p-6 rounded-xl border-2 border-blue-100 dark:border-[#1a1a1a] shadow-md hover:shadow-xl hover:border-blue-300 dark:hover:border-[#FF5F02] transition-all duration-300">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      {/* Left: Profile Image & Info */}
                      <div className="flex items-center gap-4 flex-1">
                        {/* Profile Image */}
                        <div className="relative shrink-0">
                          {child.profilePicture ? (
                            <img
                              src={child.profilePicture}
                              alt={child.fullName || child.username}
                              className="w-16 h-16 rounded-full object-cover border-4 border-blue-200 group-hover:border-blue-400 transition-colors"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-[#FF5F02] flex items-center justify-center text-white text-2xl font-bold border-4 border-[#FF5F02]/20 group-hover:border-[#FF5F02] transition-colors">
                              {(child.fullName || child.username).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Name & Info */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-[#FF5F02] transition-colors">
                            {child.fullName || child.username}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {child.nationalId ? `${dictionary.users.nationalId}: ${child.nationalId}` : child.username}
                          </p>
                        </div>
                      </div>

                      {/* Right: Real Medals */}
                      <div className="shrink-0">
                        <ChildMedalsPreview childId={child.id} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coach View: Assigned Courses */}
      {user.role === 'coach' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#262626] dark:text-white">
              {dictionary.dashboard.coachCourses}
            </h2>
            <p className="text-muted-foreground">
              {dictionary.dashboard.coachCoursesDescription}
            </p>
          </div>

          {coachCourses.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-300 text-center">
              <p className="text-gray-500 text-lg">
                {dictionary.dashboard.noCoachCourses}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {coachCourses.map(({ course, activePlayers }) => (
                <Link
                  key={course.id}
                  href={`/${locale}/dashboard/coach/courses/${course.id}`}
                  className="group block"
                >
                  <div className="bg-white p-6 rounded-xl border-2 border-blue-100 shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300 h-full flex flex-col gap-4">
                    {course.courseImage && (
                      <div className="h-40 w-full rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={course.courseImage}
                          alt={locale === 'ar' ? course.nameAr : course.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {locale === 'ar' ? course.nameAr : course.name}
                        </h3>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${course.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          {course.isActive ? dictionary.users.active : dictionary.users.inactive}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {course.startDate && (
                          <span>
                            <strong>{dictionary.dashboard.startsOn}:</strong>{' '}
                            {new Date(course.startDate).toLocaleDateString(locale)}
                          </span>
                        )}
                        {course.endDate && (
                          <span>
                            <strong>{dictionary.dashboard.endsOn}:</strong>{' '}
                            {new Date(course.endDate).toLocaleDateString(locale)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">{dictionary.dashboard.activePlayers}</p>
                          <p className="text-2xl font-bold text-[#FF5F02]">{activePlayers}</p>
                        </div>
                        <Button variant="outline" className="border-[#FF5F02] text-[#FF5F02] hover:bg-[#FF5F02] hover:text-white">
                          {dictionary.dashboard.viewRoster}
                        </Button>
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
        <div className="bg-white dark:bg-[#262626] p-6 rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] shadow-md">
          <h2 className="text-xl font-bold text-[#262626] dark:text-white mb-4">
            {dictionary.dashboard.quickActions}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href={`/${locale}/dashboard/users`}>
              <Button className="w-full bg-[#262626] hover:bg-[#000000] text-white">
                {dictionary.dashboard.manageUsers}
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/appointments`}>
              <Button className="w-full bg-[#FF5F02] hover:bg-[#262626] text-white">
                {dictionary.dashboard.viewAppointments}
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/schedules`}>
              <Button className="w-full bg-[#FF5F02] hover:bg-[#262626] text-white">
                {dictionary.dashboard.manageSchedules}
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/roles`}>
              <Button className="w-full bg-[#FF5F02] hover:bg-[#262626] text-white">
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
