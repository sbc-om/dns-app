'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Bell } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  dictionary: Dictionary;
  locale: Locale;
}

export function Header({ dictionary, locale }: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/about`, label: dictionary.nav.about },
    { href: `/${locale}/contact`, label: dictionary.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center space-x-3">
          <div className="text-4xl font-black bg-gradient-to-r from-[#F2574C] via-[#30B2D2] to-[#E8A12D] bg-clip-text text-transparent">
            DNA
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-base font-medium transition-colors hover:text-primary ${
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          <Link href={`/${locale}/auth/login`}>
            <Button variant="ghost" size="sm" className="text-base">
              {dictionary.auth.login}
            </Button>
          </Link>
          <Link href={`/${locale}/auth/register`}>
            <Button size="sm" className="bg-[#F2574C] hover:bg-[#F2574C]/90 text-base">
              {dictionary.auth.register}
            </Button>
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center space-x-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}