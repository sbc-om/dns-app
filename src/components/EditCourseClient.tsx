'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ImageUpload';
import { updateCourseAction } from '@/lib/actions/courseActions';
import { Course } from '@/lib/db/repositories/courseRepository';

interface EditCourseClientProps {
  locale: string;
  dict: any;
  course: Course;
}

export default function EditCourseClient({ locale, dict, course }: EditCourseClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: course.name || '',
    nameAr: course.nameAr || '',
    description: course.description || '',
    descriptionAr: course.descriptionAr || '',
    price: course.price || 0,
    currency: course.currency || 'OMR',
    duration: course.duration || 1,
    maxStudents: course.maxStudents || 0,
    startDate: course.startDate ? course.startDate.split('T')[0] : '',
    endDate: course.endDate ? course.endDate.split('T')[0] : '',
    courseImage: course.courseImage || '',
    isActive: course.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateCourseAction(course.id, {
      name: formData.name,
      nameAr: formData.nameAr,
      description: formData.description || undefined,
      descriptionAr: formData.descriptionAr || undefined,
      price: formData.price,
      currency: formData.currency,
      duration: formData.duration,
      maxStudents: formData.maxStudents > 0 ? formData.maxStudents : undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      courseImage: formData.courseImage || undefined,
      isActive: formData.isActive,
    });

    if (result.success) {
      router.push(`/${locale}/dashboard/courses`);
    } else {
      alert(result.error || 'Failed to update course');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    router.push(`/${locale}/dashboard/courses`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {locale === 'ar' ? 'تعديل الدورة' : 'Edit Course'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {locale === 'ar' ? 'تحديث تفاصيل الدورة' : 'Update course details'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'ar' ? 'معلومات الدورة' : 'Course Information'}</CardTitle>
            <CardDescription>
              {locale === 'ar' ? 'قم بتعديل الحقول المطلوبة' : 'Update the required fields'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {locale === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Football Training"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">
                  {locale === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nameAr"
                  required
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="تدريب كرة القدم"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Course Image Upload */}
            <div className="space-y-2">
              <Label>
                {locale === 'ar' ? 'صورة الدورة' : 'Course Image'}
              </Label>
              <div className="flex justify-center">
                <ImageUpload
                  onUpload={(file, croppedImageUrl) => {
                    setFormData({ ...formData, courseImage: croppedImageUrl });
                  }}
                  currentImage={formData.courseImage}
                  aspectRatio={16 / 9}
                  maxSizeMB={3}
                  shape="square"
                  icon={<ImageIcon className="h-8 w-8" />}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {locale === 'ar' 
                  ? 'اختر صورة للدورة (اختياري)'
                  : 'Choose an image for the course (optional)'}
              </p>
            </div>

            {/* Description Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">
                  {locale === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Professional football training program for all ages..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionAr">
                  {locale === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </Label>
                <Textarea
                  id="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  placeholder="برنامج تدريب كرة قدم احترافي لجميع الأعمار..."
                  dir="rtl"
                  rows={4}
                />
              </div>
            </div>

            {/* Price, Currency, Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  {locale === 'ar' ? 'السعر' : 'Price'} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="50.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">
                  {locale === 'ar' ? 'العملة' : 'Currency'} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="currency"
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="OMR"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">
                  {locale === 'ar' ? 'المدة (أشهر)' : 'Duration (months)'} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
              </div>
            </div>

            {/* Start Date and End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  {locale === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  {locale === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                />
              </div>
            </div>

            {/* Max Students */}
            <div className="space-y-2">
              <Label htmlFor="maxStudents">
                {locale === 'ar' ? 'الحد الأقصى للطلاب' : 'Max Students'}
              </Label>
              <Input
                id="maxStudents"
                type="number"
                min="0"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 0 })}
                placeholder={locale === 'ar' ? '0 = غير محدود' : '0 = unlimited'}
              />
              <p className="text-sm text-muted-foreground">
                {locale === 'ar' 
                  ? 'اترك القيمة 0 إذا كنت لا تريد حد أقصى للطلاب'
                  : 'Leave as 0 if you don\'t want a limit on students'}
              </p>
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
                aria-label={locale === 'ar' ? 'الدورة نشطة' : 'Course is Active'}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                {locale === 'ar' ? 'الدورة نشطة' : 'Course is Active'}
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading 
                  ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                  : (locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
