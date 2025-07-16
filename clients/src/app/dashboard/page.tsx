'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import DashboardLayout from '@/components/ui/DashboardLayout';
import SecureRouteGuard from '@/components/auth/SecureRouteGuard';
import { getRoleBasedDashboard } from '@/utils/routing';

export default function DashboardPage() {
  const { user, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const dashboardRoute = getRoleBasedDashboard(user);
      router.push(dashboardRoute);
    }
  }, [user, loading, router]);

  return (
    <SecureRouteGuard requireAuth={true}>
      <DashboardLayout title="Dashboard" subtitle="Redirecting to your dashboard...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    </SecureRouteGuard>
  );
}
