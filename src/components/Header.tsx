'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  dictionary: Dictionary;
  locale: Locale;
}

export function Header({ dictionary, locale }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/about`, label: dictionary.nav.about },
    { href: `/${locale}/contact`, label: dictionary.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="DNA Web App Logo" 
            width={40} 
            height={40} 
            className="rounded-lg"
          />
          <span className="font-bold text-xl">DNA Web App</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
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
            <Button variant="ghost" size="sm">
              {dictionary.auth.login}
            </Button>
          </Link>
          <Link href={`/${locale}/auth/register`}>
            <Button size="sm">
              {dictionary.auth.register}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
            <div className="container py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t space-y-2">
                <LanguageSwitcher />
                <div className="flex space-x-2">
                  <Link href={`/${locale}/auth/login`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full">
                      {dictionary.auth.login}
                    </Button>
                  </Link>
                  <Link href={`/${locale}/auth/register`} className="flex-1">
                    <Button size="sm" className="w-full">
                      {dictionary.auth.register}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}