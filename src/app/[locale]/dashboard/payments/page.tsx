import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/auth';
import { getDictionary } from '@/lib/i18n/getDictionary';
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

  // Only parents can access payments
  if (currentUser.role !== 'parent') {
    redirect(`/${locale}/dashboard/forbidden`);
  }

  const dict = await getDictionary(locale as 'en' | 'ar');

  return <PaymentsClient locale={locale} dict={dict} currentUser={currentUser} />;
}
