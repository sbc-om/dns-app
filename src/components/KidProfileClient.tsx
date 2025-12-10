'use client';

import { User } from '@/lib/db/repositories/userRepository';
import { AuthUser } from '@/lib/auth/auth';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UserCircle, Trophy, Activity, Star, Calendar, Edit, BookOpen, Save, Trash2, Pencil, DollarSign, CheckCircle2, Award, Plus, X, Check } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { StudentMedalsDisplay } from '@/components/StudentMedalsDisplay';
import { updateUserProfilePictureAction } from '@/lib/actions/userActions';
import { getEnrollmentsByStudentIdAction, updateEnrollmentCourseAction, createEnrollmentAction, deleteEnrollmentAction } from '@/lib/actions/enrollmentActions';
import { getActiveCoursesAction } from '@/lib/actions/courseActions';
import { useEffect, useState } from 'react';
import type { Enrollment } from '@/lib/db/repositories/enrollmentRepository';
import type { Course } from '@/lib/db/repositories/courseRepository';

interface KidProfileClientProps {
  dictionary: Dictionary;
  locale: Locale;
  kid: User | any;
  currentUser: AuthUser | any;
}

export function KidProfileClient({
  dictionary,
  locale,
  kid,
  currentUser,
}: KidProfileClientProps) {
  const [currentKid, setCurrentKid] = useState<User>(kid);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [savingCourse, setSavingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(false);
  const [editingEnrollmentId, setEditingEnrollmentId] = useState<string | null>(null);
  const [deletingEnrollmentId, setDeletingEnrollmentId] = useState<string | null>(null);

  const handleImageUpload = async (file: File, croppedImageUrl: string) => {
    try {
      const result = await updateUserProfilePictureAction(currentKid.id, croppedImageUrl);
      if (result.success && result.user) {
        setCurrentKid(result.user);
      } else {
        alert(result.error || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      alert('Failed to upload profile picture');
    }
  };

  useEffect(() => {
    loadEnrollmentAndCourses();
  }, [kid.id]);

  const loadEnrollmentAndCourses = async () => {
    // Load kid's enrollments (can have multiple)
    const enrollmentResult = await getEnrollmentsByStudentIdAction(kid.id);
    if (enrollmentResult.success && enrollmentResult.enrollments) {
      setEnrollments(enrollmentResult.enrollments as any);
    }

    // Load available courses (for admin to add new course)
    if (currentUser.role === 'admin') {
      const coursesResult = await getActiveCoursesAction();
      if (coursesResult.success && coursesResult.courses) {
        setAvailableCourses(coursesResult.courses);
      }
    }
  };

  const handleSaveCourse = async () => {
    if (!selectedCourseId) return;
    
    setSavingCourse(true);
    
    try {
      if (editingEnrollmentId) {
        // Update existing enrollment
        const result = await updateEnrollmentCourseAction(editingEnrollmentId, selectedCourseId);
        if (result.success) {
          await loadEnrollmentAndCourses();
          setEditingCourse(false);
          setEditingEnrollmentId(null);
          setSelectedCourseId('');
        } else {
          alert(result.error || 'Failed to update course');
        }
      } else {
        // Create new enrollment
        const result = await createEnrollmentAction({
          studentId: kid.id,
          courseId: selectedCourseId,
          parentId: kid.parentId || '',
        });
        if (result.success) {
          await loadEnrollmentAndCourses();
          setEditingCourse(false);
          setSelectedCourseId('');
        } else {
          alert(result.error || 'Failed to add course');
        }
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course');
    }
    
    setSavingCourse(false);
  };

  const handleEditEnrollment = (enrollment: any) => {
    setEditingEnrollmentId(enrollment.id);
    setSelectedCourseId(enrollment.courseId);
    setEditingCourse(true);
  };

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذه الدورة؟' : 'Are you sure you want to delete this course?')) {
      return;
    }

    setDeletingEnrollmentId(enrollmentId);
    const result = await deleteEnrollmentAction(enrollmentId);
    
    if (result.success) {
      await loadEnrollmentAndCourses();
    } else {
      alert(result.error || 'Failed to delete enrollment');
    }
    setDeletingEnrollmentId(null);
  };

  const handleCancelEdit = () => {
    setEditingCourse(false);
    setEditingEnrollmentId(null);
    setSelectedCourseId('');
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {currentUser.role === 'admin' && (
              <div className="flex flex-col items-center gap-3">
                <ImageUpload
                  onUpload={handleImageUpload}
                  currentImage={currentKid.profilePicture}
                  aspectRatio={1}
                  maxSizeMB={2}
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{currentKid.fullName || currentKid.username}</h1>
                {currentUser.role === 'admin' && (
                  <Button
                    onClick={() => window.location.href = `/${locale}/dashboard/kids/${currentKid.id}/edit`}
                    variant="outline"
                    size="sm"
                    className="border-[#30B2D2] text-[#30B2D2] hover:bg-[#30B2D2] hover:text-white"
                  >
                    <Edit className="h-4 w-4 me-2" />
                    {dictionary.users.editUser}
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge variant="outline" className="text-sm">
                  {dictionary.users.role}: {dictionary.users.roles.kid}
                </Badge>
                {currentKid.nationalId && (
                  <Badge variant="secondary" className="text-sm">
                    {dictionary.users.nationalId}: {currentKid.nationalId}
                  </Badge>
                )}
                {currentKid.birthDate && (
                  <Badge variant="secondary" className="text-sm">
                    Birth: {new Date(currentKid.birthDate).toLocaleDateString(locale)}
                  </Badge>
                )}
              </div>
              <div className="text-gray-500 space-y-1">
                {currentKid.school && <p>🏫 {currentKid.school} {currentKid.grade && `- Grade ${currentKid.grade}`}</p>}
                {currentKid.position && <p>⚽ Position: {currentKid.position}</p>}
                <p className="text-sm">
                  {dictionary.users.createdAt}: {new Date(currentKid.createdAt).toLocaleDateString(locale)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Information Card */}
      <Card className="border-2 border-[#FF5F02]/20 bg-linear-to-br from-white to-orange-50/30 dark:from-[#262626] dark:to-[#1a1a1a] shadow-xl overflow-hidden">
            <CardHeader className="bg-linear-to-r from-[#FF5F02] to-[#ff7b33] text-white pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">
                      {locale === 'ar' ? 'الدورات التدريبية' : 'Training Courses'}
                    </CardTitle>
                    <p className="text-sm text-white/90 mt-1">
                      {locale === 'ar' ? 'مسار التعلم والتطور' : 'Learning & Development Path'}
                    </p>
                  </div>
                </div>
                {currentUser.role === 'admin' && availableCourses.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => editingCourse ? handleCancelEdit() : setEditingCourse(true)}
                    className="bg-white text-[#FF5F02] hover:bg-white/90 shadow-md active:scale-95 transition-all self-start sm:self-auto"
                  >
                    {editingCourse ? (
                      <>
                        <X className="h-4 w-4 me-1" />
                        {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 me-1" />
                        {locale === 'ar' ? 'إضافة دورة' : 'Add Course'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6 px-4 sm:px-6">
              {editingCourse && currentUser.role === 'admin' ? (
                <div className="space-y-4 bg-white dark:bg-[#262626] rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
                  <div>
                    <Label className="text-[#262626] dark:text-white font-semibold">{locale === 'ar' ? 'اختر الدورة' : 'Select Course'}</Label>
                    <Select
                      value={selectedCourseId}
                      onValueChange={setSelectedCourseId}
                    >
                      <SelectTrigger className="mt-2 h-12 bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000] focus:border-[#FF5F02] dark:focus:border-[#FF5F02] text-[#262626] dark:text-white hover:bg-gray-50 dark:hover:bg-[#0a0a0a]">
                        <SelectValue placeholder={locale === 'ar' ? 'اختر دورة جديدة' : 'Select new course'} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000]">
                        {availableCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id} className="text-[#262626] dark:text-white hover:bg-[#FF5F02]/10 dark:hover:bg-[#FF5F02]/20 cursor-pointer">
                            {locale === 'ar' ? course.nameAr : course.name} - {course.price} {course.currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleSaveCourse}
                    disabled={savingCourse || !selectedCourseId}
                    className="w-full bg-[#FF5F02] hover:bg-[#e55502] text-white shadow-md active:scale-95 transition-all h-12"
                  >
                    <Save className="h-4 w-4 me-2" />
                    {savingCourse ? (locale === 'ar' ? 'جاري الإضافة...' : 'Adding...') : (locale === 'ar' ? 'إضافة الدورة' : 'Add Course')}
                  </Button>
                </div>
              ) : enrollments.length > 0 ? (
                <div className="grid gap-4 sm:gap-6">
                  {enrollments.map((enrollment: any) => {
                    const isDeleting = deletingEnrollmentId === enrollment.id;
                    
                    return (
                      <div 
                        key={enrollment.id} 
                        className="group relative bg-white dark:bg-[#262626] rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-[#FF5F02] hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                      >
                        {/* Background gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-br from-[#FF5F02]/5 to-orange-50/30 dark:from-[#FF5F02]/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative flex flex-col sm:flex-row gap-4 p-4 sm:p-6">
                          {/* Course Image */}
                          {enrollment.course?.courseImage && (
                            <div className="relative h-48 sm:h-32 sm:w-32 lg:h-40 lg:w-40 shrink-0 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                              <img
                                src={enrollment.course.courseImage}
                                alt={locale === 'ar' ? enrollment.course.nameAr : enrollment.course.name}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                          
                          {/* Course Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div 
                                className={`flex-1 min-w-0 ${enrollment.paymentStatus === 'paid' ? 'cursor-pointer' : ''}`}
                                onClick={() => {
                                  if (enrollment.paymentStatus === 'paid') {
                                    window.location.href = `/${locale}/dashboard/kids/${currentKid.id}/courses/${enrollment.course?.id}`;
                                  }
                                }}
                              >
                                <h3 className="font-bold text-lg lg:text-xl text-gray-900 dark:text-white mb-2 group-hover:text-[#FF5F02] transition-colors">
                                  {locale === 'ar' ? enrollment.course?.nameAr : enrollment.course?.name}
                                </h3>
                                
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  {enrollment.paymentStatus === 'paid' ? (
                                    enrollment.course?.startDate && enrollment.course?.endDate && (
                                      <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                                        <Calendar className="h-4 w-4 text-[#FF5F02]" />
                                        <span className="font-medium">
                                          {new Date(enrollment.course.startDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span>-</span>
                                        <span className="font-medium">
                                          {new Date(enrollment.course.endDate).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                      </span>
                                    )
                                  ) : (
                                    <span className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full font-bold text-base">
                                      <DollarSign className="h-4 w-4" />
                                      {enrollment.course?.price} {enrollment.course?.currency}
                                    </span>
                                  )}
                                </div>

                                {/* Status Badge */}
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <Badge 
                                    className={`px-3 py-1.5 text-xs font-semibold shadow-md ${
                                      enrollment.paymentStatus === 'paid' ? 'bg-linear-to-r from-green-500 to-green-600 text-white border-0' :
                                      enrollment.paymentStatus === 'pending' ? 'bg-linear-to-r from-yellow-500 to-yellow-600 text-white border-0' :
                                      'bg-linear-to-r from-red-500 to-red-600 text-white border-0'
                                    }`}
                                  >
                                    {enrollment.paymentStatus === 'paid' && <CheckCircle2 className="h-3.5 w-3.5 me-1 inline" />}
                                    {enrollment.paymentStatus === 'paid' ? (locale === 'ar' ? 'نشطة' : 'Active') :
                                     enrollment.paymentStatus === 'pending' ? (locale === 'ar' ? 'قيد المراجعة' : 'Pending') :
                                     (locale === 'ar' ? 'غير مدفوع' : 'Unpaid')}
                                  </Badge>
                                </div>

                                {/* Description if exists */}
                                {enrollment.course?.description && enrollment.paymentStatus === 'paid' && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {locale === 'ar' ? enrollment.course.descriptionAr : enrollment.course.description}
                                  </p>
                                )}
                              </div>
                              
                              {/* Admin Actions */}
                              {currentUser.role === 'admin' && (
                                <div className="flex gap-2 shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditEnrollment(enrollment)}
                                    disabled={isDeleting}
                                    className="h-9 w-9 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 active:scale-95 transition-all"
                                    title={locale === 'ar' ? 'تعديل الدورة' : 'Edit Course'}
                                  >
                                    <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteEnrollment(enrollment.id)}
                                    disabled={isDeleting}
                                    className="h-9 w-9 p-0 hover:bg-red-100 dark:hover:bg-red-900 active:scale-95 transition-all"
                                    title={locale === 'ar' ? 'حذف الدورة' : 'Delete Course'}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {currentUser.role === 'parent' && enrollments.some((e: any) => e.paymentStatus !== 'paid') && (
                    <Button
                      className="w-full bg-linear-to-r from-[#30B2D2] to-[#1E3A8A] hover:from-[#1E3A8A] hover:to-[#30B2D2] text-white shadow-lg active:scale-95 transition-all h-12 text-base font-semibold"
                      onClick={() => window.location.href = `/${locale}/dashboard/payments`}
                    >
                      <DollarSign className="h-5 w-5 me-2" />
                      {locale === 'ar' ? 'الذهاب إلى صفحة الدفع' : 'Go to Payment Page'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <BookOpen className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                    {locale === 'ar' ? 'لم يتم تسجيل الطفل في أي دورة' : 'Not enrolled in any course'}
                  </p>
                  {currentUser.role === 'admin' && availableCourses.length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => setEditingCourse(true)}
                      className="bg-[#FF5F02] hover:bg-[#e55502] text-white shadow-md active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4 me-1" />
                      {locale === 'ar' ? 'تسجيل في دورة' : 'Enroll in Course'}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

      {/* Achievements (Medals) Section */}
      <StudentMedalsDisplay
        studentId={currentKid.id}
        title={locale === 'ar' ? 'الإنجازات' : 'Achievements'}
        description={locale === 'ar' ? 'الميداليات التي حصل عليها الطالب' : 'Medals earned by the student'}
        locale={locale}
      />



    </div>
  );
}
