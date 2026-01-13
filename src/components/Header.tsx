'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Bell, Download, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface HeaderProps {
  dictionary: Dictionary;
  locale: Locale;
  user?: {
    fullName?: string;
    email: string;
    role?: string;
  } | null;
}

export function Header({ dictionary, locale, user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Don't prevent default - browser will handle it if we don't show custom UI
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setInstallPrompt(null);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push(`/${locale}/auth/login`);
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={`/${locale}`} className="flex h-14 items-center gap-3">
          <Image
            src="/logo-white.png"
            alt="DNA"
            width={44}
            height={44}
            priority
            className="h-11 w-auto object-contain"
          />
          <span className="hidden sm:block text-base font-semibold text-white">
            {dictionary.common.appName}
          </span>
        </Link>

        {/* Primary Nav (desktop) */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {[
            { href: `/${locale}`, label: dictionary.nav.home, active: pathname === `/${locale}` },
            { href: `/${locale}/about`, label: dictionary.nav.about, active: pathname?.startsWith(`/${locale}/about`) },
            { href: `/${locale}/contact`, label: dictionary.nav.contact, active: pathname?.startsWith(`/${locale}/contact`) },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                'inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold transition-none ' +
                (item.active
                  ? 'bg-white/10 text-white'
                  : 'text-white/80 hover:bg-white/5 hover:text-white')
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {/* Install App Button */}
          {installPrompt && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleInstall}
              className="h-11 w-11 rounded-lg border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition-none"
              title={dictionary.common.installApp}
            >
              <Download className="h-5 w-5" />
              <span className="sr-only">{dictionary.common.installApp}</span>
            </Button>
          )}

          {/* Show notifications only for logged-in users */}
          {user && (
            <Link href={`/${locale}/dashboard/notifications`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-lg border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition-none"
                title={dictionary.nav.notifications}
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">{dictionary.nav.notifications}</span>
              </Button>
            </Link>
          )}

          {/* User Menu or Login Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-none"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                    {user.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 border border-white/10 bg-gray-950/90 backdrop-blur-2xl"
              >
                <DropdownMenuLabel className="border-b border-white/10">
                  <div className="flex flex-col space-y-1 p-2">
                    <span className="text-sm font-bold text-white">
                      {user.fullName || dictionary.common.welcome}
                    </span>
                    <span className="text-xs text-gray-400">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                
                {/* Dashboard Link */}
                {user.role && user.role !== 'player' && (
                  <>
                    <Link href={`/${locale}/dashboard`}>
                      <DropdownMenuItem className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10">
                        <User className="mr-2 h-4 w-4" />
                        <span className="font-medium">{dictionary.nav.dashboard}</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="bg-white/10" />
                  </>
                )}
                
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer font-medium text-red-300 hover:bg-red-500/20 focus:bg-red-500/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{dictionary.common.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={`/${locale}/auth/login`}>
              <Button className="h-10 rounded-lg bg-white px-6 font-semibold text-black hover:bg-white/90 transition-none">
                {dictionary.common.login}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}