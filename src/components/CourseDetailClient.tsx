'use client';

import { User } from '@/lib/db/repositories/userRepository';
import { Course } from '@/lib/db/repositories/courseRepository';
import { AuthUser } from '@/lib/auth/auth';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Trophy, Activity, Star, Medal, Target } from 'lucide-react';

interface CourseDetailClientProps {
  dictionary: Dictionary;
  locale: Locale;
  kid: User | any;
  course: Course;
  currentUser: AuthUser | any;
}

export function CourseDetailClient({
  dictionary,
  locale,
  kid,
  course,
  currentUser,
}: CourseDetailClientProps) {
  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 me-2" />
          {locale === 'ar' ? 'رجوع' : 'Back'}
        </Button>
      </div>

      {/* Course Header Card */}
      <Card className="shadow-lg border-2 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-blue-900 mb-2">
                  {locale === 'ar' ? course.nameAr : course.name}
                </h1>
                <p className="text-gray-600 mb-3">
                  {locale === 'ar' ? course.descriptionAr : course.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    {locale === 'ar' ? 'نشط' : 'Active'}
                  </Badge>
                  <Badge variant="outline">
                    {locale === 'ar' ? 'الطالب:' : 'Student:'} {kid.fullName || kid.username}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Course Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              {course.startDate && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {locale === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                    </p>
                    <p className="font-semibold text-blue-900">
                      {new Date(course.startDate).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
              {course.endDate && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {locale === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                    </p>
                    <p className="font-semibold text-blue-900">
                      {new Date(course.endDate).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Overview and Achievements */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 me-2" />
            {locale === 'ar' ? 'النظرة العامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="h-4 w-4 me-2" />
            {locale === 'ar' ? 'الإنجازات' : 'Achievements'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Personal Schedule Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">
                  {locale === 'ar' ? 'البرنامج الشخصي' : 'Personal Schedule'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
                </p>
                <p className="text-sm">
                  {locale === 'ar' 
                    ? 'سيتم عرض الجدول الزمني الشخصي والجلسات هنا' 
                    : 'Personal schedule and sessions will be displayed here'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Progress Chart Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">
                  {locale === 'ar' ? 'نمودار التقدم' : 'Progress Chart'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
                </p>
                <p className="text-sm">
                  {locale === 'ar' 
                    ? 'سيتم عرض مخططات التقدم والإحصائيات هنا' 
                    : 'Progress charts and statistics will be displayed here'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4 mt-4">
          {/* Medals Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg">
                  {locale === 'ar' ? 'الميداليات' : 'Medals'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Medal className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  {locale === 'ar' ? 'لا توجد ميداليات بعد' : 'No medals yet'}
                </p>
                <p className="text-sm">
                  {locale === 'ar' 
                    ? 'سيتم عرض الميداليات المكتسبة هنا' 
                    : 'Earned medals will be displayed here'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Points Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">
                  {locale === 'ar' ? 'النقاط' : 'Points'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 border-4 border-blue-200 mb-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">0</p>
                    <p className="text-xs text-gray-500">
                      {locale === 'ar' ? 'نقطة' : 'Points'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  {locale === 'ar' 
                    ? 'ابدأ بالتدريب لكسب النقاط!' 
                    : 'Start training to earn points!'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Stats */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">
                  {locale === 'ar' ? 'إحصائيات الإنجازات' : 'Achievement Stats'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">
                    {locale === 'ar' ? 'جلسات' : 'Sessions'}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">
                    {locale === 'ar' ? 'ساعات' : 'Hours'}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">
                    {locale === 'ar' ? 'مهارات' : 'Skills'}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">0%</p>
                  <p className="text-sm text-gray-600">
                    {locale === 'ar' ? 'الإنجاز' : 'Progress'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
