import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
// const protectedRoutes = [
//   '/dashboard',
// ];

// Define auth routes that should redirect authenticated users
const authRoutes = [
  '/login',
  '/register'
];

// Define public routes that don't require authentication
// const publicRoutes = [
//   '/',
//   '/about',
//   '/contact',
//   '/search'
// ];

// Define role-based route access
const roleBasedRoutes = {
  '/dashboard/admin': ['ADMIN'],
  '/dashboard/driver': ['DRIVER'],
  '/dashboard/user': ['USER'],
  '/dashboard': ['ADMIN', 'DRIVER', 'USER'] // Allow all authenticated users to access general dashboard
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('authToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  
  // Check if user is authenticated
  const isAuthenticated = !!token;
  
  // Check if current path is a dashboard route (any path starting with /dashboard)
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if current path is a role-specific dashboard route
  const isRoleSpecificRoute = pathname.startsWith('/dashboard/admin') || 
                             pathname.startsWith('/dashboard/driver') || 
                             pathname.startsWith('/dashboard/user');
  
  // Debug logging
  console.log('Middleware Debug:', {
    pathname,
    isAuthenticated,
    userRole,
    isDashboardRoute,
    isAuthRoute,
    isRoleSpecificRoute
  });
  
  // BLOCK 1: If user is NOT authenticated and trying to access ANY dashboard route
  if (!isAuthenticated && isDashboardRoute) {
    console.log('🚫 BLOCKED: Unauthenticated user trying to access dashboard route:', pathname);
    console.log('🔒 Dashboard protection active - redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is authenticated and trying to access auth routes (login/register)
  if (isAuthenticated && isAuthRoute) {
    // Redirect to appropriate dashboard based on role
    let dashboardPath = '/dashboard';
    if (userRole === 'ADMIN') {
      dashboardPath = '/dashboard/admin';
    } else if (userRole === 'DRIVER') {
      dashboardPath = '/dashboard/driver';
    } else if (userRole === 'USER') {
      dashboardPath = '/dashboard/user';
    }
    
    console.log('Redirecting authenticated user from auth route to:', dashboardPath);
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }
  
  // Check role-based access for specific routes (only for authenticated users)
  if (isAuthenticated && userRole && isRoleSpecificRoute) {
    for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(userRole)) {
        // User doesn't have permission for this route
        let redirectPath = '/dashboard';
        if (userRole === 'ADMIN') {
          redirectPath = '/dashboard/admin';
        } else if (userRole === 'DRIVER') {
          redirectPath = '/dashboard/driver';
        } else if (userRole === 'USER') {
          redirectPath = '/dashboard/user';
        }
        
        console.log('Redirecting user due to role mismatch:', { userRole, pathname, redirectPath });
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