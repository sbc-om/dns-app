'use client';

import { LogOut, User, Menu, X, Download, Bell, Globe, Building2, ChevronDown, ArrowLeft, Sparkles, Shield } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
import { getMyAcademiesAction, setCurrentAcademyAction } from '@/lib/actions/academyActions';

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
  const [academies, setAcademies] = useState<Array<{ id: string; name: string }>>([]);
  const [currentAcademyId, setCurrentAcademyId] = useState<string | null>(null);

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
    const loadAcademies = async () => {
      try {
        const result = await getMyAcademiesAction(locale);
        if (result.success) {
          const list = (result.academies || []).map((a) => ({ id: a.id, name: a.name }));
          setAcademies(list);
          setCurrentAcademyId(result.currentAcademyId || null);
        }
      } catch (e) {
        console.error('Failed to load academies:', e);
      }
    };

    loadAcademies();
  }, [locale]);

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

  const currentAcademyName =
    academies.find((a) => a.id === currentAcademyId)?.name ||
    (academies[0]?.name ?? dictionary.common.academy);

  const handleSwitchAcademy = async (academyId: string) => {
    try {
      const result = await setCurrentAcademyAction(locale, academyId);
      if (result.success) {
        setCurrentAcademyId(academyId);
        router.refresh();
      } else {
        console.error(result.error || 'Failed to switch academy');
      }
    } catch (e) {
      console.error('Failed to switch academy:', e);
    }
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="sticky top-0 z-40 border-b-2 border-white/10 dark:border-white/5 bg-linear-to-r from-white/95 via-blue-50/50 to-purple-50/50 dark:from-gray-900/95 dark:via-blue-950/50 dark:to-purple-950/50 backdrop-blur-xl shadow-lg"
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 opacity-50" />
      
      <div className="relative flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 gap-2 sm:gap-3">
        {/* Left Section: Menu + Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Back + Mobile Menu */}
          <div className="flex items-center gap-1 shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl hover:bg-linear-to-br hover:from-blue-500/10 hover:to-purple-500/10 dark:hover:from-blue-500/20 dark:hover:to-purple-500/20 active:scale-95 transition-all border-2 border-transparent hover:border-blue-500/20 dark:hover:border-blue-500/30"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-800 dark:text-gray-100 rtl:rotate-180" />
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMobileMenuToggle}
                className="lg:hidden h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl hover:bg-linear-to-br hover:from-blue-500/10 hover:to-purple-500/10 dark:hover:from-blue-500/20 dark:hover:to-purple-500/20 active:scale-95 transition-all border-2 border-transparent hover:border-blue-500/20 dark:hover:border-blue-500/30"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>

          {/* Title - Responsive visibility with animated gradient */}
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:block text-base md:text-lg font-bold truncate bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            style={{
              backgroundSize: '200% auto',
              animation: 'gradient 3s linear infinite'
            }}
          >
            DNA
          </motion.h1>
          <style jsx>{`
            @keyframes gradient {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>
        </div>

        {/* Right Section: Actions - Grouped by priority */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Primary Actions Group - Always visible */}
          <div className="flex items-center gap-1">
            {/* Academy Switcher - Hide icon on mobile, show on desktop */}
            {academies.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 sm:h-10 px-2 sm:px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all border-2 border-transparent hover:border-black/10 dark:hover:border-white/10 flex items-center gap-1.5"
                    aria-label="Switch academy"
                  >
                    <Building2 className="h-4 w-4 text-gray-700 dark:text-gray-200 shrink-0" />
                    <span className="hidden lg:inline max-w-[120px] xl:max-w-40 truncate text-sm font-semibold text-[#262626] dark:text-white">{currentAcademyName}</span>
                    <ChevronDown className="hidden lg:inline h-3.5 w-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 bg-white/90 dark:bg-gray-950/85 backdrop-blur-2xl border-2 border-black/10 dark:border-white/10 shadow-2xl shadow-purple-900/20 overflow-hidden"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.12),transparent_60%)]" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.10] dark:opacity-[0.07]" />

                  <DropdownMenuLabel className="relative bg-gray-50/70 dark:bg-white/5 border-b border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, -6, 6, -6, 0] }}
                        transition={{ duration: 0.8 }}
                      >
                        <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </motion.div>
                      <span className="text-sm font-black text-[#262626] dark:text-white">{dictionary.nav.academies}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                  {academies.map((a) => (
                    <DropdownMenuItem
                      key={a.id}
                      onClick={() => handleSwitchAcademy(a.id)}
                      className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5 relative"
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="font-medium text-[#262626] dark:text-white truncate">{a.name}</span>
                        {a.id === currentAcademyId && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xs font-black text-blue-700 dark:text-blue-300 shrink-0 inline-flex items-center gap-1"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            ✓
                          </motion.span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Notifications - Always visible with badge */}
            <Link href={`/${locale}/dashboard/notifications`}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-linear-to-br hover:from-blue-500/10 hover:to-purple-500/10 dark:hover:from-blue-500/20 dark:hover:to-purple-500/20 active:scale-95 transition-all border-2 border-transparent hover:border-blue-500/20 dark:hover:border-blue-500/30 relative"
                  aria-label={dictionary.nav.notifications}
                >
                  <Bell className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                  {unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-linear-to-br from-red-500 to-pink-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-lg"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    </motion.span>
                  )}
                </Button>
              </motion.div>
            </Link>

            {/* User Menu - Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl active:scale-95 transition-all border-2 border-transparent hover:border-blue-500/30 dark:hover:border-blue-500/50 relative overflow-hidden"
                    aria-label="User menu"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity" />
                    {user.profilePicture ? (
                      <img
                        key={user.profilePicture}
                        src={user.profilePicture}
                        alt={user.fullName || 'User'}
                        className="h-full w-full rounded-xl object-cover relative z-10"
                      />
                    ) : (
                      <div className="h-full w-full rounded-xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold relative z-10">
                        {user.fullName?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 bg-white/92 dark:bg-gray-950/85 backdrop-blur-2xl border-2 border-black/10 dark:border-white/10 shadow-2xl shadow-purple-900/25 overflow-hidden"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.12),transparent_60%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.10] dark:opacity-[0.07]" />

                <DropdownMenuLabel className="relative bg-gray-50/70 dark:bg-white/5 border-b border-black/10 dark:border-white/10">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-bold text-[#262626] dark:text-white truncate">
                      {user.fullName || dictionary.common.welcome}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                
                {/* Home */}
                <Link href={`/${locale}`}>
                  <DropdownMenuItem className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5">
                    <Globe className="mr-2 h-4 w-4 text-gray-700 dark:text-gray-200" />
                    <span className="font-medium text-[#262626] dark:text-white">{dictionary.nav.home}</span>
                  </DropdownMenuItem>
                </Link>

                {/* Profile */}
                <Link href={`/${locale}/dashboard/profile`}>
                  <DropdownMenuItem className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5">
                    <User className="mr-2 h-4 w-4 text-gray-700 dark:text-gray-200" />
                    <span className="font-medium text-[#262626] dark:text-white">{dictionary.users.profile}</span>
                  </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                
                {/* Language */}
                <div className="px-2 py-2 flex items-center justify-end">
                  <LanguageSwitcher />
                </div>

                {/* Install App */}
                {installPrompt && (
                  <>
                    <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                    <DropdownMenuItem onClick={handleInstall} className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5">
                      <Download className="mr-2 h-4 w-4 text-green-600 dark:text-green-500" />
                      <span className="font-medium text-[#262626] dark:text-white">{dictionary.common.installApp}</span>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />

                {/* Quick Access */}
                <Link href={`/${locale}/dashboard`}>
                  <DropdownMenuItem className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5">
                    <Shield className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-[#262626] dark:text-white">{dictionary.nav.dashboard}</span>
                  </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                
                {/* Logout */}
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="cursor-pointer text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 focus:bg-red-50 dark:focus:bg-red-950/20 font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{dictionary.common.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
