'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { LoginForm } from '@/components/LoginForm';

interface LoginPageClientProps {
  dictionary: Dictionary;
  locale: Locale;
}

export default function LoginPageClient({ dictionary, locale }: LoginPageClientProps) {
  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 220, damping: 22 }}
          className="w-full"
        >
          <div className="mb-6 flex items-center justify-between">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white">
              <motion.span
                whileHover={{ x: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                {dictionary.nav.home}
              </motion.span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto w-full max-w-lg"
          >
            <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <CardHeader className="border-b border-white/10 px-6 py-6">
                <div className="flex items-center gap-3">
                  <Image src="/logo-white.png" alt="DNA" width={48} height={48} priority className="shrink-0" />
                  <div>
                    <CardTitle className="text-lg font-semibold tracking-tight text-white">
                      {dictionary.auth.loginTitle}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-white/60">
                      {dictionary.auth.loginSubtitle}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-6">
                <Suspense fallback={<div className="text-center text-sm text-white/60">{dictionary.common.loading}</div>}>
                  <LoginForm dictionary={dictionary} locale={locale} />
                </Suspense>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
