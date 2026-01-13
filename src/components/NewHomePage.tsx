'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { Locale } from '@/config/i18n';

type SessionUser = {
  email: string;
  role?: string;
  fullName?: string;
};

interface NewHomePageProps {
  dictionary: Dictionary;
  locale: Locale;
  user?: SessionUser | null;
}

export default function NewHomePage({ dictionary, locale, user }: NewHomePageProps) {
  const d = dictionary.pages.home;

  const dashboardHref = `/${locale}/dashboard`;
  const loginHref = `/${locale}/auth/login`;

  return (
    <div className="min-h-screen bg-[#0a0a0a]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header dictionary={dictionary} locale={locale} user={user} />

      <main>
        {/* Hero */}
        <section className="relative px-4 py-14 sm:py-20 min-h-[70vh] sm:min-h-[80vh] flex items-center">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-black" />
            <div className="absolute inset-0 opacity-[0.10] bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25),transparent_55%),radial-gradient(circle_at_70%_65%,rgba(168,85,247,0.22),transparent_55%)]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 180, damping: 22 }}
            className="mx-auto max-w-5xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, type: 'spring', stiffness: 140, damping: 20 }}
              className="mx-auto mb-8 flex justify-center"
            >
              <div className="relative w-full max-w-[1200px]">
                <Image
                  src="/DNA-Logo-w.svg"
                  alt="DNA"
                  width={1600}
                  height={420}
                  priority
                  className="h-auto w-full object-contain"
                />
              </div>
            </motion.div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={user ? dashboardHref : loginHref}>
                <Button className="h-12 px-6 rounded-xl bg-white text-black hover:bg-white/90 font-semibold">
                  {user ? dictionary.nav.dashboard : d.hero.loginCta}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              <Link href={`/${locale}/contact`}>
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-xl border-white/20 text-white hover:bg-white/5"
                >
                  {d.hero.cta}
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Intro */}
        <section className="px-4 pb-12">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-white">{d.intro.title}</h2>
              <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">{d.intro.description}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mt-10"
            >
              <h3 className="text-2xl sm:text-3xl font-black text-white">{d.whatSetsApart.title}</h3>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[d.whatSetsApart.point1, d.whatSetsApart.point2, d.whatSetsApart.point3].map((p, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-base font-bold text-white">{p.title}</div>
                    <div className="mt-2 text-sm sm:text-base text-white/65">{p.description}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer dictionary={dictionary} locale={locale} />
    </div>
  );
}
