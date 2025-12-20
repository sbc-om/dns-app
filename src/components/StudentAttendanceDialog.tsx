'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { 
  UserCircle, 
  CheckCircle, 
  XCircle, 
  Star, 
  Award,
  FileText,
  Save
} from 'lucide-react';
import { 
  getCourseAttendanceAction, 
  saveCourseAttendanceAction 
} from '@/lib/actions/attendanceActions';
import { AwardMedalDialog } from './AwardMedalDialog';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { Locale } from '@/config/i18n';

interface Student {
  id: string;
  fullName?: string;
  username?: string;
  profilePicture?: string;
  nationalId?: string;
}

interface StudentAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
  courseId: string;
  sessionDate: string;
  dictionary: Dictionary;
  locale: Locale;
  onSaved?: () => void;
}

export function StudentAttendanceDialog({
  open,
  onOpenChange,
  student,
  courseId,
  sessionDate,
  dictionary,
  locale,
  onSaved,
}: StudentAttendanceDialogProps) {
  const [present, setPresent] = useState(false);
  const [score, setScore] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [medalDialogOpen, setMedalDialogOpen] = useState(false);
  const [attendanceId, setAttendanceId] = useState('');

  const studentName = student.fullName || student.username || 'Unknown';

  // Load existing attendance
  useEffect(() => {
    if (open) {
      setLoading(true);
      getCourseAttendanceAction(courseId, sessionDate).then(result => {
        if (result.success && result.records) {
          const record = result.records.find(r => r.studentId === student.id);
          if (record) {
            setPresent(record.present);
            setScore(record.score);
            setNotes(record.notes || '');
            setAttendanceId(record.id);
          } else {
            // Reset for new entry
            setPresent(false);
            setScore(undefined);
            setNotes('');
            setAttendanceId('');
          }
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [open, courseId, sessionDate, student.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveCourseAttendanceAction(courseId, sessionDate, [
        {
          studentId: student.id,
          present,
          score,
          notes,
        },
      ]);

      if (result.success) {
        onSaved?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to save attendance:', error);
    } finally {
      setSaving(false);
    }
  };

  const openMedalDialog = () => {
    // Save first, then open medal dialog
    handleSave().then(() => {
      const id = attendanceId || `${courseId}-${sessionDate}-${student.id}`;
      setAttendanceId(id);
      setMedalDialogOpen(true);
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-lg max-w-2xl bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="border-b-2 border-[#DDDDDD] dark:border-[#000000] pb-4 px-6 pt-6">
            <DialogTitle className="text-xl md:text-2xl font-bold text-[#262626] dark:text-white flex items-center gap-3">
              {student.profilePicture ? (
                <img
                  src={student.profilePicture}
                  alt={studentName}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-[#FF5F02]"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#262626] dark:bg-[#1a1a1a] flex items-center justify-center border-2 border-[#DDDDDD] dark:border-[#000000]">
                  <UserCircle className="h-8 w-8 text-white" />
                </div>
              )}
              <div>
                <div>{studentName}</div>
                <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                  {new Date(sessionDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <OverlayScrollbarsComponent
            defer
            options={{
              scrollbars: { autoHide: 'leave', autoHideDelay: 200 },
              overflow: { x: 'hidden' }
            }}
            className="flex-1"
          >
            {loading ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400 px-6">
                {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : (
              <div className="space-y-6 py-4 px-6">
              {/* Attendance Status */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-[#262626] dark:text-white">
                  {locale === 'ar' ? 'حالة الحضور' : 'Attendance Status'}
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={present ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setPresent(true)}
                    className={`rounded-lg h-20 flex flex-col items-center justify-center gap-2 ${
                      present
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'border-2 border-[#DDDDDD] dark:border-[#000000] hover:border-green-500'
                    }`}
                  >
                    <CheckCircle className="h-7 w-7" />
                    <span className="font-semibold">
                      {locale === 'ar' ? 'حاضر' : 'Present'}
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant={!present ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => {
                      setPresent(false);
                      setScore(undefined);
                    }}
                    className={`rounded-lg h-20 flex flex-col items-center justify-center gap-2 ${
                      !present
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'border-2 border-[#DDDDDD] dark:border-[#000000] hover:border-red-500'
                    }`}
                  >
                    <XCircle className="h-7 w-7" />
                    <span className="font-semibold">
                      {locale === 'ar' ? 'غائب' : 'Absent'}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Performance Score (only if present) */}
              {present && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold text-[#262626] dark:text-white flex items-center gap-2">
                      <Star className="h-5 w-5 text-blue-500" fill="currentColor" />
                      {locale === 'ar' ? 'تقييم الأداء' : 'Performance Rating'}
                    </Label>
                    {score && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-bold text-2xl">
                        {score}/10
                      </div>
                    )}
                  </div>

                  {/* Slider */}
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={score ?? 5}
                      onChange={(e) => setScore(parseInt(e.target.value))}
                      className="slider w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      aria-label={locale === 'ar' ? 'تقييم الأداء' : 'Performance Rating'}
                      title={locale === 'ar' ? 'تقييم الأداء' : 'Performance Rating'}
                    />
                    
                    {/* Score labels */}
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <span
                          key={num}
                          className={`font-semibold transition-all ${
                            score === num
                              ? 'text-blue-600 dark:text-blue-400 text-sm scale-125'
                              : ''
                          }`}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {locale === 'ar' 
                      ? 'اسحب المؤشر لتقييم أداء الطالب'
                      : 'Slide to rate student performance'
                    }
                  </p>
                </div>
              )}

              {/* Session Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-base font-semibold text-[#262626] dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                  {locale === 'ar' ? 'ملاحظات الجلسة' : 'Session Notes'}
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={locale === 'ar' 
                    ? 'أضف ملاحظات حول أداء الطالب، السلوك، أو أي معلومات مهمة...'
                    : 'Add notes about student performance, behavior, or any important information...'
                  }
                  rows={4}
                  className="rounded-lg resize-none"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {locale === 'ar' 
                    ? '📝 ستكون هذه الملاحظات مرئية لأولياء الأمور والإدارة'
                    : '📝 These notes will be visible to parents and administrators'
                  }
                </p>
              </div>

              {/* Medal Award Button */}
              {present && (
                <div className="p-4 rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] bg-gray-50 dark:bg-[#1a1a1a]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Award className="h-6 w-6 text-yellow-500" />
                      <div>
                        <h4 className="font-semibold text-[#262626] dark:text-white">
                          {locale === 'ar' ? 'منح ميدالية' : 'Award Medal'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {locale === 'ar' 
                            ? 'قم بحفظ الحضور أولاً، ثم امنح الطالب ميدالية'
                            : 'Save attendance first, then award a medal to this student'
                          }
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={openMedalDialog}
                      disabled={!attendanceId && !saving}
                      className="rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <Award className="h-4 w-4 me-2" />
                      {locale === 'ar' ? 'منح' : 'Award'}
                    </Button>
                  </div>
                </div>
              )}
              </div>
            )}
          </OverlayScrollbarsComponent>

          <DialogFooter className="border-t-2 border-[#DDDDDD] dark:border-[#000000] pt-4 px-6 pb-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000]"
            >
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Save className="h-4 w-4 me-2" />
              {saving 
                ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                : (locale === 'ar' ? 'حفظ' : 'Save')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medal Award Dialog */}
      {attendanceId && (
        <AwardMedalDialog
          open={medalDialogOpen}
          onOpenChange={setMedalDialogOpen}
          studentId={student.id}
          studentName={studentName}
          courseId={courseId}
          attendanceId={attendanceId}
          onSuccess={() => {
            onSaved?.();
          }}
          dictionary={dictionary}
        />
      )}
    </>
  );
}
