'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Sparkles, Zap } from 'lucide-react';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublicAppointmentBookingForm } from '@/components/PublicAppointmentBookingForm';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';

interface BookAppointmentPageClientProps {
  dictionary: Dictionary;
  locale: Locale;
  user?: {
    fullName?: string;
    email: string;
    role?: string;
  } | null;
}

export function BookAppointmentPageClient({ dictionary, locale, user }: BookAppointmentPageClientProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => {
        const x = (i * 41) % 100;
        const y = (i * 57) % 100;
        const size = 5 + ((i * 13) % 12);
        const delay = (i % 6) * 0.25;
        const duration = 3.8 + (i % 7) * 0.4;
        return { id: i, x, y, size, delay, duration };
      }),
    []
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#05050b]">
      <Header dictionary={dictionary} locale={locale} user={user} />

      <main className="relative flex-1 overflow-y-auto">
        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -left-32 h-136 w-136 rounded-full bg-linear-to-br from-blue-600/25 via-purple-600/15 to-transparent blur-3xl"
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-44 -right-36 h-144 w-xl rounded-full bg-linear-to-tr from-[#FF5F02]/22 via-pink-500/12 to-transparent blur-3xl"
            animate={{ scale: [1, 1.06, 1], opacity: [0.45, 0.85, 0.45] }}
            transition={{ duration: 7.6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-size-[48px_48px]" />

          <AnimatePresence>
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-full bg-white/20"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.12, 0.35, 0.12], scale: [0.9, 1.25, 0.9], y: [0, -12, 0] }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </AnimatePresence>

          <motion.div
            className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/10 to-transparent opacity-15"
            animate={{ y: ['-10%', '120%'] }}
            transition={{ duration: 5.7, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 220, damping: 22 }}
            className="mx-auto w-full max-w-5xl px-4 py-10"
          >
            <div className="mb-8 text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                <CalendarDays className="h-4 w-4" />
                <span>{dictionary.appointments?.appointmentDetails || dictionary.appointment?.title || 'Appointment'}</span>
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {dictionary.appointments?.bookAppointment || 'Book an Appointment'}
              </h1>

              <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-white/70">
                {dictionary.appointments?.bookingDescription || 'Fill in your details to schedule an appointment with us'}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-white/60">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                  <Zap className="h-4 w-4" />
                  <span>{dictionary.appointments?.preferredDate || 'Preferred Date'}</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>{dictionary.appointments?.preferredTime || 'Preferred Time'}</span>
                </span>
              </div>
            </div>

            <PublicAppointmentBookingForm dictionary={dictionary} locale={locale} />
          </motion.div>

          <Footer dictionary={dictionary} locale={locale} />
        </div>
      </main>
    </div>
  );
}
