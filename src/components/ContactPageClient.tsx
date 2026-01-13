
'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { Locale } from '@/config/i18n';
import { Mail, Phone, MapPin, Building2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type SessionUser = { fullName?: string; email: string; role?: string };

export default function ContactPageClient({
  dictionary,
  locale,
  user,
}: {
  dictionary: Dictionary;
  locale: Locale;
  user?: SessionUser | null;
}) {
  const d = dictionary.pages.contact;
  const email = d.info.email;
  const phone = d.info.phone;
  const address = d.info.address;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header dictionary={dictionary} locale={locale} user={user} />

      <main className="flex-1 overflow-hidden">
        {/* Hero */}
        <section className="px-4 pt-16 pb-10">

          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl mb-6"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <Sparkles className="h-5 w-5 text-blue-400" />
              </motion.div>
              <span className="text-sm font-bold text-white/90">{d.clarification?.title || 'Partnership'}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 24 }}
              className="text-4xl md:text-6xl font-black"
            >
              <span className="text-white">{d.title}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-4 text-base md:text-lg text-white/70"
            >
              {d.subtitle}
            </motion.p>
          </div>
        </section>

        {/* Clarification Section */}
        {d.clarification && (
          <section className="px-4 pb-12">
            <div className="mx-auto max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border border-blue-500/30 bg-blue-500/5 backdrop-blur-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-blue-400" />
                      {d.clarification.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{d.clarification.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {d.clarification.types?.map((type: string, i: number) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10"
                        >
                          <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                          <span className="text-white text-sm font-semibold">{type}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        )}

        {/* Content */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-6"
            >
              <Card className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(59,130,246,0.14),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.12),transparent_60%)]" />
                <CardHeader className="relative">
                  <CardTitle className="text-2xl font-black text-white">{d.info.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <Link
                    href={`mailto:${email}`}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 hover:bg-black/30 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <Mail className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white/80">{d.info.emailLabel}</div>
                        <div className="text-base font-bold text-white truncate">{email}</div>
                      </div>
                    </motion.div>
                  </Link>

                  <Link
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 hover:bg-black/30 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                        <Phone className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white/80">{d.info.phoneLabel}</div>
                        <div className="text-base font-bold text-white truncate" dir="ltr" style={{ textAlign: 'left' }}>{phone}</div>
                      </div>
                    </motion.div>
                  </Link>

                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-pink-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white/80">{d.info.addressLabel}</div>
                      <div className="text-base font-bold text-white">{address}</div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="lg:col-span-7"
            >
              <Card className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(236,72,153,0.10),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.12),transparent_60%)]" />
                <CardHeader className="relative">
                  <CardTitle className="text-2xl font-black text-white">{d.form.title}</CardTitle>
                  <p className="text-gray-400 mt-2">{d.form.description}</p>
                </CardHeader>
                <CardContent className="relative">
                  <ContactForm dictionary={dictionary} locale={locale} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer dictionary={dictionary} locale={locale} />
    </div>
  );
}