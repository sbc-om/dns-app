import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/auth';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { hasRolePermission } from '@/lib/db/repositories/rolePermissionRepository';
import CoursesClient from '@/components/CoursesClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CoursesPage({ params }: PageProps) {
  const { locale } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/${locale}/auth/login`);
  }

  // Check if user has permission to manage courses
  const canManageCourses = await hasRolePermission(currentUser.role, 'canManageCourses');
  
  if (!canManageCourses) {
    redirect(`/${locale}/dashboard/forbidden`);
  }

  const dict = await getDictionary(locale as 'en' | 'ar');

  return <CoursesClient locale={locale} dict={dict} />;
}
