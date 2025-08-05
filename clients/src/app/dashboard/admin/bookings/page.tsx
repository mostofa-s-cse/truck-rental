'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { adminApi, Booking } from '@/lib/adminApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  CalendarIcon, 
  UserCircleIcon,
  TruckIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

// Utility functions
const formatDate = (date: string) => new Date(date).toLocaleDateString();

const formatDateTime = (date: string) => new Date(date).toLocaleString();

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getNextStatusAction = (currentStatus: string) => {
  switch (currentStatus) {
    case 'PENDING': return { nextStatus: 'CONFIRMED', label: 'Confirm Booking' };
    case 'CONFIRMED': return { nextStatus: 'IN_PROGRESS', label: 'Start Trip' };
    case 'IN_PROGRESS': return { nextStatus: 'COMPLETED', label: 'Complete Trip' };
    default: return null;
  }
};

// Sub-components
const BookingDetails = ({ booking }: { booking: Booking }) => (
  <div className="space-y-6">
    {/* Booking Header */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Booking #{booking.id.slice(-8).toUpperCase()}
        </h3>
        <p className="text-sm text-gray-500">
          Created on {formatDate(booking.createdAt)}
        </p>
      </div>
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
        {booking.status.replace('_', ' ')}
      </span>
    </div>

    {/* Customer and Driver Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h4>
        <div className="flex items-center mb-3">
          <UserCircleIcon className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">{booking.user.name}</p>
            <p className="text-sm text-gray-500">{booking.user.email}</p>
            {booking.user.phone && (
              <p className="text-sm text-gray-500">{booking.user.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Driver Information</h4>
        <div className="flex items-center mb-3">
          <TruckIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">{booking.driver?.user.name || 'Not assigned'}</p>
            <p className="text-sm text-gray-500">{booking.driver?.user.email || '-'}</p>
            <p className="text-sm text-gray-500">{booking.driver?.truckType.replace('_', ' ') || '-'}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Trip Details */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Trip Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">From</label>
          <p className="text-sm text-gray-900">{booking.source}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">To</label>
          <p className="text-sm text-gray-900">{booking.destination}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <p className="text-sm text-gray-900">{formatDate(booking.date)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fare</label>
          <p className="text-sm font-medium text-gray-900">${booking.fare}</p>
        </div>
        {booking.pickupTime && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Pickup Time</label>
            <p className="text-sm text-gray-900">{formatDateTime(booking.pickupTime)}</p>
          </div>
        )}
        {booking.completedAt && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Completed At</label>
            <p className="text-sm text-gray-900">{formatDateTime(booking.completedAt)}</p>
          </div>
        )}
      </div>
    </div>

    {/* Payment Information */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <p className="text-sm text-gray-900">{booking.paymentMethod}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Status</label>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {booking.paymentStatus}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Main component
export default function AdminBookingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { successToast, errorToast, withConfirmation } = useSweetAlert();

  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [pendingFilterChange, setPendingFilterChange] = useState<{ statusFilter: string; shouldResetPage: boolean } | null>(null);
  const [pendingURLUpdate, setPendingURLUpdate] = useState<{ page: number; limit: number; search: string; status: string } | null>(null);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Handle pending filter changes
  useEffect(() => {
    if (pendingFilterChange) {
      setFilterStatus(pendingFilterChange.statusFilter);
      if (pendingFilterChange.shouldResetPage) {
        setCurrentPage(1);
      }
      setPendingFilterChange(null);
    }
  }, [pendingFilterChange]);

  // Handle pending URL updates
  useEffect(() => {
    if (pendingURLUpdate) {
      const { page, limit, search, status } = pendingURLUpdate;
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (limit !== 10) params.set('limit', limit.toString());
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const query = params.toString() ? `?${params.toString()}` : '';
      router.push(`${pathname}${query}`, { scroll: false });
      setPendingURLUpdate(null);
    }
  }, [pendingURLUpdate, router, pathname]);

  // Update URL function - now schedules updates instead of immediate execution
  const updateURL = useCallback((page: number, limit: number, search: string, status: string) => {
    setPendingURLUpdate({ page, limit, search, status });
  }, []);

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync local state with URL params
  useEffect(() => {
    if (!isClient) return;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    setCurrentPage(page);
    setPageSize(limit);
    setSearchQuery(search);
    setFilterStatus(status);
  }, [searchParams, isClient]);

  // Fetch bookings when dependencies change
  useEffect(() => {
    if (!isClient) return;
    fetchBookings();
  }, [currentPage, pageSize, searchQuery, filterStatus, isClient]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getBookings(currentPage, pageSize, searchQuery, filterStatus || undefined);
      setBookings(response.data);
      setTotalBookings(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      errorToast('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, filterStatus, errorToast]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL(1, pageSize, query, filterStatus);
  }, [pageSize, filterStatus, updateURL]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateURL(page, pageSize, searchQuery, filterStatus);
  }, [pageSize, searchQuery, filterStatus, updateURL]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    updateURL(1, size, searchQuery, filterStatus);
  }, [searchQuery, filterStatus, updateURL]);

  const handleFilterChange = useCallback((filters: Record<string, string | boolean>) => {
    try {
      console.log('Bookings page handleFilterChange called:', filters);
      
      // Extract status filter from the filters object
      const statusFilter = filters.status as string || '';
      
      console.log('Extracted status filter:', statusFilter);
      
      // Update URL with new filters immediately
      updateURL(1, pageSize, searchQuery, statusFilter);
      
      // Schedule state updates for next render cycle
      setPendingFilterChange({ statusFilter, shouldResetPage: true });
      
      console.log('Filter changes applied successfully');
      
    } catch (error) {
      console.error('Error in handleFilterChange:', error);
    }
  }, [pageSize, searchQuery, updateURL]);

  const handleDeleteBooking = useCallback(async (booking: Booking) => {
    await withConfirmation(
      async () => {
        await adminApi.deleteBooking(booking.id);
        successToast('Booking deleted successfully');
        // Trigger a refetch by updating a dependency
        setCurrentPage(prev => prev);
      },
      `Are you sure you want to delete this booking? This action cannot be undone.`,
      'Delete Booking'
    );
  }, [withConfirmation, successToast]);

  const handleUpdateStatus = useCallback(async (booking: Booking, newStatus: string) => {
    try {
      await adminApi.updateBooking(booking.id, { status: newStatus });
      successToast('Booking status updated successfully');
      // Trigger a refetch by updating a dependency
      setCurrentPage(prev => prev);
    } catch (error) {
      console.error('Error updating booking status:', error);
      errorToast('Failed to update booking status');
    }
  }, [successToast, errorToast]);

  const handleViewBooking = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  }, []);

  // Memoized values
  const columns = useMemo((): Column<Booking>[] => [
    {
      key: 'id',
      header: 'Booking ID',
      render: (value) => `#${(value as string).slice(-8).toUpperCase()}`
    },
    {
      key: 'user.name',
      header: 'Customer',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <UserCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{row.user.name}</div>
            <div className="text-sm text-gray-500">{row.user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'driver.user.name',
      header: 'Driver',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <TruckIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{row.driver?.user.name || 'Not assigned'}</div>
            <div className="text-sm text-gray-500">{row.driver?.truckType.replace('_', ' ') || '-'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'source',
      header: 'Route',
      render: (value, row) => (
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
          <div className="text-sm">
            <div className="text-gray-900">{row.source}</div>
            <div className="text-gray-500">→ {row.destination}</div>
          </div>
        </div>
      )
    },
    {
      key: 'fare',
      header: 'Fare',
      render: (value) => (
        <div className="flex items-center">
          <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm font-medium text-gray-900">${value as number}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value as string)}`}>
          {(value as string).replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (value) => formatDate(value as string)
    }
  ], []);

  const pagination = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    total: totalBookings,
    totalPages: totalPages
  }), [currentPage, pageSize, totalBookings, totalPages]);

  const actions = useMemo(() => ({
    view: handleViewBooking,
    delete: handleDeleteBooking
  }), [handleViewBooking, handleDeleteBooking]);

  // Don't render until client is ready to prevent hydration issues
  if (!isClient) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="Booking Management" subtitle="Manage all bookings in the system">
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

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="Booking Management" subtitle="Manage all bookings in the system">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
              <p className="text-sm text-gray-500 mt-2">Manage all bookings in the system</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                </div>
              </div>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={bookings}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handlePageSizeChange}
            onSearch={handleSearch}
            onFilter={handleFilterChange}
            searchPlaceholder="Search by Booking ID, Customer name/email, Driver name/email, or Route..."
            showSearch={true}
            showFilters={true}
            filterOptions={[
              {
                key: 'status',
                label: 'Booking Status',
                type: 'select',
                options: [
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'CONFIRMED', label: 'Confirmed' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'CANCELLED', label: 'Cancelled' }
                ],
                placeholder: 'Select booking status'
              }
            ]}
            actions={actions}
            emptyMessage="No bookings found"
            initialSearchQuery={searchQuery}
          />
        </div>

        {/* View Booking Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Booking Details"
          size="xl"
        >
          {selectedBooking && (
            <div className="space-y-6">
              <BookingDetails booking={selectedBooking} />

              {/* Status Update */}
              {selectedBooking.status !== 'COMPLETED' && selectedBooking.status !== 'CANCELLED' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Update Status</h4>
                  <div className="flex space-x-2">
                    {getNextStatusAction(selectedBooking.status) && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedBooking, getNextStatusAction(selectedBooking.status)!.nextStatus)}
                      >
                        {getNextStatusAction(selectedBooking.status)!.label}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedBooking, 'CANCELLED')}
                    >
                      Cancel Booking
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 