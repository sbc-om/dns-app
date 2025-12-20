'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#DDDDDD] dark:bg-[#000000]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 220, damping: 22 }}
        className="w-full max-w-md"
      >
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#262626] dark:text-white">
          <motion.span
            whileHover={{ x: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="inline-flex items-center gap-2 hover:underline"
          >
            <ArrowLeft className="h-5 w-5" />
            {dictionary.nav.home}
          </motion.span>
        </Link>

        <motion.div
          whileHover={{ rotateY: 1.5, rotateX: 1.5 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="mt-6 transform-3d"
        >
          <Card className="relative w-full border-2 border-[#DDDDDD] dark:border-[#000000] rounded-3xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
            {/* Glow stays inside the card */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-linear-to-br from-[#FF5F02]/25 via-purple-500/10 to-transparent blur-3xl"
                animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.9, 0.55] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-linear-to-tr from-blue-500/15 via-[#FF5F02]/10 to-transparent blur-3xl"
                animate={{ scale: [1, 1.05, 1], opacity: [0.45, 0.75, 0.45] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <CardHeader className="relative text-center bg-gray-50/70 dark:bg-white/5 border-b-2 border-[#DDDDDD] dark:border-[#000000] py-8">
              <div className="flex justify-center mb-4">
                <motion.div
                  whileHover={{ rotate: -2, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  className="h-14 w-14 rounded-2xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-white/90 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center"
                >
                  <Image src="/logo.png" alt="DNA" width={40} height={40} priority />
                </motion.div>
              </div>
              <CardTitle className="text-2xl font-black text-[#262626] dark:text-white tracking-tight">
                {dictionary.auth.loginTitle}
              </CardTitle>
              <CardDescription className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
                {dictionary.auth?.loginSubtitle || dictionary.auth?.loginTitle}
              </CardDescription>
            </CardHeader>

            <CardContent className="relative p-6">
              <Suspense
                fallback={
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {dictionary.common.loading}
                  </div>
                }
              >
                <LoginForm dictionary={dictionary} locale={locale} />
              </Suspense>

              <div className="mt-4 text-center">
                <Link href={`/${locale}/auth/forgot-password`} className="text-sm font-semibold text-[#262626] dark:text-white">
                  <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block hover:underline">
                    {dictionary.auth.forgotPassword}
                  </motion.span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
