'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading, isInitialized } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !loading && user) {
      // User is already logged in, redirect to appropriate dashboard
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
    }
  }, [user, loading, router, isInitialized]);

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

  // If user is authenticated, don't render children (will redirect)
  if (user) {
    return null;
  }

  // User is not authenticated, show the public page
  return <>{children}</>;
} 