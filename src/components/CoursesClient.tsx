'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Clock, Users, Search, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  getAllCoursesAction,
  updateCourseAction,
  deleteCourseAction,
} from '@/lib/actions/courseActions';
import { getAllCategoriesAction } from '@/lib/actions/categoryActions';
import type { Course } from '@/lib/db/repositories/courseRepository';
import type { Category } from '@/lib/db/repositories/categoryRepository';

interface CoursesClientProps {
  locale: string;
  dict: any;
}

export default function CoursesClient({ locale, dict }: CoursesClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [coursesResult, categoriesResult] = await Promise.all([
      getAllCoursesAction(),
      getAllCategoriesAction()
    ]);

    if (coursesResult.success && coursesResult.courses) {
      setCourses(coursesResult.courses);
    }
    if (categoriesResult.success && categoriesResult.categories) {
      setCategories(categoriesResult.categories);
    }
    setLoading(false);
  };

  // Use all available categories for filtering
  const filterOptions = ['All', ...categories.map(c => c.name)];

  const getCategoryLabel = (name: string) => {
    if (name === 'All') return locale === 'ar' ? 'الكل' : 'All';
    const category = categories.find(c => c.name === name);
    return category ? (locale === 'ar' ? category.nameAr : category.name) : name;
  };

  const filteredCourses = courses.filter(course => {
    // Category filter
    if (selectedCategory !== 'All' && course.category !== selectedCategory) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = (course.name || '').toLowerCase();
      const nameAr = (course.nameAr || '').toLowerCase();
      const description = (course.description || '').toLowerCase();
      const descriptionAr = (course.descriptionAr || '').toLowerCase();
      
      return name.includes(query) || 
             nameAr.includes(query) || 
             description.includes(query) || 
             descriptionAr.includes(query);
    }
    
    return true;
  });

  const handleEditNavigate = (courseId: string) => {
    router.push(`/${locale}/dashboard/courses/${courseId}/edit`);
  };

  const handleToggleActive = async (course: Course) => {
    await updateCourseAction(course.id, { isActive: !course.isActive });
    loadData();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذه الدورة؟' : 'Are you sure you want to delete this course?')) {
      await deleteCourseAction(id);
      loadData();
      router.refresh();
    }
  };



  if (loading) {
    return <div className="flex items-center justify-center py-12">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{locale === 'ar' ? 'إدارة الدورات' : 'Course Management'}</h1>
          <p className="text-muted-foreground mt-1">
            {locale === 'ar' ? 'إدارة الدورات والأسعار' : 'Manage courses and pricing'}
          </p>
        </div>
        <Button onClick={() => router.push(`/${locale}/dashboard/courses/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          {locale === 'ar' ? 'دورة جديدة' : 'New Course'}
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className={`absolute top-2.5 h-4 w-4 text-muted-foreground ${locale === 'ar' ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={locale === 'ar' ? 'ابحث حسب الاسم أو الوصف...' : 'Search by name or description...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${locale === 'ar' ? 'pr-9' : 'pl-9'}`}
              />
            </div>

            {/* Category Filter Select */}
            <div className="w-full md:w-64 flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={locale === 'ar' ? 'اختر فئة' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {getCategoryLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-muted-foreground">
            {locale === 'ar' 
              ? `عرض ${filteredCourses.length} من ${courses.length} دورة`
              : `Showing ${filteredCourses.length} of ${courses.length} courses`}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {locale === 'ar' ? course.nameAr : course.name}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {locale === 'ar' ? course.descriptionAr : course.description}
                  </CardDescription>
                  {course.category && (
                    <Badge variant="outline" className="mt-2">
                      {getCategoryLabel(course.category)}
                    </Badge>
                  )}
                </div>
                <Badge variant={course.isActive ? 'default' : 'secondary'}>
                  {course.isActive ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <span className="font-semibold text-green-600">
                  {course.price} {course.currency}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  {course.duration} {locale === 'ar' ? 'شهر' : 'months'}
                </span>
              </div>
              
              {course.maxStudents && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  <span>
                    {locale === 'ar' ? 'الحد الأقصى:' : 'Max:'} {course.maxStudents} {locale === 'ar' ? 'طالب' : 'students'}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditNavigate(course.id)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  {locale === 'ar' ? 'تعديل' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(course)}
                  className="flex-1"
                >
                  {course.isActive ? (locale === 'ar' ? 'إلغاء التفعيل' : 'Deactivate') : (locale === 'ar' ? 'تفعيل' : 'Activate')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(course.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
