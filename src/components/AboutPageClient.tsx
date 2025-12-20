'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { Locale } from '@/config/i18n';
import { BarChart3, Gamepad2, Gift, Sparkles, Target, UserCircle } from 'lucide-react';

type SessionUser = {
  fullName?: string;
  email: string;
  role?: string;
};

interface AboutPageClientProps {
  dictionary: Dictionary;
  locale: Locale;
  user?: SessionUser | null;
}

export default function AboutPageClient({ dictionary, locale, user }: AboutPageClientProps) {
  const systemCards = [
    {
      icon: Gamepad2,
      title: dictionary.pages.about.system.gamification.title,
      description: dictionary.pages.about.system.gamification.description,
    },
    {
      icon: UserCircle,
      title: dictionary.pages.about.system.athleticProfile.title,
      description: dictionary.pages.about.system.athleticProfile.description,
    },
    {
      icon: BarChart3,
      title: dictionary.pages.about.system.progressTracking.title,
      description: dictionary.pages.about.system.progressTracking.description,
    },
    {
      icon: Gift,
      title: dictionary.pages.about.system.rewardSystem.title,
      description: dictionary.pages.about.system.rewardSystem.description,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header dictionary={dictionary} locale={locale} user={user} />

      <main className="overflow-hidden">
        {/* Hero */}
        <section className="relative px-4 pt-18 pb-16">
          {/* Background layers */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-black" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,0.16),transparent_55%),radial-gradient(circle_at_75%_60%,rgba(168,85,247,0.14),transparent_60%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[28px_28px] opacity-[0.06]" />
          </div>

          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 24 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
            >
              <motion.div
                animate={{ rotate: [0, -6, 6, -6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.4 }}
              >
                <Sparkles className="h-4 w-4 text-blue-300" />
              </motion.div>
              <span className="text-sm font-semibold text-white/90">{dictionary.pages.about.mission.title}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
              className="mt-6 text-4xl md:text-6xl font-black tracking-tight text-white"
            >
              {dictionary.pages.about.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="mt-4 text-lg md:text-xl text-gray-300 mx-auto max-w-3xl leading-relaxed"
            >
              {dictionary.pages.about.subtitle}
            </motion.p>
          </div>
        </section>

        {/* Vision / Mission */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <Card className="relative overflow-hidden border border-white/10 bg-white/5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.14),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.10),transparent_55%)]" />
                <CardHeader className="relative">
                  <CardTitle className="text-2xl md:text-3xl font-black text-white">
                    {dictionary.pages.about.mission.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative text-gray-300 leading-relaxed">
                  {dictionary.pages.about.mission.description}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="lg:col-span-5"
            >
              <Card className="relative h-full overflow-hidden border border-white/10 bg-white/5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(236,72,153,0.10),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(96,165,250,0.12),transparent_55%)]" />
                <CardContent className="relative h-full flex items-center justify-center p-10">
                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, -2, 2, -2, 0] }}
                    transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-3"
                  >
                    <Target className="h-14 w-14 text-blue-300" />
                    <div className="text-sm font-semibold text-white/80">{dictionary.pages.about.system.title}</div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* System */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-5xl font-black text-white">{dictionary.pages.about.system.title}</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {systemCards.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: index * 0.06 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="h-full"
                >
                  <Card className="relative h-full overflow-hidden border border-white/10 bg-white/5">
                    <div className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.14),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(168,85,247,0.12),transparent_60%)]" />
                    <CardHeader className="relative">
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ rotate: [0, -4, 4, -4, 0] }}
                          transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2.2 }}
                          className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
                        >
                          <item.icon className="h-6 w-6 text-white" />
                        </motion.div>
                        <div className="min-w-0">
                          <CardTitle className="text-xl font-extrabold text-white">{item.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative text-gray-300 leading-relaxed">
                      {item.description}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Approach */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="relative overflow-hidden border border-white/10 bg-white/5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(236,72,153,0.10),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.12),transparent_60%)]" />
                <CardHeader className="relative">
                  <CardTitle className="text-2xl md:text-4xl font-black text-white text-center">
                    {dictionary.pages.about.approach.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative text-gray-300 leading-relaxed text-center mx-auto max-w-4xl">
                  {dictionary.pages.about.approach.description}
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
