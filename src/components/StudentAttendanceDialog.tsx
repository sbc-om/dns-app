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
        <DialogContent className="max-w-2xl bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#262626] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b-2 border-[#DDDDDD] dark:border-[#262626] pb-4">
            <DialogTitle className="text-xl md:text-2xl font-bold text-[#262626] dark:text-white flex items-center gap-3">
              {student.profilePicture ? (
                <img
                  src={student.profilePicture}
                  alt={studentName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#FF5F02]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#FF5F02] to-orange-600 flex items-center justify-center">
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

          {loading ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : (
            <div className="space-y-6 py-4">
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
                    className={`h-20 flex flex-col items-center justify-center gap-2 ${
                      present
                        ? 'bg-green-500 hover:bg-green-600 text-white border-2 border-green-600'
                        : 'border-2 border-[#DDDDDD] dark:border-[#262626] hover:border-green-500'
                    }`}
                  >
                    <CheckCircle className="h-8 w-8" />
                    <span className="font-bold">
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
                    className={`h-20 flex flex-col items-center justify-center gap-2 ${
                      !present
                        ? 'bg-red-500 hover:bg-red-600 text-white border-2 border-red-600'
                        : 'border-2 border-[#DDDDDD] dark:border-[#262626] hover:border-red-500'
                    }`}
                  >
                    <XCircle className="h-8 w-8" />
                    <span className="font-bold">
                      {locale === 'ar' ? 'غائب' : 'Absent'}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Performance Score (only if present) */}
              {present && (
                <div className="space-y-3">
                  <Label htmlFor="score" className="text-base font-semibold text-[#262626] dark:text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#FF5F02]" />
                    {locale === 'ar' ? 'النقاط (1-10)' : 'Score (1-10)'}
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="score"
                      type="number"
                      min={1}
                      max={10}
                      value={score ?? ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setScore(isNaN(val) ? undefined : Math.min(Math.max(val, 1), 10));
                      }}
                      placeholder={locale === 'ar' ? 'أدخل النقاط' : 'Enter score'}
                      className="text-lg font-bold text-center bg-white dark:bg-[#000000] border-2 border-[#DDDDDD] dark:border-[#262626]"
                    />
                    {score && (
                      <Badge className="text-lg px-4 py-2 bg-[#FF5F02] hover:bg-[#FF5F02]/90">
                        {score}/10
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {locale === 'ar' 
                      ? 'قيم أداء الطالب من 1 إلى 10'
                      : 'Rate student performance from 1 to 10'
                    }
                  </p>
                </div>
              )}

              {/* Session Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-base font-semibold text-[#262626] dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#FF5F02]" />
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
                  className="resize-none bg-white dark:bg-[#000000] border-2 border-[#DDDDDD] dark:border-[#262626]"
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
                <div className="p-4 bg-linear-to-r from-orange-50 to-white dark:from-orange-950/20 dark:to-[#262626] border-2 border-[#FF5F02] rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#262626] dark:text-white flex items-center gap-2">
                        <Award className="h-5 w-5 text-[#FF5F02]" />
                        {locale === 'ar' ? 'منح ميدالية' : 'Award Medal'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {locale === 'ar' 
                          ? 'قم بحفظ الحضور أولاً، ثم امنح الطالب ميدالية'
                          : 'Save attendance first, then award a medal to this student'
                        }
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={openMedalDialog}
                      disabled={!attendanceId && !saving}
                      className="border-[#FF5F02] text-[#FF5F02] hover:bg-[#FF5F02] hover:text-white"
                    >
                      <Award className="h-5 w-5 me-2" />
                      {locale === 'ar' ? 'منح' : 'Award'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t-2 border-[#DDDDDD] dark:border-[#262626] pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="border-2 border-[#DDDDDD] dark:border-[#262626]"
            >
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-[#FF5F02] hover:bg-[#FF5F02]/90 text-white"
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
