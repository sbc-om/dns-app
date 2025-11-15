'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { RegisterForm } from '@/components/RegisterForm';

interface RegisterPageClientProps {
  dictionary: Dictionary;
  locale: Locale;
}

export default function RegisterPageClient({ dictionary, locale }: RegisterPageClientProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
      <div className="w-full max-w-md">
        <Link 
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 mb-6 transition-all hover:gap-3"
        >
          <ArrowLeft className="h-5 w-5" />
          {dictionary.nav.home}
        </Link>
        
        <Card className="w-full shadow-2xl border-3 border-blue-200 dark:border-blue-700 rounded-3xl overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur">
                    <CardHeader className="text-center pb-6">
            <Link href={`/${locale}`} className="flex items-center justify-center space-x-3 mb-4">
              <Image 
                src="/logo.png" 
                alt="DNA Logo" 
                width={40} 
                height={40}
                className="h-10 w-10"
              />
              <span className="font-black text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">DNA</span>
            </Link>
            <CardTitle className="text-2xl font-black text-blue-800 dark:text-blue-200">
              {dictionary.auth.signupTitle}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <RegisterForm dictionary={dictionary} locale={locale} />

            <div className="mt-5 text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl border-2 border-blue-200 dark:border-blue-700">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {dictionary.auth.alreadyHaveAccount}{' '}
                <Link 
                  href={`/${locale}/auth/login`}
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-bold underline underline-offset-2 transition-colors"
                >
                  {dictionary.auth.loginButton}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
