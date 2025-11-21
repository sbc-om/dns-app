'use server';

import { revalidatePath } from 'next/cache';
import {
  getAllCourses,
  getActiveCourses,
  findCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  type CreateCourseInput,
  type Course,
} from '../db/repositories/courseRepository';
import { getCurrentUser } from '../auth/auth';

// Get all courses (admin only)
export async function getAllCoursesAction() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }
  
  try {
    const courses = await getAllCourses();
    return { success: true, courses };
  } catch (error) {
    console.error('Error getting courses:', error);
    return { success: false, error: 'Failed to get courses' };
  }
}

// Get active courses (accessible to all authenticated users)
export async function getActiveCoursesAction() {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  try {
    const courses = await getActiveCourses();
    return { success: true, courses };
  } catch (error) {
    console.error('Error getting active courses:', error);
    return { success: false, error: 'Failed to get courses' };
  }
}

// Get course by ID
export async function getCourseByIdAction(id: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  try {
    const course = await findCourseById(id);
    
    if (!course) {
      return { success: false, error: 'Course not found' };
    }
    
    return { success: true, course };
  } catch (error) {
    console.error('Error getting course:', error);
    return { success: false, error: 'Failed to get course' };
  }
}

// Create course (admin only)
export async function createCourseAction(input: CreateCourseInput) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }
  
  try {
    const course = await createCourse(input);
    revalidatePath('/[locale]/dashboard/courses');
    return { success: true, course };
  } catch (error) {
    console.error('Error creating course:', error);
    return { success: false, error: 'Failed to create course' };
  }
}

// Update course (admin only)
export async function updateCourseAction(
  id: string,
  updates: Partial<CreateCourseInput & { isActive: boolean }>
) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }
  
  try {
    const course = await updateCourse(id, updates);
    
    if (!course) {
      return { success: false, error: 'Course not found' };
    }
    
    revalidatePath('/[locale]/dashboard/courses');
    return { success: true, course };
  } catch (error) {
    console.error('Error updating course:', error);
    return { success: false, error: 'Failed to update course' };
  }
}

// Delete course (admin only)
export async function deleteCourseAction(id: string) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }
  
  try {
    const deleted = await deleteCourse(id);
    
    if (!deleted) {
      return { success: false, error: 'Course not found' };
    }
    
    revalidatePath('/[locale]/dashboard/courses');
    return { success: true };
  } catch (error) {
    console.error('Error deleting course:', error);
    return { success: false, error: 'Failed to delete course' };
  }
}
