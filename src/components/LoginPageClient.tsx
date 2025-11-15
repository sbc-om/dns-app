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
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md">
        <Link 
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {dictionary.nav.home}
        </Link>
        
        <Card className="w-full">
          <CardHeader className="text-center">
            <Link href={`/${locale}`} className="flex items-center justify-center space-x-2 mb-4">
              <Image 
                src="/logo.png" 
                alt="DNA Logo" 
                width={32} 
                height={32}
                className="h-8 w-8"
              />
              <span className="font-bold text-xl">DNA</span>
            </Link>
            <CardTitle className="text-2xl">{dictionary.auth.loginTitle}</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <LoginForm dictionary={dictionary} locale={locale} />
            </Suspense>

            <div className="mt-6 text-center">
              <Link 
                href={`/${locale}/auth/forgot-password`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {dictionary.auth.forgotPassword}
              </Link>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {dictionary.auth.dontHaveAccount}{' '}
                <Link 
                  href={`/${locale}/auth/register`}
                  className="text-primary hover:underline font-medium"
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
