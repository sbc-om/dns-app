'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Clock, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  getAllCoursesAction,
  updateCourseAction,
  deleteCourseAction,
} from '@/lib/actions/courseActions';
import type { Course } from '@/lib/db/repositories/courseRepository';

interface CoursesClientProps {
  locale: string;
  dict: any;
}

export default function CoursesClient({ locale, dict }: CoursesClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    price: 0,
    currency: 'OMR',
    duration: 1,
    maxStudents: 0,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const result = await getAllCoursesAction();
    if (result.success && result.courses) {
      setCourses(result.courses);
    }
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!selectedCourse) return;

    const result = await updateCourseAction(selectedCourse.id, {
      name: formData.name,
      nameAr: formData.nameAr,
      description: formData.description || undefined,
      descriptionAr: formData.descriptionAr || undefined,
      price: formData.price,
      currency: formData.currency,
      duration: formData.duration,
      maxStudents: formData.maxStudents > 0 ? formData.maxStudents : undefined,
    });

    if (result.success) {
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      resetForm();
      loadCourses();
    }
  };

  const handleToggleActive = async (course: Course) => {
    await updateCourseAction(course.id, { isActive: !course.isActive });
    loadCourses();
  };

  const handleDelete = async (id: string) => {
    if (confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذه الدورة؟' : 'Are you sure you want to delete this course?')) {
      await deleteCourseAction(id);
      loadCourses();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      price: 0,
      currency: 'USD',
      duration: 1,
      maxStudents: 0,
    });
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      nameAr: course.nameAr,
      description: course.description || '',
      descriptionAr: course.descriptionAr || '',
      price: course.price,
      currency: course.currency,
      duration: course.duration,
      maxStudents: course.maxStudents || 0,
    });
    setIsEditDialogOpen(true);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
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
                  onClick={() => openEditDialog(course)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'تعديل الدورة' : 'Edit Course'}</DialogTitle>
            <DialogDescription>
              {locale === 'ar' ? 'تحديث تفاصيل الدورة' : 'Update the course details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">{locale === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-nameAr">{locale === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                <Input
                  id="edit-nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-description">{locale === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-descriptionAr">{locale === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                <Input
                  id="edit-descriptionAr"
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-price">{locale === 'ar' ? 'السعر' : 'Price'}</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-currency">{locale === 'ar' ? 'العملة' : 'Currency'}</Label>
                <Input
                  id="edit-currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">{locale === 'ar' ? 'المدة (أشهر)' : 'Duration (months)'}</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-maxStudents">{locale === 'ar' ? 'الحد الأقصى للطلاب' : 'Max Students'}</Label>
              <Input
                id="edit-maxStudents"
                type="number"
                min="0"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedCourse(null); resetForm(); }}>
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleEdit}>
                {locale === 'ar' ? 'حفظ' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
