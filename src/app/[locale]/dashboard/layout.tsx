import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale, localeDirections } from '@/config/i18n';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { getUserAccessibleResources } from '@/lib/access-control/checkAccess';
import { jwtVerify } from 'jose';
import { findUserById } from '@/lib/db/repositories/userRepository';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
);

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
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    console.log('❌ No token in dashboard layout, redirecting to login');
    redirect(`/${locale}/auth/login`);
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    userId = payload.userId as string;
    console.log('✅ Token verified for user:', userId);
  } catch (error) {
    console.error('❌ Invalid token in dashboard layout:', error);
    redirect(`/${locale}/auth/login`);
  }

  const user = await findUserById(userId);
  if (!user || !user.isActive) {
    console.log('❌ User not found or inactive');
    redirect(`/${locale}/auth/login`);
  }

  console.log('✅ User authenticated:', user.email);

  // Get user's accessible resources
  const accessibleResources = await getUserAccessibleResources(user.id);

  // Transform user for DashboardHeader
  const headerUser = {
    email: user.email,
    fullName: user.fullName,
  };

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
          user={headerUser}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
