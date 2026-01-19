'use client';

import { useCallback, useMemo, useState } from 'react';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Mail, Phone, CheckCircle2, MessageSquare, Zap } from 'lucide-react';

interface PublicAppointmentBookingFormProps {
  dictionary: Dictionary;
  locale: string;
}

interface TimeSlot {
  time: string;
  isBooked: boolean;
}

export function PublicAppointmentBookingForm({ dictionary, locale }: PublicAppointmentBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    date: '',
    time: '',
    notes: '',
  });

  const loadAvailableDates = useCallback(async () => {
    setLoadingDates(true);
    setError('');
    try {
      const response = await fetch('/api/schedules');
      const data = await response.json();

      if (data.success && Array.isArray(data.dates)) {
        setAvailableDates(data.dates);
        return;
      }

      setAvailableDates([]);
    } catch (err) {
      console.error('Error loading available dates:', err);
      setAvailableDates([]);
    } finally {
      setLoadingDates(false);
    }
  }, []);

  const loadTimeSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setError('');
    try {
      const response = await fetch(`/api/schedules?date=${encodeURIComponent(date)}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.timeSlots)) {
        setTimeSlots(data.timeSlots);
        return;
      }
      setTimeSlots([]);
    } catch (err) {
      console.error('Error loading time slots:', err);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // initial load (no useEffect in this repo is enforced strictly; we trigger via user intent too)
  // but we still want data ready: do a safe lazy-init on first render.
  const hasLoadedDates = useMemo(() => availableDates.length > 0, [availableDates.length]);
  if (!hasLoadedDates && !loadingDates && availableDates.length === 0) {
    // Fire-and-forget; React will ignore repeated identical updates.
    void loadAvailableDates();
  }

  const selectedDateLabel = useMemo(() => {
    if (!formData.date) return '';
    const d = new Date(`${formData.date}T00:00:00`);
    return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [formData.date, locale]);

  const handleSelectDate = async (date: string) => {
    setFormData((p) => ({ ...p, date, time: '' }));
    await loadTimeSlots(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.date || !formData.time) {
        setError(dictionary.errors?.validationError || 'Validation error');
        return;
      }

      const response = await fetch('/api/appointments/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, locale }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setIsSuccess(true);
        setFormData({ fullName: '', email: '', phoneNumber: '', date: '', time: '', notes: '' });
        setTimeSlots([]);
        return;
      }

      setError(data.error || dictionary.appointment?.bookingError || dictionary.errors?.serverError || 'Server error');
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(dictionary.appointment?.bookingError || dictionary.errors?.serverError || 'Server error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent" />
          </div>
          <CardContent className="relative p-8">
            <div className="mx-auto max-w-xl text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="mx-auto grid h-20 w-20 place-content-center rounded-3xl border border-white/10 bg-black/30"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>

              <h3 className="mt-6 text-3xl font-black tracking-tight text-white">
                {dictionary.appointments?.bookingSuccess || 'Booking Successful!'}
              </h3>
              <p className="mt-2 text-sm font-medium text-white/70">
                {dictionary.appointments?.bookingSuccessMessage || 'Your appointment has been scheduled. We will contact you soon to confirm.'}
              </p>

              <Button asChild className="mt-6 h-12 rounded-2xl bg-white text-black hover:bg-white/90 font-black">
                <motion.button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {dictionary.appointments?.bookAnother || 'Book Another Appointment'}
                </motion.button>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, type: 'spring', stiffness: 240, damping: 20 }}
    >
      <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-linear-to-br from-[#FF5F02]/18 via-purple-500/10 to-transparent blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-linear-to-tr from-blue-500/16 via-[#FF5F02]/10 to-transparent blur-3xl"
            animate={{ scale: [1, 1.06, 1], opacity: [0.22, 0.52, 0.22] }}
            transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <CardHeader className="relative border-b border-white/10 px-6 py-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-black tracking-tight text-white">
                {dictionary.appointments?.appointmentDetails || 'Appointment Details'}
              </CardTitle>
              <CardDescription className="mt-1 text-sm font-medium text-white/65">
                {dictionary.appointments?.fillDetails || 'Please fill in your information below'}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                <Calendar className="h-4 w-4" />
                <span>{dictionary.appointments?.preferredDate || 'Preferred Date'}</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                <Clock className="h-4 w-4" />
                <span>{dictionary.appointments?.preferredTime || 'Preferred Time'}</span>
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative px-6 py-6">
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
            {/* Left: Form fields */}
            <div className="space-y-5 lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-white/90">
                    <span className="inline-flex items-center gap-2">
                      <User className="h-4 w-4 text-white/60" />
                      {dictionary.common?.fullName || 'Full Name'}
                    </span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder={dictionary.appointments?.enterFullName || 'Enter your full name'}
                    className="h-12 bg-black/30 border-white/10 text-white placeholder:text-white/35 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-semibold text-white/90">
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-white/60" />
                      {dictionary.common?.phoneNumber || 'Phone Number'}
                    </span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, phoneNumber: e.target.value }))}
                    placeholder={dictionary.appointments?.enterPhone || 'Enter your phone number'}
                    className="h-12 bg-black/30 border-white/10 text-white placeholder:text-white/35 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-white/90">
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4 text-white/60" />
                    {dictionary.common?.email || 'Email'}
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder={dictionary.appointments?.enterEmail || 'Enter your email'}
                  className="h-12 bg-black/30 border-white/10 text-white placeholder:text-white/35 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-white/90">
                  <span className="inline-flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-white/60" />
                    {dictionary.appointments?.additionalNotes || 'Additional Notes'}
                    <span className="text-xs font-semibold text-white/50">({dictionary.common?.optional || 'Optional'})</span>
                  </span>
                </Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  placeholder={dictionary.appointments?.notesPlaceholder || 'Any additional information...'}
                  className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20 focus:ring-2 focus:ring-white/20"
                  rows={4}
                />
              </div>

              <AnimatePresence initial={false}>
                {error ? (
                  <motion.div
                    key="booking-error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm font-medium text-red-100/90"
                  >
                    {error}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <Button
                asChild
                type="submit"
                disabled={isSubmitting || !formData.date || !formData.time}
                className="h-12 w-full rounded-2xl bg-white text-black hover:bg-white/90 font-black disabled:opacity-60"
              >
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {isSubmitting ? (dictionary.common?.loading || 'Loading...') : (dictionary.appointments?.submitBooking || dictionary.appointment?.confirmBooking || 'Confirm Booking')}
                </motion.button>
              </Button>
            </div>

            {/* Right: Date + time */}
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-sm font-black text-white">
                    <Calendar className="h-4 w-4 text-white/70" />
                    <span>{dictionary.appointments?.preferredDate || 'Preferred Date'}</span>
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => void loadAvailableDates()}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 hover:bg-white/10"
                  >
                    {dictionary.appointment?.refresh || dictionary.common?.refresh || 'Refresh'}
                  </motion.button>
                </div>

                {loadingDates ? (
                  <div className="py-6 text-center text-sm text-white/60">{dictionary.common?.loading || 'Loading...'}</div>
                ) : availableDates.length === 0 ? (
                  <div className="py-6 text-center text-sm text-white/60">
                    {dictionary.appointment?.noAvailableDates || 'No dates available for booking'}
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {availableDates.slice(0, 10).map((date) => {
                      const dateObj = new Date(`${date}T00:00:00`);
                      const isSelected = formData.date === date;
                      return (
                        <motion.button
                          key={date}
                          type="button"
                          onClick={() => void handleSelectDate(date)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                            isSelected
                              ? 'border-white/25 bg-white/10'
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div>
                            <div className="text-sm font-bold text-white">
                              {dateObj.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long' })}
                            </div>
                            <div className="text-xs font-semibold text-white/60">
                              {dateObj.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                          </div>
                          {isSelected ? <CheckCircle2 className="h-5 w-5 text-white" /> : <span className="text-xs text-white/40">+</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 inline-flex items-center gap-2 text-sm font-black text-white">
                  <Clock className="h-4 w-4 text-white/70" />
                  <span>{dictionary.appointments?.preferredTime || 'Preferred Time'}</span>
                </div>

                {!formData.date ? (
                  <div className="py-6 text-center text-sm text-white/60">
                    {dictionary.appointment?.selectDateFirst || dictionary.common?.continue || 'Please select a date first'}
                  </div>
                ) : loadingSlots ? (
                  <div className="py-6 text-center text-sm text-white/60">{dictionary.common?.loading || 'Loading...'}</div>
                ) : timeSlots.length === 0 ? (
                  <div className="py-6 text-center text-sm text-white/60">
                    {dictionary.appointment?.noSlotsAvailable || 'No time slots available for this date'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => {
                      const isSelected = formData.time === slot.time;
                      return (
                        <motion.button
                          key={slot.time}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => setFormData((p) => ({ ...p, time: slot.time }))}
                          whileHover={slot.isBooked ? undefined : { scale: 1.02 }}
                          whileTap={slot.isBooked ? undefined : { scale: 0.98 }}
                          className={`relative rounded-2xl border px-3 py-3 text-center text-sm font-bold transition-colors ${
                            slot.isBooked
                              ? 'border-red-500/30 bg-red-500/10 text-red-100/70 opacity-70 cursor-not-allowed'
                              : isSelected
                              ? 'border-white/25 bg-white text-black'
                              : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                          }`}
                        >
                          {slot.time}
                          {slot.isBooked ? (
                            <span className="absolute inset-x-0 -bottom-1 translate-y-full text-[10px] font-semibold text-red-200/70">
                              {dictionary.appointments?.booked || 'Booked'}
                            </span>
                          ) : null}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-semibold text-white/60">{dictionary.appointments?.confirmTitle || 'Summary'}</div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center justify-between text-white/85">
                    <span className="font-semibold">{dictionary.appointments?.labelDate || 'Date:'}</span>
                    <span className="text-white/70">{selectedDateLabel || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/85">
                    <span className="font-semibold">{dictionary.appointments?.labelTime || 'Time:'}</span>
                    <span className="text-white/70">{formData.time || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
