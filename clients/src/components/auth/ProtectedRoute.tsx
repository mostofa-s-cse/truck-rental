'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'DRIVER' | 'USER' | ('ADMIN' | 'DRIVER' | 'USER')[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isInitialized } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    console.log('ProtectedRoute: useEffect triggered');
    console.log('ProtectedRoute: loading:', loading);
    console.log('ProtectedRoute: isInitialized:', isInitialized);
    console.log('ProtectedRoute: user:', user);
    console.log('ProtectedRoute: requiredRole:', requiredRole);
    
    if (isInitialized && !loading) {
      if (!user) {
        console.log('ProtectedRoute: No user, redirecting to login');
        // User is not logged in, redirect to login
        router.push('/login');
        return;
      }

      if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const hasRequiredRole = allowedRoles.includes(user.role as 'ADMIN' | 'DRIVER' | 'USER');
        
        if (!hasRequiredRole) {
          console.log('ProtectedRoute: Role mismatch, redirecting to appropriate dashboard');
          // User doesn't have the required role, redirect to appropriate dashboard
          let dashboardPath = '/dashboard/user';
          switch (user.role) {
            case 'ADMIN':
              dashboardPath = '/dashboard/admin';
              break;
            case 'DRIVER':
              dashboardPath = '/dashboard/driver';
              break;
            default:
              dashboardPath = '/dashboard/user';
          }
          router.push(dashboardPath);
          return;
        }
      }
    }
  }, [user, loading, router, requiredRole]);

  // Show loading while checking authentication
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render children
  if (!user) {
    return null;
  }

  // If role is required and user doesn't have it, don't render children
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = allowedRoles.includes(user.role as 'ADMIN' | 'DRIVER' | 'USER');
    if (!hasRequiredRole) {
      return null;
    }
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
} 