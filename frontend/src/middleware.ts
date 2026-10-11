import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Get the path the user is trying to visit (e.g., /admin, /vendor, etc.)
  const path = request.nextUrl.pathname;
  
  // 2. Get the access token from the cookies
  // Backend sets an httpOnly cookie called 'accessToken'
  const token = request.cookies.get('accessToken')?.value;
  
  // 3. Check what kind of route this is
  const isVendorRoute = path.startsWith('/vendor');
  const isAdminRoute = path.startsWith('/admin');
  const isManagerRoute = path.startsWith('/manager');
  const isHomeRoute = path.startsWith('/home');
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');

  let userRole = null;

  // 4. Decode the JWT token to get the user's role
  // Note: We use atob to decode the payload in Edge runtime (UI check only, API is still secure)
  if (token && token !== 'loggedout') {
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const decodedPayload = JSON.parse(atob(payloadBase64));
        userRole = decodedPayload.role; // e.g., 'ADMIN', 'VENDOR', 'CLIENT'
      }
    } catch (e) {
      console.error("Error decoding token in middleware", e);
    }
  }

  // 5. The Routing Logic (RBAC - Role Based Access Control)
  if (!userRole) {
    // If user is NOT logged in and tries to access a protected admin/vendor/manager route, send to login
    if (isVendorRoute || isAdminRoute || isManagerRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    // If user IS logged in and tries to access login/register, send them to home
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // If a logged-in non-client reaches /home, redirect them to their dashboard
    if (isHomeRoute && userRole !== 'client') {
      if (userRole === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (userRole === 'vendor') return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
      if (userRole === 'manager') return NextResponse.redirect(new URL('/manager', request.url));
    }

    // Role Checks
    // If a non-vendor tries to access vendor pages -> Kick them out
    if (isVendorRoute && userRole !== 'vendor') {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    
    // If a non-admin tries to access admin pages -> Kick them out
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    
    // If a non-manager tries to access manager pages -> Kick them out
    if (isManagerRoute && userRole !== 'manager') {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  // If everything is fine, let the request continue
  return NextResponse.next();
}

// Config to specify which routes this middleware should run on
export const config = {
  matcher: [
    '/vendor/:path*',
    '/admin/:path*',
    '/manager/:path*',
    '/home/:path*',
    '/home',
    '/login',
    '/register',
  ],
}
