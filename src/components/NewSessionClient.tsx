'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { SessionPlanEditor } from './SessionPlanEditor';
import { PageContainer, PageHeader } from './ui/page-layout';
import type { Course } from '@/lib/db/repositories/courseRepository';

interface NewSessionClientProps {
  locale: string;
  dictionary: any;
  course: Course;
  nextSessionNumber: number;
}

export default function NewSessionClient({
  locale,
  dictionary,
  course,
  nextSessionNumber,
}: NewSessionClientProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
    router.push(`/${locale}/dashboard/courses/${course.id}/edit?tab=sessions`);
  };

  const handleCancel = () => {
    router.push(`/${locale}/dashboard/courses/${course.id}/edit?tab=sessions`);
  };

  // Calculate default session date (next day from last session or today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <PageContainer maxWidth="4xl">
      <PageHeader
        title={dictionary.courses?.addSession || 'Add New Session'}
        description={
          locale === 'ar' 
            ? `${course.nameAr} - الجلسة رقم ${nextSessionNumber}`
            : `${course.name} - Session #${nextSessionNumber}`
        }
        backButton={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-2 active-scale"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{dictionary.common?.back || 'Back'}</span>
          </Button>
        }
      />

      {/* Session Editor */}
      <SessionPlanEditor
        courseId={course.id}
        sessionNumber={nextSessionNumber}
        sessionDate={today}
        locale={locale as 'en' | 'ar'}
        dictionary={dictionary}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}
