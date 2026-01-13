'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { Locale } from '@/config/i18n';
import { Target, TrendingUp, Award, Sparkles, Users } from 'lucide-react';

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
  const d = dictionary.pages.about;

  const teamMembers = [
    {
      key: 'mohannadSulimani' as const,
      imageSrc: '/mohannad-sulimani.jpg',
      name: d.team.members.mohannadSulimani.name,
    },
    {
      key: 'talalNaji' as const,
      imageSrc: '/talal-naji.jpg',
      name: d.team.members.talalNaji.name,
    },
  ];

  const systemCards = [
    {
      icon: Target,
      title: d.system.gamification.title,
      description: d.system.gamification.description,
      color: 'blue',
    },
    {
      icon: Users,
      title: d.system.athleticProfile.title,
      description: d.system.athleticProfile.description,
      color: 'purple',
    },
    {
      icon: TrendingUp,
      title: d.system.progressTracking.title,
      description: d.system.progressTracking.description,
      color: 'pink',
    },
    {
      icon: Award,
      title: d.system.rewardSystem.title,
      description: d.system.rewardSystem.description,
      color: 'green',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header dictionary={dictionary} locale={locale} user={user} />

      <main className="overflow-hidden">
        {/* Hero */}
        <section className="px-4 pt-16 pb-10">

          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 24 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 mb-6"
            >
              <motion.div
                animate={{ rotate: [0, -6, 6, -6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.4 }}
              >
                <Sparkles className="h-4 w-4 text-blue-300" />
              </motion.div>
              <span className="text-sm font-semibold text-white/90">{d.mission.title}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
              className="text-4xl md:text-6xl font-black tracking-tight"
            >
              <span className="text-white">{d.title}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="mt-4 text-base md:text-lg text-white/70 mx-auto max-w-3xl leading-relaxed"
            >
              {d.subtitle}
            </motion.p>
          </div>
        </section>

        {/* Origin Story */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.14),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.10),transparent_55%)]" />
                <CardHeader className="relative">
                  <CardTitle className="text-2xl md:text-3xl font-black text-white">
                    {d.origin.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative text-gray-300 leading-relaxed text-lg">
                  {d.origin.description}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-6xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(236,72,153,0.10),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(96,165,250,0.12),transparent_55%)]" />
                <CardHeader className="relative">
                  <CardTitle className="text-2xl md:text-3xl font-black text-white">
                    {d.mission.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative text-gray-300 leading-relaxed text-lg">
                  {d.mission.description}
                </CardContent>
              </Card>
            </motion.div>

            {/* Team */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              <Card className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl group">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.10),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.12),transparent_55%)]" />
                <CardContent className="relative p-8 md:p-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center text-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: [0, -6, 6, -6, 0] }}
                      transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2.4 }}
                      className="inline-flex"
                    >
                      <Users className="h-12 w-12 text-green-400" />
                    </motion.div>
                    <div className="text-2xl font-black text-white">{d.team.title}</div>
                  </motion.div>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {teamMembers.map((member, index) => (
                      <motion.div
                        key={member.key}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.55, delay: index * 0.08 }}
                        whileHover={{ scale: 1.03, rotateY: index === 0 ? 4 : -4, rotateX: 3 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className="relative group/member"
                      >
                        {/* Glow */}
                        <motion.div
                          className="pointer-events-none absolute -inset-1 rounded-3xl bg-linear-to-br from-blue-500/25 via-purple-500/15 to-green-500/20 blur-xl opacity-0 group-hover/member:opacity-100 transition-opacity"
                          animate={{ scale: [1, 1.06, 1] }}
                          transition={{ duration: 3.5, repeat: Infinity }}
                        />

                        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl">
                          <div className="relative aspect-square">
                            <Image
                              src={member.imageSrc}
                              alt={member.name}
                              fill
                              sizes="(max-width: 768px) 50vw, 240px"
                              className="object-cover"
                              priority={false}
                            />
                            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />
                          </div>

                          <div className="p-4">
                            <div className="text-sm sm:text-base font-extrabold text-white text-center">
                              {member.name}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
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
              <h2 className="text-3xl md:text-5xl font-black text-white">{d.system.title}</h2>
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
                  className="h-full group"
                >
                  <Card className="relative h-full overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl">
                    <div className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-br from-${item.color}-500/10 to-${item.color}-600/10`} />
                    <CardHeader className="relative">
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ rotate: [0, -4, 4, -4, 0] }}
                          transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2.2 }}
                          className={`h-14 w-14 rounded-2xl bg-linear-to-br from-${item.color}-500/20 to-${item.color}-600/20 border border-${item.color}-500/30 flex items-center justify-center shrink-0`}
                        >
                          <item.icon className={`h-7 w-7 text-${item.color}-400`} />
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
              <Card className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.10),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.12),transparent_55%)]" />
                <CardHeader className="relative">
                  <CardTitle className="text-2xl md:text-3xl font-black text-white">
                    {d.approach.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative text-gray-300 leading-relaxed text-lg">
                  {d.approach.description}
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
