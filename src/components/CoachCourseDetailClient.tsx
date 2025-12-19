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
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Course Header */}
        <Card className="rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626] shadow-sm">
          <CardHeader className="border-b-2 border-[#DDDDDD] dark:border-[#000000] pb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#262626] dark:text-white mb-2">
                  {courseName}
                </h1>
                {course.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                    {locale === 'ar' ? (course.descriptionAr || course.description) : course.description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={`rounded-lg ${course.isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'} text-white`}>
                  {course.isActive 
                    ? (locale === 'ar' ? 'نشط' : 'Active')
                    : (locale === 'ar' ? 'غير نشط' : 'Inactive')
                  }
                </Badge>
                <Badge className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
                  {totalStudents} {locale === 'ar' ? 'طالب' : 'Students'}
                </Badge>
                {course.totalSessions && (
                  <Badge className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
                    {course.totalSessions} {locale === 'ar' ? 'جلسة' : 'Sessions'}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Session Date Selector - Full Width Professional */}
        <Card className="rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626] shadow-lg">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#262626] dark:text-white mb-1">
                    {locale === 'ar' ? 'تاريخ الجلسة' : 'Session Date'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {locale === 'ar' ? 'اختر التاريخ لعرض سجل الحضور' : 'Select date to view attendance records'}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 w-full md:w-80">
                <Input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full h-14 text-lg font-semibold text-center rounded-lg border-2 border-blue-500 dark:border-blue-400 bg-white dark:bg-[#1a1a1a] text-[#262626] dark:text-white shadow-sm hover:border-blue-600 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Present Count */}
          <Card className="rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626]">
            <CardContent className="p-4 md:p-6 text-center">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
              <p className="text-3xl font-bold text-[#262626] dark:text-white">{presentCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                {locale === 'ar' ? 'حاضر' : 'Present'}
              </p>
            </CardContent>
          </Card>

          {/* Absent Count */}
          <Card className="rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626]">
            <CardContent className="p-4 md:p-6 text-center">
              <XCircle className="h-10 w-10 mx-auto mb-2 text-red-500" />
              <p className="text-3xl font-bold text-[#262626] dark:text-white">{absentCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                {locale === 'ar' ? 'غائب' : 'Absent'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Average Score Card */}
        {avgScore > 0 && (
          <Card className="rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626]">
            <CardContent className="p-4 md:p-6 flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500" fill="currentColor" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {locale === 'ar' ? 'متوسط النقاط' : 'Average Score'}
                </p>
                <p className="text-2xl font-bold text-[#262626] dark:text-white">{avgScore}/10</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students Grid */}
        <Card className="rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626]">
          <CardHeader className="border-b-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-[#262626] dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                {locale === 'ar' ? 'الطلاب' : 'Students'}
              </CardTitle>
              <Badge className="rounded-lg bg-blue-500 text-white">
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
                      className="group cursor-pointer rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626] hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                    >
                      <CardContent className="p-4">
                        {/* Status Badge */}
                        <div className="flex justify-end mb-2">
                          {status ? (
                            status.present ? (
                              <Badge className="rounded-lg bg-green-500 text-white text-xs">
                                {locale === 'ar' ? '✓ حاضر' : '✓ Present'}
                              </Badge>
                            ) : (
                              <Badge className="rounded-lg bg-red-500 text-white text-xs">
                                {locale === 'ar' ? '✗ غائب' : '✗ Absent'}
                              </Badge>
                            )
                          ) : (
                            <Badge className="rounded-lg bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 text-xs">
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
                              className="w-20 h-20 rounded-full object-cover border-2 border-[#DDDDDD] dark:border-[#000000]"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-[#262626] dark:bg-[#1a1a1a] flex items-center justify-center border-2 border-[#DDDDDD] dark:border-[#000000]">
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
                            <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                            <span className="text-base font-bold text-[#262626] dark:text-white">
                              {status.score}/10
                            </span>
                          </div>
                        )}

                        {/* Action Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626] text-[#262626] dark:text-white hover:border-[#262626] dark:hover:border-white hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all"
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
                            <Badge className="rounded-lg text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
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
