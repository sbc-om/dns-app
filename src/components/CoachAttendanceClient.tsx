'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Award } from 'lucide-react';
import { getCourseAttendanceAction, saveCourseAttendanceAction } from '@/lib/actions/attendanceActions';
import { AwardMedalDialog } from './AwardMedalDialog';

interface RosterEntry {
  id: string;
  name: string;
  profilePicture?: string;
}

interface AttendanceText {
  title: string;
  dateLabel: string;
  markAllPresent: string;
  clearAttendance: string;
  presentLabel: string;
  scoreLabel: string;
  save: string;
  saving: string;
  saved: string;
  loading: string;
  playerLabel: string;
  emptyState: string;
  awardMedal?: string;
}

interface CoachAttendanceClientProps {
  text: AttendanceText;
  courseId: string;
  roster: RosterEntry[];
  dictionary?: any;
  locale?: 'en' | 'ar';
}

type AttendanceState = Record<string, { present: boolean; score?: number }>; // key: studentId

export default function CoachAttendanceClient({ text, courseId, roster, dictionary, locale = 'en' }: CoachAttendanceClientProps) {
  const today = new Date().toISOString().split('T')[0];
  const [sessionDate, setSessionDate] = useState<string>(today);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [medalDialogOpen, setMedalDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);
  const [currentAttendanceId, setCurrentAttendanceId] = useState<string>('');

  const openMedalDialog = (studentId: string, studentName: string) => {
    setSelectedStudent({ id: studentId, name: studentName });
    setCurrentAttendanceId(`${courseId}-${sessionDate}-${studentId}`);
    setMedalDialogOpen(true);
  };

  const handleMedalSuccess = () => {
    setStatusMessage('Medal awarded successfully!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    setStatusMessage(null);
    setErrorMessage(null);
    startTransition(async () => {
      const result = await getCourseAttendanceAction(courseId, sessionDate);
      if (!isMounted) return;

      if (result.success && result.records) {
        const nextState: AttendanceState = {};
        for (const record of result.records) {
          nextState[record.studentId] = {
            present: record.present,
            score: record.score,
          };
        }
        setAttendance(nextState);
      } else if (result.error) {
        setErrorMessage(result.error);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [courseId, sessionDate, startTransition]);

  const togglePresent = (studentId: string) => {
    setAttendance((prev) => {
      const next = { ...prev };
      next[studentId] = {
        present: !(prev[studentId]?.present ?? false),
        score: prev[studentId]?.score,
      };
      return next;
    });
  };

  const updateScore = (studentId: string, value: string) => {
    const parsed = parseInt(value, 10);
    setAttendance((prev) => {
      const next = { ...prev };
      next[studentId] = {
        present: prev[studentId]?.present ?? false,
        score: Number.isNaN(parsed) ? undefined : Math.min(Math.max(parsed, 1), 10),
      };
      if (value === '') {
        next[studentId].score = undefined;
      }
      return next;
    });
  };

  const markAllPresent = () => {
    const next: AttendanceState = {};
    roster.forEach((student) => {
      next[student.id] = {
        present: true,
        score: attendance[student.id]?.score,
      };
    });
    setAttendance(next);
  };

  const clearAttendance = () => {
    const next: AttendanceState = {};
    roster.forEach((student) => {
      next[student.id] = {
        present: false,
        score: undefined,
      };
    });
    setAttendance(next);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const entries = roster.map((student) => ({
        studentId: student.id,
        present: attendance[student.id]?.present ?? false,
        score: attendance[student.id]?.score,
      }));
      const result = await saveCourseAttendanceAction(courseId, sessionDate, entries);
      if (result.success) {
        setStatusMessage(text.saved);
      } else if (result.error) {
        setErrorMessage(result.error);
      }
    } catch (error) {
      setErrorMessage('Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{text.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="sessionDate">
              {text.dateLabel}
            </label>
            <Input
              id="sessionDate"
              type="date"
              value={sessionDate}
              onChange={(event) => setSessionDate(event.target.value)}
              className="w-full max-w-sm md:max-w-xs"
            />
          </div>
          <div className="grid gap-2 sm:flex sm:items-center">
            <Button
              type="button"
              variant="secondary"
              onClick={markAllPresent}
              disabled={roster.length === 0}
              className="w-full sm:w-auto"
            >
              {text.markAllPresent}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={clearAttendance}
              disabled={roster.length === 0}
              className="w-full sm:w-auto"
            >
              {text.clearAttendance}
            </Button>
          </div>
        </div>

        {isPending ? (
          <div className="py-10 text-center text-muted-foreground">{text.loading}</div>
        ) : roster.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">{text.emptyState}</div>
        ) : (
          <div className="space-y-3">
            {roster.map((student) => {
              const state = attendance[student.id] || { present: false };
              const presentInputId = `present-${student.id}`;
              const scoreInputId = `score-${student.id}`;
              return (
                <div
                  key={student.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Mobile: Stacked Layout */}
                  <div className="flex flex-col gap-4 md:hidden">
                    <div className="flex items-center gap-3">
                      {student.profilePicture ? (
                        <img
                          src={student.profilePicture}
                          alt={student.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-orange-500 shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-base border-2 border-orange-400 shadow-md">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-base font-bold text-gray-900">
                        {student.name}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 hover:bg-blue-100/60 transition-colors cursor-pointer">
                      <Checkbox
                        id={presentInputId}
                        checked={state.present}
                        onCheckedChange={() => togglePresent(student.id)}
                        className="h-5 w-5"
                      />
                      <label 
                        htmlFor={presentInputId} 
                        className="text-sm font-medium text-gray-700 cursor-pointer select-none flex-1"
                      >
                        {text.presentLabel}
                      </label>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <label htmlFor={scoreInputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {text.scoreLabel}
                          </label>
                          <div className="px-3 py-1 rounded-lg bg-blue-500 text-white font-bold text-lg">
                            {state.score ?? 5}
                          </div>
                        </div>
                        <input
                          id={scoreInputId}
                          type="range"
                          min="1"
                          max="10"
                          value={state.score ?? 5}
                          onChange={(event) => updateScore(student.id, event.target.value)}
                          className="slider w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <span
                              key={num}
                              className={`transition-all ${
                                num === (state.score ?? 5)
                                  ? 'text-blue-600 dark:text-blue-400 font-bold scale-125'
                                  : ''
                              }`}
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openMedalDialog(student.id, student.name)}
                        className="mt-6 border-[#FF5F02] text-[#FF5F02] hover:bg-[#FF5F02] hover:text-white"
                      >
                        <Award className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tablet & Desktop: Row Layout */}
                  <div className="hidden md:grid md:grid-cols-[2fr_1.5fr_1fr] md:gap-6 md:items-center">
                    <div className="flex items-center gap-3">
                      {student.profilePicture ? (
                        <img
                          src={student.profilePicture}
                          alt={student.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-orange-500 shadow-md shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-base border-2 border-orange-400 shadow-md shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-base font-bold text-gray-900">
                        {student.name}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 hover:bg-blue-100/60 transition-colors cursor-pointer">
                      <Checkbox
                        id={`${presentInputId}-desktop`}
                        checked={state.present}
                        onCheckedChange={() => togglePresent(student.id)}
                        className="h-5 w-5"
                      />
                      <label 
                        htmlFor={`${presentInputId}-desktop`} 
                        className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                      >
                        {text.presentLabel}
                      </label>
                    </div>

                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <label htmlFor={`${scoreInputId}-desktop`} className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {text.scoreLabel}
                          </label>
                          <div className="px-3 py-1 rounded-lg bg-blue-500 text-white font-bold">
                            {state.score ?? 5}
                          </div>
                        </div>
                        <input
                          id={`${scoreInputId}-desktop`}
                          type="range"
                          min="1"
                          max="10"
                          value={state.score ?? 5}
                          onChange={(event) => updateScore(student.id, event.target.value)}
                          className="slider w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <span
                              key={num}
                              className={`transition-all ${
                                num === (state.score ?? 5)
                                  ? 'text-blue-600 dark:text-blue-400 font-bold scale-125'
                                  : ''
                              }`}
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openMedalDialog(student.id, student.name)}
                        className="border-[#FF5F02] text-[#FF5F02] hover:bg-[#FF5F02] hover:text-white"
                      >
                        <Award className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {statusMessage && <p className="text-sm text-green-600">{statusMessage}</p>}
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || roster.length === 0}>
            {isSaving ? text.saving : text.save}
          </Button>
        </div>
      </CardContent>
      </Card>

      {selectedStudent && (
      <AwardMedalDialog
        open={medalDialogOpen}
        onOpenChange={setMedalDialogOpen}
        studentId={selectedStudent.id}
        studentName={selectedStudent.name}
        courseId={courseId}
        attendanceId={currentAttendanceId}
        onSuccess={handleMedalSuccess}
        dictionary={dictionary || { 
          settings: { 
            awardMedal: text.awardMedal || (locale === 'ar' ? 'منح ميدالية' : 'Award Medal'), 
            awardMedalTo: locale === 'ar' ? 'منح ميدالية لـ' : 'Award Medal to', 
            selectMedal: locale === 'ar' ? 'اختر ميدالية' : 'Select Medal', 
            awardNotes: locale === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (Optional)', 
            noMedals: locale === 'ar' ? 'لا توجد ميداليات' : 'No medals available' 
          }, 
          common: { 
            cancel: locale === 'ar' ? 'إلغاء' : 'Cancel', 
            loading: locale === 'ar' ? 'جاري التحميل...' : 'Loading...', 
            save: locale === 'ar' ? 'حفظ' : 'Save' 
          }, 
          courses: { 
            points: locale === 'ar' ? 'نقاط' : 'pts' 
          } 
        }}
      />
    )}
    </>
  );
}
