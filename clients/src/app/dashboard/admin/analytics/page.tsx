'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { adminApi, BookingAnalytics, DriverAnalytics } from '@/lib/adminApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import {  
  TruckIcon,
  CalendarIcon,
  StarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  bookingAnalytics: BookingAnalytics;
  driverAnalytics: DriverAnalytics;
  revenueData: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  topDrivers: Array<{
    name: string;
    rating: number;
    trips: number;
    earnings: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const { errorToast } = useSweetAlert();
  
  // State
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching analytics data...');
      
      // Fetch analytics data from server APIs with individual error handling
      let bookingAnalytics, driverAnalytics;
      
      try {
        console.log('Fetching booking analytics...');
        bookingAnalytics = await adminApi.getBookingAnalytics(timeRange);
        console.log('Booking analytics response:', bookingAnalytics);
      } catch (error: unknown) {
        console.error('Error fetching booking analytics:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errorToast(`Failed to fetch booking analytics: ${errorMessage}`);
        return;
      }
      
      try {
        console.log('Fetching driver analytics...');
        driverAnalytics = await adminApi.getDriverAnalytics();
        console.log('Driver analytics response:', driverAnalytics);
      } catch (error: unknown) {
        console.error('Error fetching driver analytics:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errorToast(`Failed to fetch driver analytics: ${errorMessage}`);
        return;
      }
      
      // Transform data for charts
      const revenueData = (bookingAnalytics.dailyStats || []).map(stat => ({
        month: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: stat.revenue,
        bookings: stat.count
      }));

      const topDrivers = (driverAnalytics.driverStats || [])
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5)
        .map(driver => ({
          name: driver.name,
          rating: driver.averageRating,
          trips: driver.totalBookings,
          earnings: driver.totalRevenue
        }));

      const data: AnalyticsData = {
        bookingAnalytics: {
          totalBookings: bookingAnalytics.totalBookings || 0,
          statusCounts: bookingAnalytics.statusCounts || {},
          revenue: bookingAnalytics.revenue || 0,
          dailyStats: bookingAnalytics.dailyStats || []
        },
        driverAnalytics: {
          totalDrivers: driverAnalytics.totalDrivers || 0,
          verifiedDrivers: driverAnalytics.verifiedDrivers || 0,
          activeDrivers: driverAnalytics.activeDrivers || 0,
          averageRating: driverAnalytics.averageRating || 0,
          totalRevenue: driverAnalytics.totalRevenue || 0,
          driverStats: driverAnalytics.driverStats || []
        },
        revenueData,
        topDrivers
      };

      console.log('Final analytics data:', data);
      setAnalyticsData(data);
    } catch (error: unknown) {
      console.error('Error in fetchAnalyticsData:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errorToast(`Failed to fetch analytics data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="Analytics Dashboard" subtitle="Comprehensive system analytics">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!analyticsData) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="Analytics Dashboard" subtitle="Comprehensive system analytics">
          <div className="text-center py-12">
            <p className="text-gray-500">No analytics data available</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="Analytics Dashboard" subtitle="Comprehensive system analytics">
        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Time Range</h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'day' | 'week' | 'month' | 'year')}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="day">Last 24 Hours</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.bookingAnalytics.totalBookings}</p>
                  <div className="flex items-center mt-1">
                    <svg className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-sm text-green-600">Active period</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.bookingAnalytics.revenue)}</p>
                  <div className="flex items-center mt-1">
                    <svg className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-sm text-green-600">From completed bookings</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.driverAnalytics.activeDrivers}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-600">
                      {analyticsData.driverAnalytics.totalDrivers} total drivers
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <StarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.driverAnalytics.averageRating.toFixed(1)}</p>
                  <div className="flex items-center mt-1">
                    {renderStars(analyticsData.driverAnalytics.averageRating)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Status Distribution</h3>
              <div className="space-y-3">
                {Object.entries(analyticsData.bookingAnalytics.statusCounts || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({analyticsData.bookingAnalytics.totalBookings > 0 ? ((count / analyticsData.bookingAnalytics.totalBookings) * 100).toFixed(1) : '0'}%)
                      </span>
                    </div>
                  </div>
                ))}
                {Object.keys(analyticsData.bookingAnalytics.statusCounts || {}).length === 0 && (
                  <p className="text-sm text-gray-500">No booking data available</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Driver Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Drivers</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.driverAnalytics.totalDrivers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Verified Drivers</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.driverAnalytics.verifiedDrivers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Drivers</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.driverAnalytics.activeDrivers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(analyticsData.driverAnalytics.totalRevenue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {analyticsData.revenueData.map((data, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-900">{data.month}</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(data.revenue)}</p>
                      <p className="text-xs text-gray-500">{data.bookings} bookings</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Drivers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Earning Drivers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trips</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.topDrivers.map((driver, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">{index + 1}</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(driver.rating)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.trips}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(driver.earnings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Driver Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Driver Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(analyticsData.driverAnalytics.driverStats || []).slice(0, 6).map((driver) => (
                <div key={driver.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{driver.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      driver.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {driver.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <span className="text-gray-900">{(driver.averageRating || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Trips:</span>
                      <span className="text-gray-900">{driver.totalBookings || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Earnings:</span>
                      <span className="text-green-600 font-medium">{formatCurrency(driver.totalRevenue || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`text-sm ${driver.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {driver.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {(analyticsData.driverAnalytics.driverStats || []).length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-sm text-gray-500">No driver data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 