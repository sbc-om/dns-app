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
      <Card className="bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000] shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className={`absolute top-3 h-5 w-5 text-[#FF5F02] ${locale === 'ar' ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={locale === 'ar' ? 'ابحث حسب الاسم أو الوصف...' : 'Search by name or description...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${locale === 'ar' ? 'pr-10' : 'pl-10'} h-12 bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000] focus:border-[#FF5F02] dark:focus:border-[#FF5F02] text-[#262626] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500`}
              />
            </div>

            {/* Category Filter Select */}
            <div className="w-full md:w-64 flex items-center gap-2">
              <div className="p-2 bg-[#FF5F02]/10 dark:bg-[#FF5F02]/20 rounded-lg">
                <Filter className="h-5 w-5 text-[#FF5F02]" />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full h-12 bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000] focus:border-[#FF5F02] dark:focus:border-[#FF5F02] text-[#262626] dark:text-white hover:bg-gray-50 dark:hover:bg-[#0a0a0a]">
                  <SelectValue placeholder={locale === 'ar' ? 'اختر فئة' : 'Select category'} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000]">
                  {filterOptions.map((option) => (
                    <SelectItem 
                      key={option} 
                      value={option}
                      className="text-[#262626] dark:text-white hover:bg-[#FF5F02]/10 dark:hover:bg-[#FF5F02]/20 focus:bg-[#FF5F02]/10 dark:focus:bg-[#FF5F02]/20 cursor-pointer"
                    >
                      {getCategoryLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#FF5F02]/5 dark:bg-[#FF5F02]/10 rounded-lg border border-[#FF5F02]/20">
            <div className="h-2 w-2 rounded-full bg-[#FF5F02] animate-pulse"></div>
            <span className="text-sm font-medium text-[#262626] dark:text-white">
              {locale === 'ar' 
                ? `عرض ${filteredCourses.length} من ${courses.length} دورة`
                : `Showing ${filteredCourses.length} of ${courses.length} courses`}
            </span>
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
