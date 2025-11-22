'use server';

import { getCurrentUser } from '@/lib/auth/auth';
import { findCourseById } from '@/lib/db/repositories/courseRepository';
import {
  getAttendanceForCourseAndDate,
  saveAttendanceBatch,
} from '@/lib/db/repositories/attendanceRepository';

function normalizeDate(date: string | undefined) {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  return parsed.toISOString().split('T')[0];
}

export async function getCourseAttendanceAction(courseId: string, sessionDate?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const course = await findCourseById(courseId);
  if (!course) {
    return { success: false, error: 'Course not found' };
  }

  if (user.role !== 'coach' && user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  if (user.role === 'coach' && course.coachId !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const date = normalizeDate(sessionDate);
  const records = await getAttendanceForCourseAndDate(courseId, date);
  return { success: true, records };
}

export async function saveCourseAttendanceAction(
  courseId: string,
  sessionDate: string,
  entries: Array<{ studentId: string; present: boolean; score?: number; notes?: string }>
) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const course = await findCourseById(courseId);
  if (!course) {
    return { success: false, error: 'Course not found' };
  }

  if (user.role !== 'coach' && user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  if (user.role === 'coach' && course.coachId !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const date = normalizeDate(sessionDate);
  const filteredEntries = entries.filter((entry) => Boolean(entry.studentId));
  const records = await saveAttendanceBatch(courseId, user.id, date, filteredEntries);
  return { success: true, records };
}

export async function getStudentCourseAttendanceAction(studentId: string, courseId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const course = await findCourseById(courseId);
  if (!course) {
    return { success: false, error: 'Course not found' };
  }

  // Allow admin, coach of the course, or parent of the student to view
  const isAdmin = user.role === 'admin';
  const isCoach = user.role === 'coach' && course.coachId === user.id;
  const isParent = user.role === 'parent'; // We'll check parentId in the component

  if (!isAdmin && !isCoach && !isParent) {
    return { success: false, error: 'Unauthorized' };
  }

  const { getAttendanceByStudentAndCourse } = await import('@/lib/db/repositories/attendanceRepository');
  const records = await getAttendanceByStudentAndCourse(studentId, courseId);
  return { success: true, records };
}
