'use client';

import { Building2, Stethoscope, Medal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface AdminOverviewProps {
  dictionary: Dictionary;
  locale: string;
  stats: {
    totalAcademies: number;
    pendingHealthTests: number;
    pendingMedalRequests: number;
  };
}

export function AdminOverview({ dictionary, locale, stats }: AdminOverviewProps) {
  const cards = [
    {
      title: dictionary.nav?.academies || 'Academies',
      description: dictionary.common?.totalRegisteredAcademies || 'Total registered academies',
      value: stats.totalAcademies,
      icon: Building2,
      href: `/${locale}/dashboard/academies`,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: dictionary.nav?.healthTests || 'Health Tests',
      description: dictionary.common?.pendingHealthTestRequests || 'Pending health test requests',
      value: stats.pendingHealthTests,
      icon: Stethoscope,
      href: `/${locale}/dashboard/health-tests`,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      title: dictionary.nav?.medalRequests || 'Medal Requests',
      description: dictionary.common?.pendingMedalRequests || 'Pending medal requests',
      value: stats.pendingMedalRequests,
      icon: Medal,
      href: `/${locale}/dashboard/medal-requests`,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {dictionary.common?.overview || 'Overview'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {dictionary.common?.adminOverviewDesc || 'Monitor and manage system-wide activities'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer h-full border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">{card.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor} border-2 ${card.borderColor}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {dictionary.common?.quickActions || 'Quick Actions'}
          </CardTitle>
          <CardDescription>
            {dictionary.common?.quickActionsDesc || 'Common administrative tasks'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href={`/${locale}/dashboard/academies`}>
            <Button variant="outline" className="h-10">
              <Building2 className="h-4 w-4 mr-2" />
              {dictionary.nav?.academies || 'Manage Academies'}
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/health-tests`}>
            <Button variant="outline" className="h-10">
              <Stethoscope className="h-4 w-4 mr-2" />
              {dictionary.nav?.healthTests || 'View Health Tests'}
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/medal-requests`}>
            <Button variant="outline" className="h-10">
              <Medal className="h-4 w-4 mr-2" />
              {dictionary.nav?.medalRequests || 'Review Medal Requests'}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
