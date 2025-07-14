'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete

    if (!user) {
      // User is not authenticated - redirect to login
      router.push('/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // User doesn't have required role - redirect to appropriate dashboard
      const dashboardPath = getDashboardPath(user.role);
      router.push(dashboardPath);
      return;
    }
  }, [user, loading, allowedRoles, router]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated or doesn't have required role, don't render children
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}

function getDashboardPath(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'driver':
      return '/driver';
    case 'user':
      return '/dashboard';
    default:
      return '/dashboard';
  }
} 