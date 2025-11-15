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
          <CardTitle className="text-2xl">{dictionary.auth.signupTitle}</CardTitle>
          <CardDescription>{dictionary.auth.registerDescription}</CardDescription>
        </CardHeader>

        <CardContent>
          <RegisterForm dictionary={dictionary} locale={locale} />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {dictionary.auth.alreadyHaveAccount}{' '}
              <Link 
                href={`/${locale}/auth/login`}
                className="text-primary hover:underline font-medium"
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
