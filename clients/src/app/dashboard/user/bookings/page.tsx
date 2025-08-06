'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { userApi } from '@/lib/dashboardApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  CalendarIcon, 
  UserCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TruckIcon,
  PhoneIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface Booking {
  id: string;
  driver: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    rating: number;
    truckType: string;
  };
  source: string;
  destination: string;
  date: string;
  fare: number;
  status: string;
  createdAt: string;
  pickupTime?: string;
  completedAt?: string;
  paymentMethod: string;
  paymentStatus: string;
}

export default function UserBookingsPage() {
  const { successToast, errorToast, question } = useSweetAlert();
  
  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock data (replace with real API call)
      const mockBookings: Booking[] = [
        {
          id: '1',
          driver: {
            id: '1',
            name: 'John Driver',
            email: 'john@example.com',
            phone: '+1 (555) 123-4567',
            rating: 4.8,
            truckType: 'MINI_TRUCK'
          },
          source: 'Downtown Area',
          destination: 'Industrial Zone',
          date: '2024-01-15',
          fare: 85,
          status: 'COMPLETED',
          createdAt: '2024-01-14T10:30:00Z',
          pickupTime: '2024-01-15T09:00:00Z',
          completedAt: '2024-01-15T11:30:00Z',
          paymentMethod: 'CARD',
          paymentStatus: 'PAID'
        },
        {
          id: '2',
          driver: {
            id: '2',
            name: 'Mike Wilson',
            email: 'mike@example.com',
            phone: '+1 (555) 234-5678',
            rating: 4.5,
            truckType: 'PICKUP'
          },
          source: 'Residential Area',
          destination: 'Shopping Center',
          date: '2024-01-16',
          fare: 120,
          status: 'IN_PROGRESS',
          createdAt: '2024-01-15T15:45:00Z',
          pickupTime: '2024-01-16T10:00:00Z',
          paymentMethod: 'CASH',
          paymentStatus: 'PENDING'
        },
        {
          id: '3',
          driver: {
            id: '3',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            phone: '+1 (555) 345-6789',
            rating: 4.9,
            truckType: 'LORRY'
          },
          source: 'Warehouse District',
          destination: 'Port Area',
          date: '2024-01-17',
          fare: 150,
          status: 'CONFIRMED',
          createdAt: '2024-01-16T09:20:00Z',
          paymentMethod: 'MOBILE_MONEY',
          paymentStatus: 'PAID'
        },
        {
          id: '4',
          driver: {
            id: '4',
            name: 'David Brown',
            email: 'david@example.com',
            phone: '+1 (555) 456-7890',
            rating: 4.2,
            truckType: 'TRUCK'
          },
          source: 'Shopping Mall',
          destination: 'Office Building',
          date: '2024-01-18',
          fare: 95,
          status: 'PENDING',
          createdAt: '2024-01-17T14:15:00Z',
          paymentMethod: 'CARD',
          paymentStatus: 'PENDING'
        },
        {
          id: '5',
          driver: {
            id: '5',
            name: 'Lisa Davis',
            email: 'lisa@example.com',
            phone: '+1 (555) 567-8901',
            rating: 4.7,
            truckType: 'MINI_TRUCK'
          },
          source: 'Industrial Zone',
          destination: 'Residential Area',
          date: '2024-01-19',
          fare: 110,
          status: 'CANCELLED',
          createdAt: '2024-01-18T14:15:00Z',
          paymentMethod: 'CASH',
          paymentStatus: 'REFUNDED'
        }
      ];

      // Filter bookings based on search query and status
      let filteredBookings = mockBookings;
      
      if (searchQuery) {
        filteredBookings = filteredBookings.filter(booking =>
          booking.driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (filterStatus) {
        filteredBookings = filteredBookings.filter(booking => booking.status === filterStatus);
      }

      // Calculate pagination
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

      setBookings(paginatedBookings);
      setTotalBookings(filteredBookings.length);
      setTotalPages(Math.ceil(filteredBookings.length / pageSize));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      errorToast('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, filterStatus, errorToast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleFilterChange = (filters: Record<string, string | boolean>) => {
    const statusFilter = filters.status as string;
    setFilterStatus(statusFilter || '');
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const handleCancelBooking = async (booking: Booking) => {
    const result = await question(
      `Are you sure you want to cancel this booking with ${booking.driver.name}?`,
      'Cancel Booking'
    );

    if (!result.isConfirmed) return;

    try {
      await userApi.cancelBooking(booking.id);
      successToast('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      errorToast('Failed to cancel booking');
    }
  };

  const handleRateDriver = async (booking: Booking) => {
    // This would open a rating modal
    console.log('Rate driver for booking:', booking.id);
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
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  // Table columns
  const columns: Column<Booking>[] = [
    {
      key: 'id',
      header: 'Booking ID',
      render: (value) => `#${(value as string).slice(-8).toUpperCase()}`
    },
    {
      key: 'driver.name',
      header: 'Driver',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <UserCircleIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{row.driver.name}</div>
            <div className="text-sm text-gray-500">{row.driver.truckType.replace('_', ' ')}</div>
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
            <div className="text-gray-900">From: {row.source}</div>
            <div className="text-gray-600">To: {row.destination}</div>
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
      render: (value) => {
        const statusColors = {
          'PENDING': 'bg-yellow-100 text-yellow-800',
          'CONFIRMED': 'bg-blue-100 text-blue-800',
          'IN_PROGRESS': 'bg-purple-100 text-purple-800',
          'COMPLETED': 'bg-green-100 text-green-800',
          'CANCELLED': 'bg-red-100 text-red-800'
        };
        const statusValue = value as string;
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[statusValue as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
          }`}>
            {statusValue.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      key: 'date',
      header: 'Date',
      render: (value) => new Date(value as string).toLocaleDateString()
    }
  ];

  const pagination = {
    page: currentPage,
    limit: pageSize,
    total: totalBookings,
    totalPages: totalPages
  };

  const actions = {
    view: handleViewBooking,
    cancel: handleCancelBooking,
    rate: handleRateDriver
  };

  return (
    <ProtectedRoute requiredRole="USER">
      <DashboardLayout title="My Bookings" subtitle="View and manage your booking history">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
              <p className="text-sm text-gray-500 mt-2">View and manage your booking history</p>
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
            searchPlaceholder="Search by Booking ID, Driver name, or Route..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Driver Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{selectedBooking.driver.name}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{selectedBooking.driver.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{selectedBooking.driver.truckType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center">
                      {renderStars(selectedBooking.driver.rating)}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Booking Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm">
                        <div className="text-gray-900">From: {selectedBooking.source}</div>
                        <div className="text-gray-600">To: {selectedBooking.destination}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{new Date(selectedBooking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">${selectedBooking.fare}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
                {selectedBooking.status === 'PENDING' && (
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleCancelBooking(selectedBooking);
                      setShowViewModal(false);
                    }}
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 