import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
);

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/en',
  '/ar',
  '/en/about',
  '/ar/about',
  '/en/contact',
  '/ar/contact',
  '/en/auth/login',
  '/ar/auth/login',
  '/en/auth/register',
  '/ar/auth/register',
  '/en/auth/forgot-password',
  '/ar/auth/forgot-password',
  '/api/auth/login',
  '/api/auth/logout',
];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some(path => pathname === path || pathname.startsWith('/api/') || pathname.startsWith('/_next/'))) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('auth-token');
  
  console.log('🔐 Proxy checking:', pathname, 'Token:', token ? 'EXISTS' : 'MISSING');

  // Redirect to login if no token
  if (!token) {
    console.log('❌ No token, redirecting to login');
    const locale = pathname.startsWith('/ar') ? 'ar' : 'en';
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify JWT token
    await jwtVerify(token.value, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    const locale = pathname.startsWith('/ar') ? 'ar' : 'en';
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    // Clear invalid token
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
