'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = false, 
  redirectTo 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete

    if (requireAuth && !user) {
      // User needs to be authenticated but isn't - redirect to login
      router.push('/login');
      return;
    }

    if (!requireAuth && user) {
      // User is authenticated but shouldn't be on this page - redirect to dashboard
      const dashboardPath = redirectTo || getDashboardPath(user.role);
      router.push(dashboardPath);
      return;
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If requireAuth is true and user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null;
  }

  // If requireAuth is false and user is authenticated, don't render children
  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}

function getDashboardPath(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'DRIVER':
      return '/driver';
    case 'USER':
      return '/dashboard';
    default:
      return '/dashboard';
  }
} 