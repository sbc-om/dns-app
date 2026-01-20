'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { PushNotificationInit } from '@/components/PushNotificationInit';
import { useNotificationFallback } from '@/lib/notifications/fallback';
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

interface DashboardLayoutClientProps {
  children: ReactNode;
  dictionary: Dictionary;
  user: {
    email: string;
    fullName?: string;
    role?: string;
  };
  accessibleResources: string[];
  locale: string;
  direction: string;
}

export function DashboardLayoutClient({
  children,
  dictionary,
  user,
  accessibleResources,
  locale,
  direction
}: DashboardLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPushSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 'PushManager' in window;
  });
  const pathname = usePathname();
  const isMessagesRoute = pathname?.includes('/dashboard/messages');

  // Use fallback polling for devices without push notification support (like iOS)
  useNotificationFallback(!isPushSupported);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      dir={direction}
    >
      {/* Clean professional background with subtle center gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),rgba(139,92,246,0.03),transparent_70%)]" />
      </div>

      {/* Initialize Push Notifications (only on supported devices) */}
      {isPushSupported && <PushNotificationInit />}
      
      {/* Mobile Overlay with smooth fade */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
          role="button"
          aria-label="Close menu"
        />
      )}

      <DashboardSidebar
        dictionary={dictionary}
        accessibleResources={accessibleResources}
        locale={locale}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden min-h-0 w-full">
        <DashboardHeader
          dictionary={dictionary}
          user={user}
          onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {isMessagesRoute ? (
          <main className="flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.45, type: 'spring', stiffness: 260, damping: 24 }}
                className="h-full min-h-0"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        ) : (
          <OverlayScrollbarsComponent
            element="main"
            className="flex-1 min-h-0"
            options={{
              scrollbars: {
                autoHide: 'move',
                autoHideDelay: 800,
                theme: 'os-theme-dark',
                visibility: 'auto'
              },
              overflow: {
                x: 'hidden',
                y: 'scroll'
              }
            }}
            defer
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.45, type: 'spring', stiffness: 260, damping: 24 }}
                className="min-h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </OverlayScrollbarsComponent>
        )}
      </div>
    </div>
  );
}
