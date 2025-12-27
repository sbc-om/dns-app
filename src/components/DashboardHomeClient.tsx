'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { Locale } from '@/config/i18n';
import { Sparkles, Users, GraduationCap, User, Trophy, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedDashboardClient } from '@/components/AnimatedDashboardClient';
import {
  AcademyAdminDashboardHomeClient,
  type AcademyAdminDashboardData,
} from '@/components/AcademyAdminDashboardHomeClient';
import { ChildMedalsPreview } from '@/components/ChildMedalsPreview';

type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  paidEnrollments: number;
  totalCoaches: number;
  totalPlayers: number;
};

type ChildSummary = {
  id: string;
  username: string;
  fullName?: string;
  nationalId?: string;
  profilePicture?: string;
  createdAt: string;
  birthDate?: string;
  dateOfBirth?: string;
};

type CoachCourseSummary = {
  id: string;
  name: string;
  nameAr: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  courseImage?: string;
};

export interface DashboardHomeClientProps {
  locale: Locale;
  dictionary: Dictionary;
  user: {
    id: string;
    username: string;
    fullName?: string;
    role: string;
  };
  roleLabel: string;

  adminStats?: AdminStats | null;
  managerDashboard?: AcademyAdminDashboardData | null;
  parentChildren?: ChildSummary[];
  coachCourses?: Array<{ course: CoachCourseSummary; activePlayers: number }>;
}

export function DashboardHomeClient({
  locale,
  dictionary,
  user,
  roleLabel,
  adminStats,
  managerDashboard,
  parentChildren,
  coachCourses,
}: DashboardHomeClientProps) {
  const title = dictionary.nav?.dashboard || 'Dashboard';
  const subtitle = `${dictionary.common?.welcome || 'Welcome'} ${user.fullName || user.username} • ${dictionary.users?.role || 'Role'}: ${roleLabel}`;

  const shell =
    'bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000] rounded-2xl shadow-lg relative overflow-hidden';
  const subtleText = 'text-gray-600 dark:text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 240, damping: 22 }}
      className="space-y-6"
    >
      {/* Game-like Header (aligned with Users/Roles/Academies) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="relative">
            <motion.div
              className="absolute -inset-4 bg-linear-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-xl"
              animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative">
              <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  aria-hidden
                >
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </motion.div>
                {title}
              </h1>
              <p className={`mt-2 ${subtleText}`}>{subtitle}</p>
            </div>
          </div>

          {/* Quick actions (role-aware) */}
          <div className="w-full lg:w-auto">
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-white/80 dark:bg-[#262626]/80 backdrop-blur-xl shadow-lg">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-blue-600/8 via-purple-600/8 to-pink-600/8"
                animate={{ opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative p-2">
                <div className="flex h-12 w-full items-stretch overflow-hidden rounded-xl border-2 border-black/60 bg-[#0b0b0f] text-white shadow-lg shadow-black/30">
                  {user.role === 'admin' ? (
                    <Link href={`/${locale}/dashboard/users`} className="h-full w-full">
                      <Button className="h-full w-full rounded-none border-0 bg-transparent px-4 text-white hover:bg-[#14141a]">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="font-semibold">{dictionary.nav?.users || 'Users'}</span>
                      </Button>
                    </Link>
                  ) : user.role === 'manager' ? (
                    <Link href={`/${locale}/dashboard/users`} className="h-full w-full">
                      <Button className="h-full w-full rounded-none border-0 bg-transparent px-4 text-white hover:bg-[#14141a]">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="font-semibold">{dictionary.nav?.users || 'Users'}</span>
                      </Button>
                    </Link>
                  ) : user.role === 'coach' ? (
                    <Link href={`/${locale}/dashboard/courses`} className="h-full w-full">
                      <Button className="h-full w-full rounded-none border-0 bg-transparent px-4 text-white hover:bg-[#14141a]">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span className="font-semibold">{dictionary.nav?.courses || 'Courses'}</span>
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/${locale}/dashboard/profile`} className="h-full w-full">
                      <Button className="h-full w-full rounded-none border-0 bg-transparent px-4 text-white hover:bg-[#14141a]">
                        <User className="h-4 w-4 mr-2" />
                        <span className="font-semibold">{dictionary.nav?.settings || 'Settings'}</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ADMIN */}
      {user.role === 'admin' && adminStats ? (
        <AnimatedDashboardClient
          stats={adminStats}
          dictionary={dictionary}
          username={user.fullName || user.username}
          roleLabel={roleLabel}
          showHeader={false}
        />
      ) : null}

      {/* MANAGER */}
      {user.role === 'manager' && managerDashboard ? (
        <AcademyAdminDashboardHomeClient
          locale={locale}
          dictionary={dictionary}
          data={managerDashboard}
          hideHero
        />
      ) : null}

      {/* PARENT */}
      {user.role === 'parent' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-6"
        >
          <div className={`${shell} p-5 sm:p-6`}> 
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-linear-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-[#262626] dark:text-white">
                  {dictionary.users?.children || 'Children'}
                </div>
                <div className={`text-sm ${subtleText} truncate`}>
                  {parentChildren?.length ? parentChildren.length : 0} {dictionary.users?.title || 'Users'}
                </div>
              </div>
            </div>
          </div>

          {!parentChildren || parentChildren.length === 0 ? (
            <div className={`${shell} p-10 text-center`}>
              <div className="text-[#262626] dark:text-white font-bold">
                {dictionary.users?.noChildren || 'No children found'}
              </div>
              <div className={`text-sm mt-2 ${subtleText}`}>
                {dictionary.common?.errors?.saveFailed || 'Failed to load. Please try again.'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {parentChildren.map((child, index) => {
                const displayName = child.fullName || child.username;
                const href = `/${locale}/dashboard/players/${child.id}`;

                return (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 + index * 0.06 }}
                    whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="h-full"
                  >
                    <Link href={href} className="block h-full">
                      <div className={`${shell} overflow-hidden h-full`}> 
                        <div className="relative h-40 bg-gray-100 dark:bg-black/40 overflow-hidden">
                          {child.profilePicture ? (
                            <img src={child.profilePicture} alt={displayName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-16 w-16 rounded-2xl bg-[#0b0b0f] text-white flex items-center justify-center text-2xl font-black border-2 border-black/60">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-white font-black text-lg truncate">{displayName}</div>
                              <div className="text-white/70 text-xs truncate">{child.username}</div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-white/80 shrink-0" />
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="p-3 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-gray-50 dark:bg-[#1a1a1a]">
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                              {dictionary.nav?.dashboard || 'Dashboard'}
                            </div>
                            <div className="overflow-hidden">
                              <ChildMedalsPreview childId={child.id} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      ) : null}

      {/* COACH */}
      {user.role === 'coach' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-6"
        >
          <div className={`${shell} p-5 sm:p-6`}> 
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-linear-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-[#262626] dark:text-white">
                  {dictionary.dashboard?.coachCourses || 'Courses'}
                </div>
                <div className={`text-sm ${subtleText} truncate`}>
                  {dictionary.dashboard?.coachCoursesDescription || ''}
                </div>
              </div>
            </div>
          </div>

          {!coachCourses || coachCourses.length === 0 ? (
            <div className={`${shell} p-10 text-center`}>
              <div className="text-[#262626] dark:text-white font-bold">
                {dictionary.dashboard?.noCoachCourses || 'No courses assigned'}
              </div>
              <div className={`text-sm mt-2 ${subtleText}`}>
                {dictionary.dashboard?.coachCoursesDescription || ''}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {coachCourses.map(({ course, activePlayers }, index) => {
                const titleText = locale === 'ar' ? course.nameAr : course.name;
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 + index * 0.06 }}
                    whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <Link href={`/${locale}/dashboard/coach/courses/${course.id}`} className="block">
                      <div className={`${shell} overflow-hidden`}> 
                        <div className="relative h-40 bg-gray-100 dark:bg-black/40 overflow-hidden">
                          {course.courseImage ? (
                            <img src={course.courseImage} alt={titleText} className="h-full w-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <GraduationCap className="h-16 w-16 text-gray-300 dark:text-white/20" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-white font-black text-lg truncate">{titleText}</div>
                              <div className="text-white/70 text-xs truncate">{activePlayers} {dictionary.dashboard?.activePlayers || 'Active players'}</div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-white/80 shrink-0" />
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                {dictionary.dashboard?.activePlayers || 'Active players'}
                              </div>
                              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{activePlayers}</div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 border-2 border-[#DDDDDD] dark:border-[#000000] bg-white/80 dark:bg-[#111114] text-[#262626] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1a1a1d]"
                            >
                              {dictionary.dashboard?.viewRoster || 'View'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      ) : null}

      {/* FALLBACK (roles with no dedicated view) */}
      {user.role !== 'admin' && user.role !== 'manager' && user.role !== 'parent' && user.role !== 'coach' ? (
        <div className={`${shell} p-10`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-linear-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
              <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold text-[#262626] dark:text-white">
                {dictionary.nav?.dashboard || 'Dashboard'}
              </div>
              <div className={`text-sm ${subtleText}`}>
                {dictionary.common?.welcome || 'Welcome'}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
