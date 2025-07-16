'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import { User } from '@/types';

interface SecureRouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'DRIVER' | 'USER';
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export default function SecureRouteGuard({ 
  children, 
  requiredRole,
  requireAuth = false,
  fallback 
}: SecureRouteGuardProps) {
  const { user, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
      
      // BLOCK 1: If user is NOT authenticated and trying to access ANY dashboard route
      if (!user && pathname.startsWith('/dashboard')) {
        console.log('🚫 SecureRouteGuard: Unauthenticated user trying to access dashboard:', pathname);
        router.push('/login');
        return;
      }

      // BLOCK 2: If authentication is required but user is not logged in
      if (requireAuth && !user) {
        console.log('🚫 SecureRouteGuard: Auth required but user not logged in:', pathname);
        router.push('/login');
        return;
      }

      // BLOCK 3: If user is logged in but trying to access login/register pages
      if (user && (pathname === '/login' || pathname === '/register')) {
        console.log('🔄 SecureRouteGuard: Authenticated user trying to access auth pages, redirecting to dashboard');
        const dashboardPath = getRoleBasedDashboard(user);
        router.push(dashboardPath);
        return;
      }

      // BLOCK 4: If specific role is required but user doesn't have it
      if (requiredRole && user && user.role !== requiredRole) {
        console.log('🚫 SecureRouteGuard: User role mismatch:', { userRole: user.role, requiredRole, pathname });
        const dashboardPath = getRoleBasedDashboard(user);
        router.push(dashboardPath);
        return;
      }

      // BLOCK 5: Check if user can access the current route
      if (user && !canAccessRoute(user, pathname)) {
        console.log('🚫 SecureRouteGuard: User cannot access route:', { userRole: user.role, pathname });
        const dashboardPath = getRoleBasedDashboard(user);
        router.push(dashboardPath);
        return;
      }
    }
  }, [user, loading, router, pathname, requiredRole, requireAuth]);

  // Show loading state while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show fallback if user is not authenticated and auth is required
  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // Show fallback if user doesn't have required role
  if (requiredRole && user && user.role !== requiredRole) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">
            You need {requiredRole} privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Show fallback if user can't access the route
  if (user && !canAccessRoute(user, pathname)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // User is authenticated and has proper access
  return <>{children}</>;
}

// Helper function to get role-based dashboard path
function getRoleBasedDashboard(user: User): string {
  switch (user.role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'DRIVER':
      return '/dashboard/driver';
    case 'USER':
      return '/dashboard/user';
    default:
      return '/dashboard';
  }
}

// Helper function to check if user can access a route
function canAccessRoute(user: User, route: string): boolean {
  // BLOCK: Any dashboard route requires authentication
  if (route.startsWith('/dashboard')) {
    // Admin routes
    if (route.startsWith('/dashboard/admin')) {
      return user.role === 'ADMIN';
    }
    
    // Driver routes
    if (route.startsWith('/dashboard/driver')) {
      return user.role === 'DRIVER';
    }
    
    // User routes
    if (route.startsWith('/dashboard/user')) {
      return user.role === 'USER';
    }
    
    // General dashboard routes - allow all authenticated users
    return true;
  }
  
  // Public routes - allow all users
  return true;
} 