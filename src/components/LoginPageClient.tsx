'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe } from 'lucide-react';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { LoginForm } from '@/components/LoginForm';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface LoginPageClientProps {
  dictionary: Dictionary;
  locale: Locale;
}

export default function LoginPageClient({ dictionary, locale }: LoginPageClientProps) {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FF4A1F 0%, #FF6B47 55%, #FF8A5B 100%)',
      }}
    >

      {/* Top Navigation Bar */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-6"
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Language Switcher */}
        <LanguageSwitcher variant="light" />

        {/* Globe Icon - Link to Home */}
        <Link href={`/${locale}`}>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full bg-transparent backdrop-blur-xl border-2 border-white"
          >
            <Globe className="h-6 w-6 text-white" />
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6 py-12">
        <div className="w-full">
          {/* Title and Description */}
          <div className="mb-12 text-left">
            <h1
              className="mb-6 text-5xl font-black uppercase leading-[1.1] tracking-tight text-white"
              style={{ 
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                letterSpacing: '0.02em'
              }}
            >
              {dictionary.auth.championTitle}
            </h1>
            <p
              className="text-sm font-normal leading-relaxed text-white/90"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
            >
              {dictionary.auth.championSubtitle}
            </p>
          </div>

          {/* Login Form */}
          <div>
            <Suspense fallback={
              <div className="text-center">
                <p className="text-sm text-white/60">{dictionary.common.loading}</p>
              </div>
            }>
              <LoginForm dictionary={dictionary} locale={locale} />
            </Suspense>
          </div>

          {/* Logo + Bottom Text */}
          <div className="mt-10 text-center">
            <Link href={`/${locale}`} className="inline-flex flex-col items-center gap-4">
              <Image
                src="/logo-white.png"
                alt="DNA"
                width={64}
                height={64}
                priority
                className="drop-shadow-[0_6px_16px_rgba(0,0,0,0.25)]"
              />
              <span
                className="text-sm font-bold uppercase tracking-[0.15em] text-white/95"
                style={{ textShadow: '0 6px 18px rgba(0,0,0,0.35)' }}
              >
                DISCOVER NATURAL ABILITY
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
