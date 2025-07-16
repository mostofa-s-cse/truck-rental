import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/about', '/contact', '/search'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  
  // Dashboard routes that require authentication
  const dashboardRoutes = ['/dashboard'];
  const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route));
  
  // If accessing dashboard without token, redirect to login
  if (isDashboardRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If accessing login/register with token, redirect to appropriate dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    // For now, redirect to main dashboard which will handle role-based routing
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Role-based route protection
  if (isDashboardRoute && token) {
    try {
      // Decode JWT token to get user role
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const userRole = payload.role;
      
      // Admin routes
      if (pathname.startsWith('/dashboard/admin') && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // Driver routes
      if (pathname.startsWith('/dashboard/driver') && userRole !== 'DRIVER') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // User routes
      if (pathname.startsWith('/dashboard/user') && userRole !== 'USER') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
    } catch (error) {
      // If token is invalid, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 