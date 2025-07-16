'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import Button from '@/components/ui/Button';
import SecureRouteGuard from '@/components/auth/SecureRouteGuard';
import { Truck, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);
  const { successToast, errorToast } = useSweetAlert();

  // Show error toast when error state changes
  useEffect(() => {
    if (error && !isSubmitting) {
      errorToast(error);
      dispatch(clearError());
    }
  }, [error, isSubmitting, errorToast, dispatch]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      // Prevent accidental reloads
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    console.log('Form submitted'); // Debug log
    
    if (!email.trim() || !password.trim()) {
      console.log('Validation failed'); // Debug log
      errorToast('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    dispatch(clearError());
    console.log('Starting login process'); // Debug log

    try {
      const result = await dispatch(loginUser({ email: email.trim(), password }));
      console.log('Login dispatch result:', result); // Debug log
      
      if (loginUser.fulfilled.match(result)) {
        console.log('Login successful'); // Debug log
        successToast('Login successful!');
        
        // Redirect to user's dashboard based on role
        const user = result.payload.user;
        let dashboardPath = '/dashboard';
        if (user.role === 'ADMIN') {
          dashboardPath = '/dashboard/admin';
        } else if (user.role === 'DRIVER') {
          dashboardPath = '/dashboard/driver';
        } else if (user.role === 'USER') {
          dashboardPath = '/dashboard/user';
        }
        router.push(dashboardPath);
      } else {
        console.log('Login failed'); // Debug log
        const errorMessage = result.payload as string || 'Login failed. Please check your credentials.';
        errorToast(errorMessage);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      console.log('Showing error toast:', errorMessage); // Debug log
      errorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log('Login process completed'); // Debug log
    }
  };

  return (
    <SecureRouteGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                create a new account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isSubmitting || loading}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting || loading}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  disabled={isSubmitting || loading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:cursor-not-allowed"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting || loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-2 font-medium">Demo Credentials:</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Admin:</strong> admin@truckbook.com / password123</p>
                <p><strong>Driver:</strong> driver1@truckbook.com / password123</p>
                <p><strong>User:</strong> user1@example.com / password123</p>
              </div>
              
              {/* Test Toast Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2 font-medium">Test Toasts:</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => successToast('Success toast test!')}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Success
                  </button>
                  <button
                    type="button"
                    onClick={() => errorToast('Error toast test!')}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Error
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SecureRouteGuard>
  );
} 