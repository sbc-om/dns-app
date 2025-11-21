import { requireAuth } from '@/lib/auth/auth';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { findUserById } from '@/lib/db/repositories/userRepository';
import { findCourseById } from '@/lib/db/repositories/courseRepository';
import { notFound, redirect } from 'next/navigation';
import { CourseDetailClient } from '@/components/CourseDetailClient';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; courseId: string }>;
}) {
  const { locale, id, courseId } = await params as { locale: Locale; id: string; courseId: string };
  const dictionary = await getDictionary(locale);
  const user = await requireAuth(locale);

  // Fetch the kid
  const kid = await findUserById(id);

  if (!kid) {
    notFound();
  }

  // Security check: Only Admin or the Parent of the kid can view this
  const isParent = user.role === 'parent' && kid.parentId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isParent && !isAdmin) {
    redirect(`/${locale}/dashboard`);
  }

  // Fetch the course
  const course = await findCourseById(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <CourseDetailClient
        dictionary={dictionary}
        locale={locale}
        kid={kid}
        course={course}
        currentUser={user}
      />
    </div>
  );
}
