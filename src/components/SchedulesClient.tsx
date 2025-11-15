'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import {
  createScheduleAction,
  getSchedulesAction,
  deleteScheduleAction,
} from '@/lib/actions/appointmentActions';
import type { AppointmentSchedule } from '@/lib/db/repositories/appointmentRepository';

interface SchedulesClientProps {
  dictionary: Dictionary;
  locale: Locale;
}

export function SchedulesClient({ dictionary, locale }: SchedulesClientProps) {
  const [schedules, setSchedules] = useState<AppointmentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState('9');
  const [endHour, setEndHour] = useState('17');

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    const result = await getSchedulesAction();
    if (result.success && result.schedules) {
      setSchedules(result.schedules);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!date || !startHour || !endHour) {
      return;
    }

    setCreating(true);
    const result = await createScheduleAction(date, parseInt(startHour), parseInt(endHour));
    
    if (result.success) {
      setDialogOpen(false);
      setDate('');
      setStartHour('9');
      setEndHour('17');
      loadSchedules();
    }
    
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    await deleteScheduleAction(id);
    loadSchedules();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#000000] dark:text-white">
            {dictionary.nav.schedules}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {dictionary.appointment.manageSchedules}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#30B2D2] hover:bg-[#2694ad] text-white font-semibold rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              {dictionary.appointment.createSchedule}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {dictionary.appointment.createSchedule}
              </DialogTitle>
              <DialogDescription>
                Set up available time slots for a specific date
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="date" className="font-semibold">
                  {dictionary.appointment.selectDate}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5 border-2 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startHour" className="font-semibold">
                    {dictionary.appointment.startTime}
                  </Label>
                  <select
                    id="startHour"
                    aria-label={dictionary.appointment.startTime}
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="mt-1.5 w-full border-2 rounded-xl p-2"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="endHour" className="font-semibold">
                    {dictionary.appointment.endTime}
                  </Label>
                  <select
                    id="endHour"
                    aria-label={dictionary.appointment.endTime}
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="mt-1.5 w-full border-2 rounded-xl p-2"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={creating || !date}
                className="w-full bg-[#F2574C] hover:bg-[#d94940] text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {creating ? dictionary.common.loading : dictionary.common.create}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedules List */}
      {loading ? (
        <p className="text-center py-8 text-gray-600 dark:text-gray-400">{dictionary.common.loading}</p>
      ) : schedules.length === 0 ? (
        <Card className="border border-dashed border-gray-300 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-[#30B2D2] dark:text-[#30B2D2] mb-4" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              No schedules created yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Create your first schedule to enable appointment bookings
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <Card
              key={schedule.id}
              className="border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <CardHeader className="bg-[#FFFFFF] dark:bg-[#000000] pb-3">
                <CardTitle className="text-lg font-semibold text-[#000000] dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {new Date(schedule.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Total Slots:</span> {schedule.timeSlots.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Available:</span>{' '}
                    {schedule.timeSlots.filter(slot => slot.isAvailable).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Booked:</span>{' '}
                    {schedule.timeSlots.filter(slot => !slot.isAvailable).length}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(schedule.id)}
                  className="w-full mt-4"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {dictionary.common.delete}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
