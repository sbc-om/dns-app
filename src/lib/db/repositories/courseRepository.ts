import { getDatabase, generateId } from '../lmdb';

export interface Course {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  currency: string; // e.g., "USD", "SAR", "IQD"
  duration: number; // in months
  isActive: boolean;
  maxStudents?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  currency?: string;
  duration: number;
  maxStudents?: number;
}

// Get all courses
export async function getAllCourses(): Promise<Course[]> {
  const db = getDatabase();
  const courses: Course[] = [];
  
  const range = db.getRange({ start: 'course:', end: 'course:\xFF' });
  
  for (const { key, value } of range) {
    const keyStr = String(key);
    if (keyStr.startsWith('course:') && value) {
      courses.push(value as Course);
    }
  }
  
  return courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Get active courses only
export async function getActiveCourses(): Promise<Course[]> {
  const allCourses = await getAllCourses();
  return allCourses.filter(course => course.isActive);
}

// Get course by ID
export async function findCourseById(id: string): Promise<Course | null> {
  const db = getDatabase();
  const course = db.get(`course:${id}`);
  return course ? (course as Course) : null;
}

// Create new course
export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const db = getDatabase();
  const id = generateId();
  
  const course: Course = {
    id,
    name: input.name,
    nameAr: input.nameAr,
    description: input.description,
    descriptionAr: input.descriptionAr,
    price: input.price,
    currency: input.currency || 'USD',
    duration: input.duration,
    maxStudents: input.maxStudents,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  db.put(`course:${id}`, course);
  
  return course;
}

// Update course
export async function updateCourse(id: string, updates: Partial<CreateCourseInput & { isActive: boolean }>): Promise<Course | null> {
  const db = getDatabase();
  const existingCourse = await findCourseById(id);
  
  if (!existingCourse) {
    return null;
  }
  
  const updatedCourse: Course = {
    ...existingCourse,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  db.put(`course:${id}`, updatedCourse);
  
  return updatedCourse;
}

// Delete course
export async function deleteCourse(id: string): Promise<boolean> {
  const db = getDatabase();
  const course = await findCourseById(id);
  
  if (!course) {
    return false;
  }
  
  db.remove(`course:${id}`);
  return true;
}
