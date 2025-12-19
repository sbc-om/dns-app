'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  CalendarClock,
  MessageSquare,
  User,
  BookOpen,
  Users,
  Settings,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  locale: string;
  accessibleResources: string[];
}

interface NavItem {
  key: string;
  resourceKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>,
  label: string;
}

// Define all possible nav items matching DashboardSidebar
const allNavItems: NavItem[] = [
  {
    key: 'dashboard',
    resourceKey: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard'
  },
  {
    key: 'appointments',
    resourceKey: 'dashboard.appointments',
    href: '/dashboard/appointments',
    icon: CalendarClock,
    label: 'Schedule'
  },
  {
    key: 'users',
    resourceKey: 'dashboard.users',
    href: '/dashboard/users',
    icon: Users,
    label: 'Users'
  },
  {
    key: 'courses',
    resourceKey: 'dashboard.courses',
    href: '/dashboard/courses',
    icon: BookOpen,
    label: 'Courses'
  },
  {
    key: 'payments',
    resourceKey: 'dashboard.payments',
    href: '/dashboard/payments',
    icon: DollarSign,
    label: 'Payments'
  },
  {
    key: 'messages',
    resourceKey: 'dashboard.messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
    label: 'Messages'
  },
  {
    key: 'settings',
    resourceKey: 'dashboard.settings',
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Settings'
  },
  {
    key: 'profile',
    resourceKey: 'dashboard.profile',
    href: '/dashboard/profile',
    icon: User,
    label: 'Profile'
  }
];

export function MobileBottomNav({ locale, accessibleResources }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Filter items based on accessible resources (same logic as DashboardSidebar)
  const filteredItems = allNavItems
    .filter(item => 
      item.resourceKey === 'dashboard' || 
      item.resourceKey === 'dashboard.profile' ||
      accessibleResources.includes(item.resourceKey)
    )
    .slice(0, 5); // Limit to 5 items for mobile bottom nav

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#1a1a1a] border-t-2 border-[#DDDDDD] dark:border-[#000000] safe-bottom"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-screen-sm mx-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const href = `/${locale}${item.href}`;
          const isActive = 
            item.key === 'home'
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200 touch-manipulation min-w-16 group",
                "active:scale-95 active:bg-gray-100 dark:active:bg-gray-800",
                isActive 
                  ? "text-[#262626] dark:text-white" 
                  : "text-gray-600 dark:text-gray-400 hover:text-[#262626] dark:hover:text-white"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={cn(
                "relative transition-transform duration-200",
                isActive && "scale-110"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-colors duration-200"
                )} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#262626] dark:bg-white" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors duration-200 line-clamp-1",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
