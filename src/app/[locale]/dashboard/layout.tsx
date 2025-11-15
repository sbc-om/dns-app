import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale, localeDirections } from '@/config/i18n';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { getUserAccessibleResources } from '@/lib/access-control/checkAccess';

type User = {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
};

async function getCurrentUser(): Promise<User | null> {
  // TODO: Implement actual session/auth check
  // This is a placeholder - replace with your NextAuth or custom auth solution
  // For now, returning null to indicate no user
  return null;
}

async function handleLogout() {
  'use server';
  // TODO: Implement actual logout logic
  redirect('/auth/login');
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };
  const dictionary = await getDictionary(locale);
  const direction = localeDirections[locale];

  // Check if user is authenticated
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // Get user's accessible resources
  const accessibleResources = await getUserAccessibleResources(user.id);

  return (
    <div className="flex h-screen" dir={direction}>
      <DashboardSidebar
        dictionary={dictionary}
        accessibleResources={accessibleResources}
        locale={locale}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          dictionary={dictionary}
          user={user}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
