'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { adminApi, BookingAnalytics, DriverAnalytics } from '@/lib/adminApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import Button from '@/components/ui/Button';
import { downloadPDF, PDFGenerator } from '@/utils/pdfGenerator';
import Pagination from '@/components/ui/Pagination';
import {  
  TruckIcon,
  CalendarIcon,
  StarIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
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

interface FilterOptions {
  timeRange: 'day' | 'week' | 'month' | 'year';
  status?: string;
  driverId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

function AdminAnalyticsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { errorToast, successToast } = useSweetAlert();
  
  // State
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
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
    const status = searchParams.get('status') || undefined;
    const driverId = searchParams.get('driverId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    setFilters({
      timeRange,
      status,
      driverId,
      userId,
      startDate,
      endDate,
      page,
      limit
    });
    setCurrentPage(page);
    setItemsPerPage(limit);
  }, [searchParams, isClient]);

  const updateURL = useCallback((newFilters: FilterOptions) => {
    setPendingURLUpdate(newFilters);
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('Fetching analytics data with filters:', filters);
      
      // Fetch analytics data from server APIs with individual error handling
      let bookingAnalytics, driverAnalytics;
      
      try {
        console.log('Fetching booking analytics...');
        bookingAnalytics = await adminApi.getBookingAnalytics(filters.timeRange);
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
      const revenueData = (bookingAnalytics.bookingTrends || []).map(stat => ({
        month: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: stat.revenue,
        bookings: stat.bookings
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
          completedBookings: bookingAnalytics.completedBookings || 0,
          pendingBookings: bookingAnalytics.pendingBookings || 0,
          cancelledBookings: bookingAnalytics.cancelledBookings || 0,
          totalRevenue: bookingAnalytics.totalRevenue || 0,
          averageFare: bookingAnalytics.averageFare || 0,
          bookingTrends: bookingAnalytics.bookingTrends || [],
          statusDistribution: bookingAnalytics.statusDistribution || [],
          topRoutes: bookingAnalytics.topRoutes || [],
          peakHours: bookingAnalytics.peakHours || [],
          monthlyComparison: bookingAnalytics.monthlyComparison || []
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
  }, [filters, errorToast]);

  // Fetch analytics when filters change
  useEffect(() => {
    if (!isClient) return;
    fetchAnalyticsData();
  }, [filters, isClient, fetchAnalyticsData]);

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
        title: 'Analytics Dashboard Report',
        subtitle: 'Comprehensive system analytics and insights',
        generatedAt: new Date().toISOString(),
        filters: filters as unknown as Record<string, unknown>,
        sections: [
          PDFGenerator.createMetricsSection('Booking Analytics', {
            'Total Bookings': analyticsData?.bookingAnalytics.totalBookings || 0,
            'Total Revenue': `$${analyticsData?.bookingAnalytics.totalRevenue || 0}`,
            'Completed Bookings': analyticsData?.bookingAnalytics.completedBookings || 0,
            'Average Fare': `$${analyticsData?.bookingAnalytics.averageFare || 0}`
          }),
          PDFGenerator.createMetricsSection('Driver Analytics', {
            'Total Drivers': analyticsData?.driverAnalytics.totalDrivers || 0,
            'Verified Drivers': analyticsData?.driverAnalytics.verifiedDrivers || 0,
            'Active Drivers': analyticsData?.driverAnalytics.activeDrivers || 0,
            'Average Rating': analyticsData?.driverAnalytics.averageRating?.toFixed(1) || '0.0',
            'Total Revenue': `$${analyticsData?.driverAnalytics.totalRevenue || 0}`
          }),
          PDFGenerator.createTableSection('Top Drivers', 
            (analyticsData?.topDrivers || []).map((driver: { name: string; rating: number; trips: number; earnings: number }, index: number) => ({
              'Rank': index + 1,
              'Name': driver.name,
              'Rating': driver.rating.toFixed(1),
              'Trips': driver.trips,
              'Earnings': `$${driver.earnings}`
            }))
          ),
          PDFGenerator.createTableSection('Revenue Data', 
            (analyticsData?.revenueData || []).map((stat: { month: string; revenue: number; bookings: number }) => ({
              'Month': stat.month,
              'Revenue': `$${stat.revenue}`,
              'Bookings': stat.bookings
            }))
          )
        ]
      };

      // Generate and download PDF
      await downloadPDF(reportData, 'analytics-report');
      
      successToast('PDF report generated and downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      errorToast('Failed to generate PDF report');
    } finally {
      setGeneratingReport(false);
    }
  }, [filters, analyticsData, successToast, errorToast]);



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    if (!analyticsData) return { drivers: [], totalPages: 0 };
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const drivers = analyticsData.driverAnalytics.driverStats?.slice(startIndex, endIndex) || [];
    const totalPages = Math.ceil((analyticsData.driverAnalytics.driverStats?.length || 0) / itemsPerPage);
    
    return { drivers, totalPages };
  }, [analyticsData, currentPage, itemsPerPage]);

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

  // Don't render until client is ready to prevent hydration issues
  if (!isClient) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="Analytics Dashboard" subtitle="Comprehensive system analytics">
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
          {/* Header with Report Generation */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-sm text-gray-500 mt-2">Comprehensive system analytics and insights</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.bookingAnalytics.totalRevenue)}</p>
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
                {(analyticsData.bookingAnalytics.statusDistribution || []).map((status) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{status.count}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({status.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
                {(analyticsData.bookingAnalytics.statusDistribution || []).length === 0 && (
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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Driver Performance Overview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.drivers.map((driver) => (
                    <tr key={driver.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">{driver.name.charAt(0)}</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                            <p className="text-sm text-gray-500">{driver.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.totalBookings || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.completedBookings || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(driver.totalRevenue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(driver.averageRating || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          driver.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {driver.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {paginatedData.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={paginatedData.totalPages}
                  totalItems={analyticsData.driverAnalytics.driverStats?.length || 0}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Loading component for Suspense fallback
function AdminAnalyticsLoading() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="Analytics Dashboard" subtitle="Comprehensive system analytics and insights">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Main export with Suspense wrapper
export default function AdminAnalyticsPage() {
  return (
    <Suspense fallback={<AdminAnalyticsLoading />}>
      <AdminAnalyticsContent />
    </Suspense>
  );
}