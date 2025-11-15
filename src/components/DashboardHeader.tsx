'use client';

import { LogOut, User, Menu, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
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
import { useState } from 'react';

export interface DashboardHeaderProps {
  dictionary: Dictionary;
  user: {
    fullName?: string;
    email: string;
  };
  onMobileMenuToggle?: () => void;
}

export function DashboardHeader({ dictionary, user, onMobileMenuToggle }: DashboardHeaderProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-xl dark:bg-gray-900/90 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMobileMenuToggle}
            className="lg:hidden h-10 w-10 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-purple-600" />
            ) : (
              <Menu className="h-5 w-5 text-purple-600" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Page Title - Hidden on mobile */}
          <h1 className="hidden sm:block text-xl font-bold" style={{
            background: 'linear-gradient(to right, #F2574C, #30B2D2, #E8A12D)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {dictionary.dashboard.title}
          </h1>

          {/* Logo for mobile */}
          <div className="sm:hidden h-8 w-8 rounded-lg bg-[#F2574C] flex items-center justify-center text-white font-bold text-sm">
            DNA
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                  {user.fullName?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-semibold">
                    {user.fullName || dictionary.common.welcome}
                  </span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{dictionary.common.logout}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
