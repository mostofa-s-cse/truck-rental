'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  CalendarIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { TrendingUpIcon } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageFare: number;
  bookingTrends: any[];
  statusDistribution: any[];
  topRoutes: any[];
  peakHours: any[];
  monthlyComparison: any[];
}

export default function BookingAnalyticsPage() {
  const { errorToast } = useSweetAlert();
  
  // State
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<BookingAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchBookingAnalytics();
  }, [timeRange]);

  const fetchBookingAnalytics = async () => {
    try {
      setLoading(true);
    
      
      // Mock data for detailed analytics (replace with real API calls)
      const mockData: BookingAnalytics = {
        totalBookings: 1250,
        completedBookings: 980,
        pendingBookings: 45,
        cancelledBookings: 25,
        totalRevenue: 45600,
        averageFare: 85.50,
        bookingTrends: [
          { date: '2024-01-01', bookings: 45, revenue: 1250, completed: 38, cancelled: 2 },
          { date: '2024-01-02', bookings: 52, revenue: 1400, completed: 45, cancelled: 1 },
          { date: '2024-01-03', bookings: 38, revenue: 980, completed: 32, cancelled: 3 },
          { date: '2024-01-04', bookings: 61, revenue: 1650, completed: 55, cancelled: 2 },
          { date: '2024-01-05', bookings: 48, revenue: 1320, completed: 42, cancelled: 1 },
          { date: '2024-01-06', bookings: 55, revenue: 1480, completed: 48, cancelled: 2 },
          { date: '2024-01-07', bookings: 42, revenue: 1150, completed: 38, cancelled: 1 }
        ],
        statusDistribution: [
          { status: 'COMPLETED', count: 980, percentage: 78.4, color: 'bg-green-500' },
          { status: 'PENDING', count: 45, percentage: 3.6, color: 'bg-yellow-500' },
          { status: 'CONFIRMED', count: 180, percentage: 14.4, color: 'bg-blue-500' },
          { status: 'IN_PROGRESS', count: 20, percentage: 1.6, color: 'bg-purple-500' },
          { status: 'CANCELLED', count: 25, percentage: 2.0, color: 'bg-red-500' }
        ],
        topRoutes: [
          { route: 'Downtown → Airport', bookings: 156, revenue: 12480, avgFare: 80 },
          { route: 'Airport → Downtown', bookings: 142, revenue: 11360, avgFare: 80 },
          { route: 'City Center → Suburbs', bookings: 98, revenue: 8820, avgFare: 90 },
          { route: 'Suburbs → City Center', bookings: 85, revenue: 7650, avgFare: 90 },
          { route: 'Port → Warehouse', bookings: 72, revenue: 6480, avgFare: 90 }
        ],
        peakHours: [
          { hour: '08:00', bookings: 45, percentage: 12.5 },
          { hour: '09:00', bookings: 52, percentage: 14.4 },
          { hour: '10:00', bookings: 38, percentage: 10.6 },
          { hour: '11:00', bookings: 61, percentage: 16.9 },
          { hour: '12:00', bookings: 48, percentage: 13.3 },
          { hour: '13:00', bookings: 55, percentage: 15.3 },
          { hour: '14:00', bookings: 42, percentage: 11.7 },
          { hour: '15:00', bookings: 38, percentage: 10.6 },
          { hour: '16:00', bookings: 52, percentage: 14.4 },
          { hour: '17:00', bookings: 45, percentage: 12.5 }
        ],
        monthlyComparison: [
          { month: 'Jan', bookings: 450, revenue: 12500, growth: 0 },
          { month: 'Feb', bookings: 520, revenue: 13800, growth: 15.6 },
          { month: 'Mar', bookings: 480, revenue: 14200, growth: -7.7 },
          { month: 'Apr', bookings: 580, revenue: 15600, growth: 20.8 },
          { month: 'May', bookings: 620, revenue: 16800, growth: 6.9 },
          { month: 'Jun', bookings: 650, revenue: 17500, growth: 4.8 }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching booking analytics:', error);
      errorToast('Failed to fetch booking analytics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return CheckCircleIcon;
      case 'PENDING': return ClockIcon;
      case 'CONFIRMED': return ExclamationTriangleIcon;
      case 'IN_PROGRESS': return TrendingUpIcon;
      case 'CANCELLED': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600';
      case 'PENDING': return 'text-yellow-600';
      case 'CONFIRMED': return 'text-blue-600';
      case 'IN_PROGRESS': return 'text-purple-600';
      case 'CANCELLED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="Booking Analytics" subtitle="Detailed booking performance insights">
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
        <DashboardLayout title="Booking Analytics" subtitle="Detailed booking performance insights">
          <div className="text-center py-12">
            <p className="text-gray-500">No booking analytics data available</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="Booking Analytics" subtitle="Detailed booking performance insights">
        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Time Range</h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
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
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalBookings}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+15% from last period</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.completedBookings}</p>
                  <p className="text-sm text-gray-500">{((analyticsData.completedBookings / analyticsData.totalBookings) * 100).toFixed(1)}% completion rate</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${analyticsData.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Avg: ${analyticsData.averageFare}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.cancelledBookings}</p>
                  <p className="text-sm text-gray-500">{((analyticsData.cancelledBookings / analyticsData.totalBookings) * 100).toFixed(1)}% cancellation rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Trends Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Trends</h3>
            <div className="space-y-3">
              {analyticsData.bookingTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{trend.date}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{trend.bookings} bookings</span>
                      <span className="text-sm text-green-600">${trend.revenue}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600">{trend.completed} completed</span>
                    <span className="text-sm text-red-600">{trend.cancelled} cancelled</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution and Top Routes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Status Distribution</h3>
              <div className="space-y-4">
                {analyticsData.statusDistribution.map((status, index) => {
                  const Icon = getStatusIcon(status.status);
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className={`h-5 w-5 mr-2 ${getStatusColor(status.status)}`} />
                        <span className="text-sm font-medium text-gray-900">{status.status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${status.color}`}
                            style={{ width: `${status.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{status.count} ({status.percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Routes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Routes</h3>
              <div className="space-y-4">
                {analyticsData.topRoutes.map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{route.route}</p>
                        <p className="text-sm text-gray-600">{route.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${route.revenue}</p>
                      <p className="text-sm text-gray-600">Avg: ${route.avgFare}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Hours and Monthly Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Hours */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Peak Booking Hours</h3>
              <div className="space-y-3">
                {analyticsData.peakHours.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{hour.hour}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(hour.bookings / Math.max(...analyticsData.peakHours.map(h => h.bookings))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{hour.bookings} ({hour.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Comparison */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Comparison</h3>
              <div className="space-y-3">
                {analyticsData.monthlyComparison.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{month.month}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900">{month.bookings} bookings</span>
                      <span className="text-sm text-green-600">${month.revenue}</span>
                      <span className={`text-sm ${month.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {month.growth >= 0 ? '+' : ''}{month.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 