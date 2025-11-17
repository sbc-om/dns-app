import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, requireAdmin } from '@/lib/auth/auth';
import { Locale } from '@/config/i18n';

/**
 * Server component wrapper that requires authentication
 * Use this to wrap page content that requires a logged-in user
 */
export async function RequireAuth({
  children,
  locale = 'en',
}: {
  children: ReactNode;
  locale?: Locale;
}) {
  await requireAuth(locale);
  return <>{children}</>;
}

/**
 * Server component wrapper that requires admin role
 * Use this to wrap page content that requires admin access
 */
export async function RequireAdmin({
  children,
  locale = 'en',
}: {
  children: ReactNode;
  locale?: Locale;
}) {
  await requireAdmin(locale);
  return <>{children}</>;
}

/**
 * Simple permission wrapper - placeholder for now
 */
export async function RequirePermission({
  children,
  resourceKey,
  action,
  locale = 'en',
}: {
  children: ReactNode;
  resourceKey: string;
  action: string;
  locale?: Locale;
}) {
  // For now, just require auth - extend later for proper permissions
  await requireAuth(locale);
  return <>{children}</>;
}

/**
 * Conditional component that only renders if user has permission
 */
export async function WithPermission({
  children,
  resourceKey,
  action,
  fallback = null,
}: {
  children: ReactNode;
  resourceKey: string;
  action: string;
  fallback?: ReactNode;
}) {
  // For now, always show - extend later for proper permissions
  return <>{children}</>;
}

/**
 * Hook-like function to check permissions (for conditional rendering)
 */
export async function canUserAccess(resourceKey: string, action: string): Promise<boolean> {
  // For now, always return true - extend later for proper permissions
  return true;
}