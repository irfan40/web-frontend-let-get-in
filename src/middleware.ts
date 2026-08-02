import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = [
  '/demo',
  '/builder',
  '/dashboard',
  '/settings',
  '/account',
  '/profile',
  '/history',
  '/download',
  '/ats',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const hasToken = Boolean(accessToken || refreshToken);

  // If authenticated user tries to access /auth, redirect to /dashboard
  if (pathname.startsWith('/auth')) {
    if (hasToken) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // If unauthenticated user tries to access protected paths, redirect to /auth
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (isProtected && !hasToken) {
    const authUrl = new URL('/auth', request.url);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth',
    '/demo/:path*',
    '/builder/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/account/:path*',
    '/profile/:path*',
    '/history/:path*',
    '/download/:path*',
    '/ats/:path*',
  ],
};
