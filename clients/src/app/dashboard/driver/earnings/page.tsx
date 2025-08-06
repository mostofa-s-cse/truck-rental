'use client';

import { useState, useCallback, useEffect } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { driverApi, Earnings } from '@/lib/dashboardApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  TruckIcon,
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { TrendingUpIcon } from 'lucide-react';

interface EarningsData {
  overview: Earnings;
  dailyEarnings: Array<{
    date: string;
    earnings: number;
    trips: number;
    avgPerTrip: number;
  }>;
  weeklyEarnings: Array<{
    week: string;
    earnings: number;
    trips: number;
    avgPerTrip: number;
  }>;
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
    trips: number;
    avgPerTrip: number;
  }>;
  earningsByStatus: Array<{
    status: string;
    earnings: number;
    trips: number;
    percentage: number;
  }>;
  topEarningDays: Array<{
    day: string;
    earnings: number;
    trips: number;
    avgPerTrip: number;
  }>;
  paymentMethods: Array<{
    method: string;
    earnings: number;
    trips: number;
    percentage: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    method: string;
    date: string;
    status: string;
  }>;
}

export default function DriverEarningsPage() {
  const { errorToast } = useSweetAlert();
  
  // State
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');

  const fetchEarningsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch earnings data from API
      const earnings = await driverApi.getEarnings();
      
      // Mock data for detailed earnings (replace with real API calls)
      const mockData: EarningsData = {
        overview: earnings,
        dailyEarnings: [
          { date: '2024-01-01', earnings: 125, trips: 3, avgPerTrip: 41.7 },
          { date: '2024-01-02', earnings: 180, trips: 4, avgPerTrip: 45.0 },
          { date: '2024-01-03', earnings: 95, trips: 2, avgPerTrip: 47.5 },
          { date: '2024-01-04', earnings: 220, trips: 5, avgPerTrip: 44.0 },
          { date: '2024-01-05', earnings: 165, trips: 4, avgPerTrip: 41.3 },
          { date: '2024-01-06', earnings: 195, trips: 4, avgPerTrip: 48.8 },
          { date: '2024-01-07', earnings: 140, trips: 3, avgPerTrip: 46.7 }
        ],
        weeklyEarnings: [
          { week: 'Week 1', earnings: 1120, trips: 25, avgPerTrip: 44.8 },
          { week: 'Week 2', earnings: 1280, trips: 28, avgPerTrip: 45.7 },
          { week: 'Week 3', earnings: 1350, trips: 30, avgPerTrip: 45.0 },
          { week: 'Week 4', earnings: 1420, trips: 32, avgPerTrip: 44.4 }
        ],
        monthlyEarnings: [
          { month: 'Jan', earnings: 5200, trips: 115, avgPerTrip: 45.2 },
          { month: 'Feb', earnings: 5800, trips: 128, avgPerTrip: 45.3 },
          { month: 'Mar', earnings: 6200, trips: 135, avgPerTrip: 45.9 },
          { month: 'Apr', earnings: 6800, trips: 145, avgPerTrip: 46.9 },
          { month: 'May', earnings: 7200, trips: 152, avgPerTrip: 47.4 },
          { month: 'Jun', earnings: 7800, trips: 160, avgPerTrip: 48.8 }
        ],
        earningsByStatus: [
          { status: 'COMPLETED', earnings: 6800, trips: 145, percentage: 85 },
          { status: 'IN_PROGRESS', earnings: 800, trips: 15, percentage: 10 },
          { status: 'CANCELLED', earnings: 400, trips: 10, percentage: 5 }
        ],
        topEarningDays: [
          { day: 'Friday', earnings: 195, trips: 4, avgPerTrip: 48.8 },
          { day: 'Thursday', earnings: 220, trips: 5, avgPerTrip: 44.0 },
          { day: 'Saturday', earnings: 180, trips: 4, avgPerTrip: 45.0 },
          { day: 'Wednesday', earnings: 165, trips: 4, avgPerTrip: 41.3 },
          { day: 'Tuesday', earnings: 140, trips: 3, avgPerTrip: 46.7 }
        ],
        paymentMethods: [
          { method: 'CASH', earnings: 4000, trips: 85, percentage: 50 },
          { method: 'CARD', earnings: 2400, trips: 50, percentage: 30 },
          { method: 'MOBILE_MONEY', earnings: 1600, trips: 35, percentage: 20 }
        ],
        recentTransactions: [
          { id: 'TXN001', amount: 85, method: 'CASH', date: '2024-01-15', status: 'COMPLETED' },
          { id: 'TXN002', amount: 120, method: 'CARD', date: '2024-01-14', status: 'COMPLETED' },
          { id: 'TXN003', amount: 95, method: 'MOBILE_MONEY', date: '2024-01-13', status: 'COMPLETED' },
          { id: 'TXN004', amount: 110, method: 'CASH', date: '2024-01-12', status: 'COMPLETED' },
          { id: 'TXN005', amount: 75, method: 'CARD', date: '2024-01-11', status: 'COMPLETED' }
        ]
      };
      
      setEarningsData(mockData);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      errorToast('Failed to fetch earnings data');
    } finally {
      setLoading(false);
    }
  }, [errorToast]);

  useEffect(() => {
    fetchEarningsData();
  }, [fetchEarningsData]);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return BanknotesIcon;
      case 'CARD': return CreditCardIcon;
      case 'MOBILE_MONEY': return DevicePhoneMobileIcon;
      default: return CreditCardIcon;
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
      <ProtectedRoute requiredRole="DRIVER">
        <DashboardLayout title="Earnings" subtitle="Track your earnings and financial performance">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!earningsData) {
    return (
      <ProtectedRoute requiredRole="DRIVER">
        <DashboardLayout title="Earnings" subtitle="Track your earnings and financial performance">
          <div className="text-center py-12">
            <p className="text-gray-500">No earnings data available</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="DRIVER">
      <DashboardLayout title="Earnings" subtitle="Track your earnings and financial performance">
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

          {/* Key Earnings Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today&apos;s Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">${earningsData.overview.today?.toFixed(2) || 0}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+15% from yesterday</span>
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
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">${earningsData.overview.thisWeek?.toFixed(2) || 0}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+8% from last week</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">${earningsData.overview.thisMonth?.toFixed(2) || 0}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+12% from last month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Trips</p>
                                  <p className="text-2xl font-bold text-gray-900">150</p>
                <p className="text-sm text-gray-500">Avg: $45.20</p>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Earnings Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Earnings (Last 7 Days)</h3>
            <div className="space-y-3">
              {earningsData.dailyEarnings.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{day.date}</span>
                    <span className="text-sm font-medium text-gray-900">${day.earnings}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{day.trips} trips</span>
                    <span className="text-sm text-green-600">Avg: ${day.avgPerTrip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings by Status and Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings by Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings by Status</h3>
              <div className="space-y-4">
                {earningsData.earningsByStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{status.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${status.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">${status.earnings} ({status.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-4">
                {earningsData.paymentMethods.map((method, index) => {
                  const Icon = getMethodIcon(method.method);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Icon className={`h-5 w-5 mr-2 ${getMethodColor(method.method)}`} />
                        <span className="text-sm font-medium text-gray-900">{method.method.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${method.earnings}</p>
                        <p className="text-sm text-gray-600">{method.trips} trips ({method.percentage}%)</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Earning Days and Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Earning Days */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Earning Days</h3>
              <div className="space-y-4">
                {earningsData.topEarningDays.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{day.day}</p>
                        <p className="text-sm text-gray-600">{day.trips} trips</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${day.earnings}</p>
                      <p className="text-sm text-green-600">Avg: ${day.avgPerTrip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {earningsData.recentTransactions.map((transaction, index) => {
                  const Icon = getMethodIcon(transaction.method);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Icon className={`h-5 w-5 mr-2 ${getMethodColor(transaction.method)}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">#{transaction.id}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${transaction.amount}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Weekly and Monthly Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Earnings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Earnings</h3>
              <div className="space-y-3">
                {earningsData.weeklyEarnings.map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{week.week}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900">${week.earnings}</span>
                      <span className="text-sm text-gray-600">{week.trips} trips</span>
                      <span className="text-sm text-green-600">Avg: ${week.avgPerTrip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Earnings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Earnings</h3>
              <div className="space-y-3">
                {earningsData.monthlyEarnings.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{month.month}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900">${month.earnings}</span>
                      <span className="text-sm text-gray-600">{month.trips} trips</span>
                      <span className="text-sm text-green-600">Avg: ${month.avgPerTrip}</span>
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