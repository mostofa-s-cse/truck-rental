'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { userApi, UserStats, Booking } from '@/lib/dashboardApi';
import { 
  CalendarIcon, 
  CurrencyDollarIcon,
  StarIcon,
  TruckIcon,
  ClockIcon,
  PlusIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Component props interface - currently no props needed
type UserDashboardProps = Record<string, never>;

export default function UserDashboard({}: UserDashboardProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching dashboard data...');
        
        const [statsData, bookingsData, driversData] = await Promise.all([
          userApi.getUserStats(),
          userApi.getRecentBookings(),
          userApi.getNearbyDrivers()
        ]);
        
        console.log('Dashboard data received:', { statsData, bookingsData, driversData });
        
        setStats(statsData);
        setRecentBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <ProtectedRoute requiredRole="USER">
      <DashboardLayout title="User Dashboard" subtitle={`Welcome back, ${user?.name}`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Profile Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <UserIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <p className="text-blue-100">{user?.email}</p>
                    <p className="text-blue-100 text-sm">Member since {new Date().getFullYear()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Account Status</p>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-300" />
                    <span className="font-semibold">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">All time bookings</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <CalendarIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-3xl font-bold text-gray-900">${stats?.totalSpent?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-gray-500 mt-1">Total expenditure</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-3xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || '0.0'}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(stats?.averageRating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your average rating</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <StarIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Favorite Drivers</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.favoriteDrivers || 0}</p>
                                         <p className="text-xs text-gray-500 mt-1">Drivers you&apos;ve used</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TruckIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings - Enhanced */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <ClockIcon className="h-6 w-6 text-blue-500 mr-3" />
                    Recent Bookings
                  </h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {recentBookings.length} bookings
                  </span>
                </div>
              </div>
              <div className="p-6">
                {recentBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-500 mb-6">Start your journey by booking your first trip</p>
                    <a
                      href="/search"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Book Your First Trip
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getStatusIcon(booking.status)}
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {booking.source} → {booking.destination}
                              </h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Fare:</span>
                                <span className="font-medium text-gray-900 ml-2">${booking.fare}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Date:</span>
                                <span className="font-medium text-gray-900 ml-2">
                                  {new Date(booking.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Time:</span>
                                <span className="font-medium text-gray-900 ml-2">
                                  {new Date(booking.date).toLocaleTimeString()}
                                </span>
                              </div>
                              <div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                  {booking.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
} 