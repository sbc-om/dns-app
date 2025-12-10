import { requireAuth } from '@/lib/auth/auth';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import WhatsAppMessagingClient from '@/components/WhatsAppMessagingClient';
import { redirect } from 'next/navigation';

export default async function WhatsAppMessagingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };
  const dictionary = await getDictionary(locale);
  const currentUser = await requireAuth(locale);
  
  // Only admin and coach can access this page
  if (currentUser.role !== 'admin' && currentUser.role !== 'coach') {
    redirect(`/${locale}/dashboard/forbidden`);
  }

  return (
    <WhatsAppMessagingClient 
      dictionary={dictionary} 
      locale={locale} 
    />
  );
}
