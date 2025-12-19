'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Target, 
  Trophy, 
  CheckCircle, 
  XCircle,
  UserCircle,
  Star,
  Award,
  Plus,
  ChevronRight
} from 'lucide-react';
import { StudentAttendanceDialog } from './StudentAttendanceDialog';
import { getCourseAttendanceAction } from '@/lib/actions/attendanceActions';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { Locale } from '@/config/i18n';

interface Student {
  id: string;
  fullName?: string;
  username?: string;
  profilePicture?: string;
  nationalId?: string;
}

interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrollmentDate: string;
  paymentStatus: string;
}

interface RosterEntry {
  student: Student;
  enrollment: Enrollment;
}

interface Course {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  courseImage?: string;
  totalSessions?: number;
  sessionDays?: string[];
  sessionStartTime?: string;
  sessionEndTime?: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  present: boolean;
  score?: number;
  notes?: string;
}

interface CoachCourseDetailClientProps {
  course: Course;
  roster: RosterEntry[];
  dictionary: Dictionary;
  locale: Locale;
}

export function CoachCourseDetailClient({
  course,
  roster,
  dictionary,
  locale,
}: CoachCourseDetailClientProps) {
  const today = new Date().toISOString().split('T')[0];
  const [sessionDate, setSessionDate] = useState<string>(today);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load attendance for selected date
  useEffect(() => {
    async function loadAttendance() {
      setLoading(true);
      try {
        const result = await getCourseAttendanceAction(course.id, sessionDate);
        if (result.success && result.records) {
          setAttendanceRecords(result.records);
        }
      } catch (error) {
        console.error('Failed to load attendance:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, [course.id, sessionDate]);

  const openStudentDialog = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleAttendanceSaved = () => {
    // Reload attendance after save
    getCourseAttendanceAction(course.id, sessionDate).then(result => {
      if (result.success && result.records) {
        setAttendanceRecords(result.records);
      }
    });
  };

  // Get student attendance status
  const getStudentStatus = (studentId: string) => {
    return attendanceRecords.find(r => r.studentId === studentId);
  };

  // Calculate stats
  const totalStudents = roster.length;
  const presentCount = attendanceRecords.filter(r => r.present).length;
  const absentCount = totalStudents - presentCount;
  const avgScore = attendanceRecords.filter(r => r.score).length > 0
    ? Math.round(attendanceRecords.reduce((sum, r) => sum + (r.score || 0), 0) / attendanceRecords.filter(r => r.score).length)
    : 0;

  const courseName = locale === 'ar' ? (course.nameAr || course.name) : course.name;

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Course Header */}
        <Card className="border border-gray-200 dark:border-[#1F1F1F] bg-white dark:bg-[#111111] shadow-xl dark:shadow-[#FF5F02]/5">
          <CardHeader className="bg-linear-to-r from-white to-gray-50 dark:from-[#111111] dark:to-[#151515] border-b border-gray-200 dark:border-[#1F1F1F]">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  {courseName}
                </h1>
                {course.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                    {locale === 'ar' ? (course.descriptionAr || course.description) : course.description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={`${course.isActive ? 'bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'bg-gray-400 hover:bg-gray-500'} text-white shadow-lg`}>
                  {course.isActive 
                    ? (locale === 'ar' ? 'نشط' : 'Active')
                    : (locale === 'ar' ? 'غير نشط' : 'Inactive')
                  }
                </Badge>
                <Badge className="bg-linear-to-r from-[#FF5F02] to-orange-600 text-white shadow-lg">
                  {totalStudents} {locale === 'ar' ? 'طالب' : 'Students'}
                </Badge>
                {course.totalSessions && (
                  <Badge className="bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                    {course.totalSessions} {locale === 'ar' ? 'جلسة' : 'Sessions'}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Session Date & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Selector Card */}
          <Card className="border-2 border-[#DDDDDD] dark:border-[#262626] bg-white dark:bg-[#262626]">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-5 w-5 text-[#FF5F02]" />
                <h3 className="font-semibold text-[#262626] dark:text-white">
                  {locale === 'ar' ? 'تاريخ الجلسة' : 'Session Date'}
                </h3>
              </div>
              <Input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-white dark:bg-[#000000] border-[#DDDDDD] dark:border-[#262626]"
              />
            </CardContent>
          </Card>

          {/* Present Count */}
          <Card className="border-2 border-green-200 dark:border-green-900 bg-linear-to-br from-green-50 to-white dark:from-green-950/30 dark:to-[#262626]">
            <CardContent className="p-4 md:p-6 text-center">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">{presentCount}</p>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                {locale === 'ar' ? 'حاضر' : 'Present'}
              </p>
            </CardContent>
          </Card>

          {/* Absent Count */}
          <Card className="border-2 border-red-200 dark:border-red-900 bg-linear-to-br from-red-50 to-white dark:from-red-950/30 dark:to-[#262626]">
            <CardContent className="p-4 md:p-6 text-center">
              <XCircle className="h-10 w-10 mx-auto mb-2 text-red-600 dark:text-red-400" />
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">{absentCount}</p>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {locale === 'ar' ? 'غائب' : 'Absent'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Average Score Card */}
        {avgScore > 0 && (
          <Card className="border-2 border-[#FF5F02] bg-linear-to-r from-orange-50 to-white dark:from-orange-950/20 dark:to-[#262626]">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-[#FF5F02]" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {locale === 'ar' ? 'متوسط النقاط' : 'Average Score'}
                  </p>
                  <p className="text-2xl font-bold text-[#FF5F02]">{avgScore}/10</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students Grid */}
        <Card className="border-2 border-[#DDDDDD] dark:border-[#262626] bg-white dark:bg-[#262626]">
          <CardHeader className="bg-white dark:bg-[#262626] border-b-2 border-[#DDDDDD] dark:border-[#262626]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#FF5F02]" />
                <CardTitle className="text-lg text-[#262626] dark:text-white">
                  {locale === 'ar' ? 'الطلاب' : 'Students'}
                </CardTitle>
              </div>
              <Badge variant="outline" className="border-[#FF5F02] text-[#FF5F02]">
                {totalStudents} {locale === 'ar' ? 'طالب' : 'Total'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : totalStudents === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium mb-2">
                  {locale === 'ar' ? 'لا يوجد طلاب' : 'No Students'}
                </p>
                <p className="text-sm">
                  {locale === 'ar' ? 'لم يتم تسجيل أي طلاب في هذه الدورة بعد' : 'No students enrolled in this course yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {roster.map(({ student }) => {
                  const status = getStudentStatus(student.id);
                  const studentName = student.fullName || student.username || 'Unknown';
                  
                  return (
                    <Card
                      key={student.id}
                      onClick={() => openStudentDialog(student)}
                      className="group cursor-pointer border-2 border-[#DDDDDD] dark:border-[#262626] bg-white dark:bg-[#000000] hover:border-[#FF5F02] hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <CardContent className="p-4">
                        {/* Status Badge */}
                        <div className="flex justify-end mb-2">
                          {status ? (
                            status.present ? (
                              <Badge className="bg-green-500 text-white text-xs">
                                {locale === 'ar' ? '✓ حاضر' : '✓ Present'}
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500 text-white text-xs">
                                {locale === 'ar' ? '✗ غائب' : '✗ Absent'}
                              </Badge>
                            )
                          ) : (
                            <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                              {locale === 'ar' ? 'لم يتم التسجيل' : 'Not Marked'}
                            </Badge>
                          )}
                        </div>

                        {/* Profile Picture */}
                        <div className="flex justify-center mb-3">
                          {student.profilePicture ? (
                            <img
                              src={student.profilePicture}
                              alt={studentName}
                              className="w-20 h-20 rounded-full object-cover border-4 border-[#FF5F02] shadow-lg"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#FF5F02] to-orange-600 flex items-center justify-center border-4 border-orange-300 shadow-lg">
                              <UserCircle className="h-12 w-12 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Student Name */}
                        <h3 className="text-center font-bold text-[#262626] dark:text-white text-sm mb-2 line-clamp-2 min-h-10">
                          {studentName}
                        </h3>

                        {/* Score Badge */}
                        {status?.score && (
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-lg font-bold text-[#FF5F02]">
                              {status.score}/10
                            </span>
                          </div>
                        )}

                        {/* Action Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#FF5F02] text-[#FF5F02] hover:bg-[#FF5F02] hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            openStudentDialog(student);
                          }}
                        >
                          <Plus className="h-4 w-4 me-1" />
                          {locale === 'ar' ? 'تسجيل' : 'Mark'}
                          <ChevronRight className={`h-4 w-4 ms-1 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                        </Button>

                        {/* Notes Indicator */}
                        {status?.notes && (
                          <div className="mt-2 text-center">
                            <Badge variant="outline" className="text-xs">
                              {locale === 'ar' ? '📝 ملاحظات' : '📝 Notes'}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Dialog */}
      {selectedStudent && (
        <StudentAttendanceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          student={selectedStudent}
          courseId={course.id}
          sessionDate={sessionDate}
          dictionary={dictionary}
          locale={locale}
          onSaved={handleAttendanceSaved}
        />
      )}
    </div>
  );
}
