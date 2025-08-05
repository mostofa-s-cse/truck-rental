'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { adminApi, DriverAnalytics } from '@/lib/adminApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { downloadPDF, PDFGenerator } from '@/utils/pdfGenerator';
import { 
  TruckIcon, 
  StarIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from 'lucide-react';

interface FilterOptions {
  timeRange: 'day' | 'week' | 'month' | 'year';
  status?: string;
  verificationStatus?: string;
  availabilityStatus?: string;
  startDate?: string;
  endDate?: string;
  minRating?: string;
  maxRating?: string;
  page?: number;
  limit?: number;
}

export default function DriverAnalyticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { errorToast, successToast } = useSweetAlert();
  
  // State
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<DriverAnalytics | null>(null);
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
    const verificationStatus = searchParams.get('verificationStatus') || undefined;
    const availabilityStatus = searchParams.get('availabilityStatus') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const minRating = searchParams.get('minRating') || undefined;
    const maxRating = searchParams.get('maxRating') || undefined;

    setFilters({
      timeRange,
      status,
      verificationStatus,
      availabilityStatus,
      startDate,
      endDate,
      minRating,
      maxRating
    });
  }, [searchParams, isClient]);

  // Fetch analytics when filters change
  useEffect(() => {
    if (!isClient) return;
    fetchDriverAnalytics();
  }, [filters, isClient]);

  const updateURL = useCallback((newFilters: FilterOptions) => {
    setPendingURLUpdate(newFilters);
  }, []);

  const fetchDriverAnalytics = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching driver analytics with filters:', filters);
      console.log('Current token:', localStorage.getItem('token'));
      
      // Fetch driver analytics from API
      const apiData = await adminApi.getDriverAnalytics();
      console.log('Driver analytics response:', apiData);
      
      // Apply filters to data (in real implementation, this would be done on the backend)
      const filteredData = { ...apiData };
      
      if (filters.verificationStatus) {
        // Filter by verification status
        filteredData.driverStats = filteredData.driverStats?.filter(driver => {
          if (filters.verificationStatus === 'verified') return driver.isVerified;
          if (filters.verificationStatus === 'unverified') return !driver.isVerified;
          return true;
        }) || [];
      }

      if (filters.availabilityStatus) {
        // Filter by availability status
        filteredData.driverStats = filteredData.driverStats?.filter(driver => {
          if (filters.availabilityStatus === 'available') return driver.isAvailable;
          if (filters.availabilityStatus === 'unavailable') return !driver.isAvailable;
          return true;
        }) || [];
      }

      if (filters.minRating || filters.maxRating) {
        // Filter by rating range
        const minRating = filters.minRating ? parseFloat(filters.minRating) : 0;
        const maxRating = filters.maxRating ? parseFloat(filters.maxRating) : 5;
        
        filteredData.driverStats = filteredData.driverStats?.filter(driver => {
          const rating = driver.averageRating || 0;
          return rating >= minRating && rating <= maxRating;
        }) || [];
      }

      // Update aggregated stats based on filtered data
      if (filteredData.driverStats) {
        filteredData.totalDrivers = filteredData.driverStats.length;
        filteredData.verifiedDrivers = filteredData.driverStats.filter(d => d.isVerified).length;
        filteredData.activeDrivers = filteredData.driverStats.filter(d => d.isAvailable).length;
        filteredData.totalRevenue = filteredData.driverStats.reduce((sum, d) => sum + (d.totalRevenue || 0), 0);
        filteredData.averageRating = filteredData.driverStats.length > 0 
          ? filteredData.driverStats.reduce((sum, d) => sum + (d.averageRating || 0), 0) / filteredData.driverStats.length
          : 0;
      }
      
      setAnalyticsData(filteredData);
    } catch (error: unknown) {
      console.error('Error fetching driver analytics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const responseData = (error as { response?: { data?: unknown; status?: number } })?.response?.data;
      console.error('Error details:', responseData);
      console.error('Error status:', (error as { response?: { status?: number } })?.response?.status);
      errorToast(`Failed to fetch driver analytics: ${(responseData as { message?: string })?.message || errorMessage}`);
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
        title: 'Driver Analytics Report',
        subtitle: 'Comprehensive driver performance insights and trends',
        generatedAt: new Date().toISOString(),
        filters: filters as unknown as Record<string, unknown>,
        sections: [
          PDFGenerator.createMetricsSection('Overview', {
            'Total Drivers': analyticsData?.totalDrivers || 0,
            'Verified Drivers': analyticsData?.verifiedDrivers || 0,
            'Active Drivers': analyticsData?.activeDrivers || 0,
            'Average Rating': analyticsData?.averageRating?.toFixed(1) || '0.0',
            'Total Revenue': `$${analyticsData?.totalRevenue || 0}`
          }),
          PDFGenerator.createTableSection('Top Performing Drivers', 
            (analyticsData?.driverStats?.slice(0, 10) || []).map((driver: { name: string; email: string; averageRating: number; totalBookings: number; completedBookings: number; totalRevenue: number; isVerified: boolean; isAvailable: boolean }, index: number) => ({
              'Rank': index + 1,
              'Name': driver.name,
              'Email': driver.email,
              'Rating': driver.averageRating?.toFixed(1) || '0.0',
              'Total Bookings': driver.totalBookings || 0,
              'Completed': driver.completedBookings || 0,
              'Revenue': `$${driver.totalRevenue || 0}`,
              'Verified': driver.isVerified ? 'Yes' : 'No',
              'Available': driver.isAvailable ? 'Yes' : 'No'
            }))
          ),
          PDFGenerator.createTableSection('Top Revenue Performers', 
            (analyticsData?.driverStats
              ?.sort((a: { totalRevenue: number }, b: { totalRevenue: number }) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
              .slice(0, 10) || []).map((driver: { name: string; totalRevenue: number; totalBookings: number }, index: number) => ({
              'Rank': index + 1,
              'Name': driver.name,
              'Revenue': `$${driver.totalRevenue || 0}`,
              'Bookings': driver.totalBookings || 0
            }))
          ),
          PDFGenerator.createTableSection('Top Rated Drivers', 
            (analyticsData?.driverStats
              ?.sort((a: { averageRating: number }, b: { averageRating: number }) => (b.averageRating || 0) - (a.averageRating || 0))
              .slice(0, 10) || []).map((driver: { name: string; averageRating: number; totalBookings: number }, index: number) => ({
              'Rank': index + 1,
              'Name': driver.name,
              'Rating': driver.averageRating?.toFixed(1) || '0.0',
              'Bookings': driver.totalBookings || 0
            }))
          )
        ]
      };

      // Generate and download PDF
      await downloadPDF(reportData, 'driver-analytics-report');
      
      successToast('PDF report generated and downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      errorToast('Failed to generate PDF report');
    } finally {
      setGeneratingReport(false);
    }
  }, [filters, analyticsData, successToast, errorToast]);

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
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate paginated driver data
  const paginatedDrivers = useMemo(() => {
    if (!analyticsData) return { drivers: [], totalPages: 0 };
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const drivers = analyticsData.driverStats?.slice(startIndex, endIndex) || [];
    const totalPages = Math.ceil((analyticsData.driverStats?.length || 0) / itemsPerPage);
    
    return { drivers, totalPages };
  }, [analyticsData, currentPage, itemsPerPage]);

  // Don't render until client is ready to prevent hydration issues
  if (!isClient) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="Driver Analytics" subtitle="Comprehensive driver performance insights">
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
        <DashboardLayout title="Driver Analytics" subtitle="Comprehensive driver performance insights">
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
        <DashboardLayout title="Driver Analytics" subtitle="Comprehensive driver performance insights">
          <div className="text-center py-12">
            <p className="text-gray-500">No driver analytics data available</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="Driver Analytics" subtitle="Comprehensive driver performance insights">
        <div className="space-y-6">
          {/* Header with Report Generation */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Driver Analytics</h2>
              <p className="text-sm text-gray-500 mt-2">Comprehensive driver performance insights and trends</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                <select
                  value={filters.verificationStatus || ''}
                  onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Drivers</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  value={filters.availabilityStatus || ''}
                  onChange={(e) => handleFilterChange('availabilityStatus', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="available">Available Only</option>
                  <option value="unavailable">Unavailable Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.minRating || ''}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  placeholder="0.0"
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
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalDrivers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIconSolid className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.activeDrivers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <StarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.verifiedDrivers}</p>
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
                  <p className="text-2xl font-bold text-gray-900">${analyticsData.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
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
                  {paginatedDrivers.drivers.map((driver) => (
                    <tr key={driver.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserCircleIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                            <div className="text-sm text-gray-500">{driver.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.totalBookings}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.completedBookings}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(driver.totalRevenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(driver.averageRating)}
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
            {paginatedDrivers.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={paginatedDrivers.totalPages}
                  totalItems={analyticsData.driverStats?.length || 0}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </div>

          {/* Driver Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Driver Verification Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Verified Drivers</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.verifiedDrivers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Verification</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.totalDrivers - analyticsData.verifiedDrivers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Drivers</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.activeDrivers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="text-sm font-medium text-green-600">${analyticsData.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average per Driver</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${analyticsData.totalDrivers > 0 ? (analyticsData.totalRevenue / analyticsData.totalDrivers).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 