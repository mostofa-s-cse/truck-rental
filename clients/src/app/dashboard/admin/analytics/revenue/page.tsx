'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { TrendingUpIcon } from 'lucide-react';

interface RevenueAnalytics {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: number;
  averageOrderValue: number;
  revenueByMethod: {
    method: string;
    revenue: number;
    percentage: number;
    icon: React.ElementType;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
    growth: number;
  }[];
  revenueByDay: {
    day: string;
    revenue: number;
    bookings: number;
  }[];
  topRevenueRoutes: {
    route: string;
    revenue: number;
    bookings: number;
    avgFare: number;
  }[];
  revenueByStatus: {
    status: string;
    revenue: number;
    percentage: number;
    color: string;
  }[];
  paymentMethodDistribution: {
    method: string;
    count: number;
    revenue: number;
    percentage: number;
  }[];
  revenueTrends: {
    date: string;
    revenue: number;
    bookings: number;
    avgFare: number;
  }[];
}


export default function RevenueAnalyticsPage() {
  const { successToast, errorToast, withConfirmation } = useSweetAlert();
  
  // State
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<RevenueAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchRevenueAnalytics();
  }, [timeRange]);

  const fetchRevenueAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock data for revenue analytics (replace with real API calls)
      const mockData: RevenueAnalytics = {
        totalRevenue: 456000,
        todayRevenue: 1250,
        monthlyRevenue: 45600,
        yearlyRevenue: 456000,
        revenueGrowth: 15.8,
        averageOrderValue: 85.50,
        revenueByMethod: [
          { method: 'CASH', revenue: 182400, percentage: 40, icon: BanknotesIcon },
          { method: 'CARD', revenue: 136800, percentage: 30, icon: CreditCardIcon },
          { method: 'MOBILE_MONEY', revenue: 136800, percentage: 30, icon: DevicePhoneMobileIcon }
        ],
        revenueByMonth: [
          { month: 'Jan', revenue: 12500, growth: 0 },
          { month: 'Feb', revenue: 13800, growth: 10.4 },
          { month: 'Mar', revenue: 14200, growth: 2.9 },
          { month: 'Apr', revenue: 15600, growth: 9.9 },
          { month: 'May', revenue: 16800, growth: 7.7 },
          { month: 'Jun', revenue: 17500, growth: 4.2 },
          { month: 'Jul', revenue: 18200, growth: 4.0 },
          { month: 'Aug', revenue: 19500, growth: 7.1 },
          { month: 'Sep', revenue: 20800, growth: 6.7 },
          { month: 'Oct', revenue: 22500, growth: 8.2 },
          { month: 'Nov', revenue: 23800, growth: 5.8 },
          { month: 'Dec', revenue: 25200, growth: 5.9 }
        ],
        revenueByDay: [
          { day: 'Monday', revenue: 8500, bookings: 98 },
          { day: 'Tuesday', revenue: 9200, bookings: 105 },
          { day: 'Wednesday', revenue: 8800, bookings: 102 },
          { day: 'Thursday', revenue: 9500, bookings: 108 },
          { day: 'Friday', revenue: 10200, bookings: 115 },
          { day: 'Saturday', revenue: 9800, bookings: 112 },
          { day: 'Sunday', revenue: 7600, bookings: 89 }
        ],
        topRevenueRoutes: [
          { route: 'Downtown → Airport', revenue: 12480, bookings: 156, avgFare: 80 },
          { route: 'Airport → Downtown', revenue: 11360, bookings: 142, avgFare: 80 },
          { route: 'City Center → Suburbs', revenue: 8820, bookings: 98, avgFare: 90 },
          { route: 'Suburbs → City Center', revenue: 7650, bookings: 85, avgFare: 90 },
          { route: 'Port → Warehouse', revenue: 6480, bookings: 72, avgFare: 90 }
        ],
        revenueByStatus: [
          { status: 'COMPLETED', revenue: 357600, percentage: 78.4, color: 'bg-green-500' },
          { status: 'PENDING', revenue: 16400, percentage: 3.6, color: 'bg-yellow-500' },
          { status: 'CONFIRMED', revenue: 65600, percentage: 14.4, color: 'bg-blue-500' },
          { status: 'IN_PROGRESS', revenue: 7300, percentage: 1.6, color: 'bg-purple-500' }
        ],
        paymentMethodDistribution: [
          { method: 'Cash', count: 1824, revenue: 182400, percentage: 40 },
          { method: 'Card', count: 1368, revenue: 136800, percentage: 30 },
          { method: 'Mobile Money', count: 1368, revenue: 136800, percentage: 30 }
        ],
        revenueTrends: [
          { date: '2024-01-01', revenue: 1250, bookings: 45, avgFare: 27.8 },
          { date: '2024-01-02', revenue: 1400, bookings: 52, avgFare: 26.9 },
          { date: '2024-01-03', revenue: 980, bookings: 38, avgFare: 25.8 },
          { date: '2024-01-04', revenue: 1650, bookings: 61, avgFare: 27.0 },
          { date: '2024-01-05', revenue: 1320, bookings: 48, avgFare: 27.5 },
          { date: '2024-01-06', revenue: 1480, bookings: 55, avgFare: 26.9 },
          { date: '2024-01-07', revenue: 1150, bookings: 42, avgFare: 27.4 }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      errorToast('Failed to fetch revenue analytics');
    } finally {
      setLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'CASH': return 'text-green-600';
      case 'CARD': return 'text-blue-600';
      case 'MOBILE_MONEY': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="Revenue Analytics" subtitle="Comprehensive financial insights">
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
        <DashboardLayout title="Revenue Analytics" subtitle="Comprehensive financial insights">
          <div className="text-center py-12">
            <p className="text-gray-500">No revenue analytics data available</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="Revenue Analytics" subtitle="Comprehensive financial insights">
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

          {/* Key Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${analyticsData.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{analyticsData.revenueGrowth}% growth</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today&apos;s Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${analyticsData.todayRevenue}</p>
                  <p className="text-sm text-gray-500">Daily average</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${analyticsData.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">This month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CreditCardIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">${analyticsData.averageOrderValue}</p>
                  <p className="text-sm text-gray-500">Per booking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue by Payment Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analyticsData.revenueByMethod.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Icon className={`h-8 w-8 mr-3 ${getMethodColor(method.method)}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{method.method.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-600">{method.percentage}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${method.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Trends and Monthly Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends (Last 7 Days)</h3>
              <div className="space-y-3">
                {analyticsData.revenueTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{trend.date}</span>
                      <span className="text-sm font-medium text-gray-900">${trend.revenue}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{trend.bookings} bookings</span>
                      <span className="text-sm text-green-600">Avg: ${trend.avgFare}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
              <div className="space-y-3">
                {analyticsData.revenueByMonth.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{month.month}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900">${month.revenue.toLocaleString()}</span>
                      <span className={`text-sm ${month.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {month.growth >= 0 ? '+' : ''}{month.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue by Day and Top Revenue Routes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Day */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Day of Week</h3>
              <div className="space-y-3">
                {analyticsData.revenueByDay.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{day.day}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900">${day.revenue.toLocaleString()}</span>
                      <span className="text-sm text-gray-600">{day.bookings} bookings</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Revenue Routes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Revenue Routes</h3>
              <div className="space-y-4">
                {analyticsData.topRevenueRoutes.map((route, index) => (
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
                      <p className="text-sm font-medium text-gray-900">${route.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Avg: ${route.avgFare}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue by Status and Payment Method Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Booking Status</h3>
              <div className="space-y-4">
                {analyticsData.revenueByStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{status.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${status.color}`}
                          style={{ width: `${status.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">${status.revenue.toLocaleString()} ({status.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method Distribution</h3>
              <div className="space-y-4">
                {analyticsData.paymentMethodDistribution.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{method.method}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{method.count} transactions</span>
                      <span className="text-sm font-medium text-gray-900">${method.revenue.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">({method.percentage}%)</span>
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