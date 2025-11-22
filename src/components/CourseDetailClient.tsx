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
import { ArrowLeft, Calendar, Trophy, Activity, Star, Medal, Target, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStudentCourseAttendanceAction } from '@/lib/actions/attendanceActions';
import type { AttendanceRecord } from '@/lib/db/repositories/attendanceRepository';

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
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const result = await getStudentCourseAttendanceAction(kid.id, course.id);
        if (result.success && result.records) {
          setAttendanceRecords(result.records);
        }
      } catch (error) {
        console.error('Failed to load attendance:', error);
      } finally {
        setLoadingAttendance(false);
      }
    }
    loadAttendance();
  }, [kid.id, course.id]);

  // Calculate stats
  const totalSessions = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.present).length;
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
  const averageScore = attendanceRecords.filter(r => r.score).length > 0
    ? Math.round(attendanceRecords.reduce((sum, r) => sum + (r.score || 0), 0) / attendanceRecords.filter(r => r.score).length)
    : 0;

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
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-900">{totalSessions}</p>
                <p className="text-sm text-blue-700">
                  {locale === 'ar' ? 'جلسات' : 'Sessions'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-900">{presentCount}</p>
                <p className="text-sm text-green-700">
                  {locale === 'ar' ? 'حضور' : 'Present'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold text-purple-900">{attendanceRate}%</p>
                <p className="text-sm text-purple-700">
                  {locale === 'ar' ? 'نسبة الحضور' : 'Attendance'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold text-yellow-900">{averageScore}/10</p>
                <p className="text-sm text-yellow-700">
                  {locale === 'ar' ? 'متوسط النقاط' : 'Avg Score'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance History */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">
                  {locale === 'ar' ? 'سجل الحضور' : 'Attendance History'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAttendance ? (
                <div className="text-center py-8 text-gray-500">
                  {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">
                    {locale === 'ar' ? 'لا توجد سجلات حضور بعد' : 'No attendance records yet'}
                  </p>
                  <p className="text-sm">
                    {locale === 'ar' 
                      ? 'سيتم عرض سجلات الحضور هنا بعد بدء الجلسات' 
                      : 'Attendance records will appear here after sessions start'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attendanceRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 mb-3 md:mb-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                          {record.present ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(record.sessionDate).toLocaleDateString(locale, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'long',
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {record.present 
                              ? (locale === 'ar' ? 'حاضر' : 'Present')
                              : (locale === 'ar' ? 'غائب' : 'Absent')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {record.score && (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50">
                            <Star className="h-5 w-5 text-yellow-600" />
                            <span className="font-bold text-yellow-900">{record.score}/10</span>
                          </div>
                        )}
                        {record.notes && (
                          <p className="text-sm text-gray-600 italic max-w-xs">"{record.notes}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
