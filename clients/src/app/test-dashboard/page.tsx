'use client';

import { useAppSelector } from '@/hooks/redux';
import SecureRouteGuard from '@/components/auth/SecureRouteGuard';

export default function TestDashboardPage() {
  const { user, loading } = useAppSelector((state) => state.auth);

  return (
    <SecureRouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Dashboard Page</h1>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Authentication Status:</p>
              <p className="font-medium">
                {loading ? 'Loading...' : user ? 'Authenticated' : 'Not Authenticated'}
              </p>
            </div>
            {user && (
              <div>
                <p className="text-sm text-gray-600">User Role:</p>
                <p className="font-medium">{user.role}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Current Path:</p>
              <p className="font-medium">/test-dashboard</p>
            </div>
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✅ If you can see this page, you are authenticated and have access to dashboard routes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SecureRouteGuard>
  );
} 