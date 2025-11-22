'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950">
      <div className="w-full max-w-md">
        <Link 
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 mb-6 transition-all hover:gap-3"
        >
          <ArrowLeft className="h-5 w-5" />
          {dictionary.nav.home}
        </Link>
        
        <Card className="w-full shadow-2xl border-3 border-purple-200 dark:border-purple-700 rounded-3xl overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur">
          <CardHeader className="text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 py-6">
            <Link href={`/${locale}`} className="flex items-center justify-center mb-4">
              <Image 
                src="/logo.png" 
                alt="DNA Logo" 
                width={80} 
                height={80}
                className="h-20 w-20 object-contain"
              />
            </Link>
            <CardTitle className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {dictionary.auth.loginTitle}
            </CardTitle>
            <CardDescription className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-1">
              Enter your credentials
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <Suspense fallback={<div className="text-center text-purple-600">Loading...</div>}>
              <LoginForm dictionary={dictionary} locale={locale} />
            </Suspense>

            <div className="mt-4 text-center">
              <Link 
                href={`/${locale}/auth/forgot-password`}
                className="text-sm font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
              >
                {dictionary.auth.forgotPassword}
              </Link>
            </div>

            <div className="mt-5 text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl border-2 border-purple-200 dark:border-purple-700">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                {dictionary.auth.dontHaveAccount}{' '}
                <Link 
                  href={`/${locale}/book-appointment`}
                  className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-bold underline underline-offset-2 transition-colors"
                >
                  {dictionary.auth.signupButton}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
