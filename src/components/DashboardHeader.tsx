'use client';

import { LogOut, User, Menu, X, Download, Bell, Globe, ArrowLeft, Shield } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { getUnreadCountAction } from '@/lib/actions/notificationActions';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface DashboardHeaderProps {
  dictionary: Dictionary;
  user: {
    fullName?: string;
    email: string;
    profilePicture?: string;
    role?: string;
  };
  onMobileMenuToggle?: () => void;
}

export function DashboardHeader({ dictionary, user, onMobileMenuToggle }: DashboardHeaderProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const result = await getUnreadCountAction();
      if (result.success) {
        setUnreadCount(result.count);
      }
    };

    fetchUnreadCount();
    // Poll every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const handleLogout = async () => {
    try {
      console.log('🔓 Logging out...');
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        console.log('✅ Logout successful, redirecting...');
        router.push(`/${locale}/auth/login`);
        router.refresh();
      } else {
        console.error('❌ Logout failed:', await response.text());
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(`/${locale}/dashboard`);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setInstallPrompt(null);
  };

  return (
    <header 
      className="sticky top-0 z-40 border-b bg-background"
    >
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 gap-2 sm:gap-3">
        {/* Left Section: Menu + Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Back + Mobile Menu */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMobileMenuToggle}
              className="lg:hidden h-9 w-9 sm:h-10 sm:w-10 shrink-0"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Title */}
          <h1 className="hidden sm:block text-base md:text-lg font-bold truncate">
            DNA
          </h1>
        </div>

        {/* Right Section: Actions - Grouped by priority */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Primary Actions Group - Always visible */}
          <div className="flex items-center gap-1">
            {/* Notifications - Always visible with badge */}
            <Link href={`/${locale}/dashboard/notifications`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 relative"
                aria-label={dictionary.nav.notifications}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu - Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full relative overflow-hidden"
                  aria-label="User menu"
                >
                  {user.profilePicture ? (
                    <img
                      key={user.profilePicture}
                      src={user.profilePicture}
                      alt={user.fullName || 'User'}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {user.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden border bg-primary flex items-center justify-center shrink-0">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.fullName || 'User'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-primary-foreground text-sm font-bold">
                          {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold truncate">
                          {user.fullName || dictionary.common.welcome}
                        </span>
                        {user.role && (
                          <span className="inline-flex items-center gap-1 rounded-full border bg-secondary px-2 py-0.5 text-[11px] font-semibold shrink-0">
                            <Shield className="h-3 w-3" />
                            {user.role.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSeparator />
                
                {/* Quick actions */}
                <div className="px-2 py-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/${locale}/dashboard`}>
                      <Button variant="outline" className="w-full justify-start gap-2 h-10">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">{dictionary.nav.dashboard}</span>
                      </Button>
                    </Link>

                    <Link href={`/${locale}/dashboard/profile`}>
                      <Button variant="outline" className="w-full justify-start gap-2 h-10">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">{dictionary.users.profile}</span>
                      </Button>
                    </Link>

                    <Link href={`/${locale}`} className="col-span-2">
                      <Button variant="outline" className="w-full justify-between h-10">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span className="text-sm font-medium">{dictionary.nav.home}</span>
                        </div>
                        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <DropdownMenuSeparator />
                
                {/* Language (full width) */}
                <div className="px-2 py-2">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-xs font-semibold">{dictionary.common.language}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{dictionary.common.languageDesc}</span>
                  </div>
                  <LanguageSwitcher fullWidth />
                </div>

                {/* Install App */}
                {installPrompt && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleInstall} className="cursor-pointer">
                      <Download className="mr-2 h-4 w-4" />
                      <span className="font-medium">{dictionary.common.installApp}</span>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                
                {/* Logout */}
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="cursor-pointer text-destructive focus:text-destructive font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{dictionary.common.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
