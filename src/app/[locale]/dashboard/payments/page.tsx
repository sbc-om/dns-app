import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/auth';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { hasRolePermission } from '@/lib/db/repositories/rolePermissionRepository';
import PaymentsClient from '@/components/PaymentsClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PaymentsPage({ params }: PageProps) {
  const { locale } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/${locale}/auth/login`);
  }

  // Check if user has permission to view payments
  const canViewPayments = await hasRolePermission(currentUser.role, 'canViewPayments');
  
  if (!canViewPayments) {
    redirect(`/${locale}/dashboard/forbidden`);
  }

  const dict = await getDictionary(locale as 'en' | 'ar');

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <PaymentsClient locale={locale} dict={dict} currentUser={currentUser} />
    </div>
  );
}
