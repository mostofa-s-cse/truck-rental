import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/driver', 
  '/dashboard',
  '/profile',
  '/settings'
];

// Define auth routes that should redirect authenticated users
const authRoutes = [
  '/login',
  '/register'
];

// Define role-based route access
const roleBasedRoutes = {
  '/admin': ['ADMIN'],
  '/driver': ['DRIVER'],
  '/dashboard': ['USER', 'ADMIN', 'DRIVER'] // Allow all authenticated users to access dashboard
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('authToken')?.value;
  
  // Get user role from cookies (you might want to decode JWT to get role)
  const userRole = request.cookies.get('userRole')?.value;
  
  // Check if user is authenticated
  const isAuthenticated = !!token;
  
  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // If user is not authenticated and trying to access protected route
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If user is authenticated and trying to access auth routes
  if (isAuthenticated && isAuthRoute) {
    // Redirect to appropriate dashboard based on role
    let dashboardPath = '/dashboard';
    if (userRole === 'ADMIN') {
      dashboardPath = '/admin';
    } else if (userRole === 'DRIVER') {
      dashboardPath = '/driver';
    }
    
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }
  
  // Check role-based access for specific routes
  if (isAuthenticated && userRole) {
    for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(userRole)) {
        // User doesn't have permission for this route
        let redirectPath = '/dashboard';
        if (userRole === 'ADMIN') {
          redirectPath = '/admin';
        } else if (userRole === 'DRIVER') {
          redirectPath = '/driver';
        }
        
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 