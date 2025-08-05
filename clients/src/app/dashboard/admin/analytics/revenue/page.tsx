'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { downloadPDF, PDFGenerator } from '@/utils/pdfGenerator';
import { adminApi, RevenueAnalytics } from '@/lib/adminApi';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { TrendingUpIcon } from 'lucide-react';

interface FilterOptions {
  timeRange: 'day' | 'week' | 'month' | 'year';
  paymentMethod?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  route?: string;
  page?: number;
  limit?: number;
}

export default function RevenueAnalyticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { successToast, errorToast } = useSweetAlert();
  
  // State
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<RevenueAnalytics | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [pendingURLUpdate, setPendingURLUpdate] = useState<FilterOptions | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    timeRange: 'month',
    page: 1,
    limit: 10
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle pending URL updates
  useEffect(() => {
    if (pendingURLUpdate && isClient) {
      const params = new URLSearchParams();
      Object.entries(pendingURLUpdate).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const query = params.toString() ? `?${params.toString()}` : '';
      router.push(`${pathname}${query}`, { scroll: false });
      setPendingURLUpdate(null);
    }
  }, [pendingURLUpdate, router, pathname, isClient]);

  // Sync local state with URL params
  useEffect(() => {
    if (!isClient) return;
    
    const timeRange = (searchParams.get('timeRange') as 'day' | 'week' | 'month' | 'year') || 'month';
    const paymentMethod = searchParams.get('paymentMethod') || undefined;
    const status = searchParams.get('status') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const minAmount = searchParams.get('minAmount') || undefined;
    const maxAmount = searchParams.get('maxAmount') || undefined;
    const route = searchParams.get('route') || undefined;

    setFilters({
      timeRange,
      paymentMethod,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      route
    });
  }, [searchParams, isClient]);

  // Fetch analytics when filters change
  useEffect(() => {
    if (!isClient) return;
    fetchRevenueAnalytics();
  }, [filters, isClient]);

  const updateURL = useCallback((newFilters: FilterOptions) => {
    setPendingURLUpdate(newFilters);
  }, []);

  const fetchRevenueAnalytics = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching revenue analytics with filters:', filters);
      
      // Call the API with filters
      const data = await adminApi.getRevenueAnalytics(filters);
      
      // Map the API response to include icons for payment methods
      const revenueByMethodWithIcons = data.revenueByMethod.map((method: { method: string; revenue: number; percentage: number }) => {
        let icon;
        switch (method.method) {
          case 'CASH':
            icon = BanknotesIcon;
            break;
          case 'CARD':
            icon = CreditCardIcon;
            break;
          case 'MOBILE_MONEY':
            icon = DevicePhoneMobileIcon;
            break;
          default:
            icon = CreditCardIcon;
        }
        return { ...method, icon };
      });

      const analyticsDataWithIcons = {
        ...data,
        revenueByMethod: revenueByMethodWithIcons
      };

      setAnalyticsData(analyticsDataWithIcons);
    } catch (error: unknown) {
      console.error('Error fetching revenue analytics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errorToast(`Failed to fetch revenue analytics: ${errorMessage}`);
      
      // Provide fallback data when API fails
      const fallbackData: RevenueAnalytics = {
        totalRevenue: 45600,
        todayRevenue: 1250,
        monthlyRevenue: 15600,
        yearlyRevenue: 175000,
        revenueGrowth: 15.8,
        averageOrderValue: 85.50,
        revenueByMethod: [
          { method: 'CASH', revenue: 22800, percentage: 50, icon: BanknotesIcon },
          { method: 'CARD', revenue: 18240, percentage: 40, icon: CreditCardIcon },
          { method: 'MOBILE_MONEY', revenue: 4560, percentage: 10, icon: DevicePhoneMobileIcon }
        ],
        revenueByMonth: [
          { month: 'Jan', revenue: 12500, growth: 0 },
          { month: 'Feb', revenue: 13800, growth: 15.6 },
          { month: 'Mar', revenue: 14200, growth: -7.7 },
          { month: 'Apr', revenue: 15600, growth: 20.8 },
          { month: 'May', revenue: 16800, growth: 6.9 },
          { month: 'Jun', revenue: 17500, growth: 4.8 }
        ],
        revenueByDay: [
          { day: 'Sun', revenue: 5200, bookings: 65 },
          { day: 'Mon', revenue: 6800, bookings: 85 },
          { day: 'Tue', revenue: 7200, bookings: 90 },
          { day: 'Wed', revenue: 7800, bookings: 98 },
          { day: 'Thu', revenue: 8200, bookings: 102 },
          { day: 'Fri', revenue: 8800, bookings: 110 },
          { day: 'Sat', revenue: 5600, bookings: 70 }
        ],
        topRevenueRoutes: [
          { route: 'Downtown to Airport', revenue: 12480, bookings: 156, avgFare: 80 },
          { route: 'Airport to Downtown', revenue: 11360, bookings: 142, avgFare: 80 },
          { route: 'City Center to Suburbs', revenue: 8820, bookings: 98, avgFare: 90 },
          { route: 'Suburbs to City Center', revenue: 7650, bookings: 85, avgFare: 90 },
          { route: 'Port to Warehouse', revenue: 6480, bookings: 72, avgFare: 90 }
        ],
        revenueByStatus: [
          { status: 'COMPLETED', revenue: 41040, percentage: 90, color: 'bg-green-500' },
          { status: 'PENDING', revenue: 2280, percentage: 5, color: 'bg-yellow-500' },
          { status: 'CANCELLED', revenue: 2280, percentage: 5, color: 'bg-red-500' }
        ],
        paymentMethodDistribution: [
          { method: 'CASH', count: 267, revenue: 22800, percentage: 50 },
          { method: 'CARD', count: 213, revenue: 18240, percentage: 40 },
          { method: 'MOBILE_MONEY', count: 53, revenue: 4560, percentage: 10 }
        ],
        revenueTrends: [
          { date: '2024-01-01', revenue: 1250, bookings: 15, avgFare: 83.33 },
          { date: '2024-01-02', revenue: 1400, bookings: 17, avgFare: 82.35 },
          { date: '2024-01-03', revenue: 980, bookings: 12, avgFare: 81.67 },
          { date: '2024-01-04', revenue: 1650, bookings: 20, avgFare: 82.50 },
          { date: '2024-01-05', revenue: 1320, bookings: 16, avgFare: 82.50 },
          { date: '2024-01-06', revenue: 1480, bookings: 18, avgFare: 82.22 },
          { date: '2024-01-07', revenue: 1150, bookings: 14, avgFare: 82.14 }
        ]
      };
      
      setAnalyticsData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback((key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'page' || key === 'limit') {
      newFilters.page = 1; // Reset to first page when changing filters
    }
    setFilters(newFilters);
    updateURL(newFilters);
  }, [filters, updateURL]);

  const handlePageChange = useCallback((page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    setCurrentPage(page);
    updateURL(newFilters);
  }, [filters, updateURL]);

  const handleItemsPerPageChange = useCallback((limit: number) => {
    const newFilters = { ...filters, limit, page: 1 };
    setFilters(newFilters);
    setItemsPerPage(limit);
    setCurrentPage(1);
    updateURL(newFilters);
  }, [filters, updateURL]);

  const handleGenerateReport = useCallback(async () => {
    try {
      setGeneratingReport(true);
      
      // Create PDF report data
      const reportData = {
        title: 'Revenue Analytics Report',
        subtitle: 'Comprehensive revenue insights and trends',
        generatedAt: new Date().toISOString(),
        filters: filters as unknown as Record<string, unknown>,
        sections: [
          PDFGenerator.createMetricsSection('Overview', {
            'Total Revenue': `$${analyticsData?.totalRevenue || 0}`,
            'Today\'s Revenue': `$${analyticsData?.todayRevenue || 0}`,
            'Monthly Revenue': `$${analyticsData?.monthlyRevenue || 0}`,
            'Yearly Revenue': `$${analyticsData?.yearlyRevenue || 0}`,
            'Revenue Growth': `${analyticsData?.revenueGrowth || 0}%`,
            'Average Order Value': `$${analyticsData?.averageOrderValue || 0}`
          }),
          PDFGenerator.createTableSection('Revenue by Payment Method', 
            (analyticsData?.revenueByMethod || []).map((method: { method: string; revenue: number; percentage: number }) => ({
              'Method': method.method,
              'Revenue': `$${method.revenue}`,
              'Percentage': `${method.percentage}%`
            }))
          ),
          PDFGenerator.createTableSection('Revenue by Month', 
            (analyticsData?.revenueByMonth || []).map((month: { month: string; revenue: number; growth: number }) => ({
              'Month': month.month,
              'Revenue': `$${month.revenue}`,
              'Growth': `${month.growth}%`
            }))
          ),
          PDFGenerator.createTableSection('Revenue by Day of Week', 
            (analyticsData?.revenueByDay || []).map((day: { day: string; revenue: number; bookings: number }) => ({
              'Day': day.day,
              'Revenue': `$${day.revenue}`,
              'Bookings': day.bookings
            }))
          ),
          PDFGenerator.createTableSection('Top Revenue Routes', 
            (analyticsData?.topRevenueRoutes || []).map((route: { route: string; revenue: number; bookings: number; avgFare: number }, index: number) => ({
              'Rank': index + 1,
              'Route': route.route,
              'Revenue': `$${route.revenue}`,
              'Bookings': route.bookings,
              'Avg Fare': `$${route.avgFare}`
            }))
          ),
          PDFGenerator.createTableSection('Revenue by Status', 
            (analyticsData?.revenueByStatus || []).map((status: { status: string; revenue: number; percentage: number }) => ({
              'Status': status.status,
              'Revenue': `$${status.revenue}`,
              'Percentage': `${status.percentage}%`
            }))
          ),
          PDFGenerator.createTableSection('Payment Method Distribution', 
            (analyticsData?.paymentMethodDistribution || []).map((method: { method: string; count: number; revenue: number; percentage: number }) => ({
              'Method': method.method,
              'Transactions': method.count,
              'Revenue': `$${method.revenue}`,
              'Percentage': `${method.percentage}%`
            }))
          )
        ]
      };

      // Generate and download PDF
      await downloadPDF(reportData, 'revenue-analytics-report');
      
      successToast('PDF report generated and downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      errorToast('Failed to generate PDF report');
    } finally {
      setGeneratingReport(false);
    }
  }, [filters, analyticsData, successToast, errorToast]);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'CASH': return 'text-green-600 bg-green-100';
      case 'CARD': return 'text-blue-600 bg-blue-100';
      case 'MOBILE_MONEY': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate paginated revenue trends data
  const paginatedRevenueTrends = useMemo(() => {
    if (!analyticsData) return { trends: [], totalPages: 0 };
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const trends = analyticsData.revenueTrends?.slice(startIndex, endIndex) || [];
    const totalPages = Math.ceil((analyticsData.revenueTrends?.length || 0) / itemsPerPage);
    
    return { trends, totalPages };
  }, [analyticsData, currentPage, itemsPerPage]);



  // Don't render until client is ready to prevent hydration issues
  if (!isClient) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="Revenue Analytics" subtitle="Comprehensive revenue insights">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="Revenue Analytics" subtitle="Comprehensive revenue insights">
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
        <DashboardLayout title="Revenue Analytics" subtitle="Comprehensive revenue insights">
          <div className="text-center py-12">
            <p className="text-gray-500">No revenue analytics data available</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="Revenue Analytics" subtitle="Comprehensive revenue insights">
        <div className="space-y-6">
          {/* Header with Report Generation */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
              <p className="text-sm text-gray-500 mt-2">Comprehensive revenue insights and trends</p>
            </div>
            <Button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              <span>{generatingReport ? 'Generating...' : 'Generate Report'}</span>
            </Button>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                <select
                  value={filters.timeRange}
                  onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="day">Last 24 Hours</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={filters.paymentMethod || ''}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Methods</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  min="0"
                  value={filters.minAmount || ''}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxAmount || ''}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  placeholder="∞"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${analyticsData?.totalRevenue?.toLocaleString() || '0'}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{analyticsData?.revenueGrowth || 0}% growth</span>
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
                  <p className="text-2xl font-bold text-gray-900">${analyticsData?.todayRevenue || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-900">${analyticsData?.monthlyRevenue?.toLocaleString() || '0'}</p>
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
                  <p className="text-2xl font-bold text-gray-900">${analyticsData?.averageOrderValue || 0}</p>
                  <p className="text-sm text-gray-500">Per booking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue by Payment Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(analyticsData?.revenueByMethod || []).map((method, index) => {
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
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Revenue Trends (Last 7 Days)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Fare</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(paginatedRevenueTrends.trends || []).map((trend, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">${trend.revenue}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.bookings}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${trend.avgFare}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {paginatedRevenueTrends.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={paginatedRevenueTrends.totalPages}
                    totalItems={analyticsData.revenueTrends?.length || 0}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              )}
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
              <div className="space-y-3">
                {(analyticsData?.revenueByMonth || []).map((month, index) => (
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
                {(analyticsData?.revenueByDay || []).map((day, index) => (
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
                {(analyticsData?.topRevenueRoutes || []).map((route, index) => (
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
                {(analyticsData?.revenueByStatus || []).map((status, index) => (
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
                {(analyticsData?.paymentMethodDistribution || []).map((method, index) => (
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