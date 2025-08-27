import { NextResponse } from 'next/server';
import { isAdminPath } from './src/lib/adminConfig';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname)) {
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, { // <-- This endpoint is called
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      });

      if (!response.ok) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const user = await response.json();
      // Allow admin and writer roles, plus legacy users without roles
      if (user.role !== 'admin' && user.role !== 'writer' && user.role !== null) { 
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      console.error('Middleware auth error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};