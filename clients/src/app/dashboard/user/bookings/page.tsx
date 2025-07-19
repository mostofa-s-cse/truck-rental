'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
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
  StarIcon,
  ClockIcon
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
  const { user } = useAppSelector((state) => state.auth);
  const { successToast, errorToast, confirmDialog } = useSweetAlert();
  
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, pageSize, searchQuery, filterStatus]);

  const fetchBookings = async () => {
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
          source: 'Office Complex',
          destination: 'Residential Area',
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
          source: 'Shopping Mall',
          destination: 'Business District',
          date: '2024-01-19',
          fare: 110,
          status: 'CANCELLED',
          createdAt: '2024-01-18T11:30:00Z',
          paymentMethod: 'CASH',
          paymentStatus: 'REFUNDED'
        }
      ];

      setBookings(mockBookings);
      setTotalBookings(mockBookings.length);
      setTotalPages(Math.ceil(mockBookings.length / pageSize));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      errorToast('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const handleCancelBooking = async (booking: Booking) => {
    const confirmed = await confirmDialog(
      'Cancel Booking',
      `Are you sure you want to cancel this booking with ${booking.driver.name}?`
    );

    if (!confirmed) return;

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
      render: (value) => `#${value.slice(-8).toUpperCase()}`
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
          <span className="text-sm font-medium text-gray-900">${value}</span>
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
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
          }`}>
            {value.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      key: 'date',
      header: 'Date',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <ProtectedRoute requiredRole="USER">
      <DashboardLayout title="My Bookings" subtitle="Manage your bookings and track your trips">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={bookings}
            columns={columns}
            loading={loading}
            pagination={{
              page: currentPage,
              limit: pageSize,
              total: totalBookings,
              totalPages: totalPages
            }}
            onPageChange={handlePageChange}
            onLimitChange={handlePageSizeChange}
            onSearch={handleSearch}
            searchPlaceholder="Search bookings by driver name or location..."
            showAddButton={false}
            actions={{
              view: handleViewBooking,
              cancel: handleCancelBooking,
              rate: handleRateDriver
            }}
            emptyMessage="No bookings found"
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
              {/* Booking Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Booking #{selectedBooking.id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created on {new Date(selectedBooking.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedBooking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  selectedBooking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  selectedBooking.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                  selectedBooking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedBooking.status.replace('_', ' ')}
                </span>
              </div>

              {/* Driver Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Driver Information</h4>
                <div className="flex items-center mb-3">
                  <UserCircleIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedBooking.driver.name}</p>
                    <p className="text-sm text-gray-500">{selectedBooking.driver.email}</p>
                    <div className="flex items-center mt-1">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">{selectedBooking.driver.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TruckIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">{selectedBooking.driver.truckType.replace('_', ' ')}</span>
                  </div>
                  {renderStars(selectedBooking.driver.rating)}
                </div>
              </div>

              {/* Trip Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Trip Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">From</label>
                    <p className="text-sm text-gray-900">{selectedBooking.source}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">To</label>
                    <p className="text-sm text-gray-900">{selectedBooking.destination}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-sm text-gray-900">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fare</label>
                    <p className="text-sm font-medium text-gray-900">${selectedBooking.fare}</p>
                  </div>
                  {selectedBooking.pickupTime && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pickup Time</label>
                      <p className="text-sm text-gray-900">{new Date(selectedBooking.pickupTime).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedBooking.completedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Completed At</label>
                      <p className="text-sm text-gray-900">{new Date(selectedBooking.completedAt).toLocaleString()}</p>
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
                    <p className="text-sm text-gray-900">{selectedBooking.paymentMethod.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedBooking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                      selectedBooking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedBooking.status === 'PENDING' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
                  <Button
                    variant="outline"
                    onClick={() => handleCancelBooking(selectedBooking)}
                    className="w-full"
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}

              {selectedBooking.status === 'COMPLETED' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
                  <Button
                    onClick={() => handleRateDriver(selectedBooking)}
                    className="w-full"
                  >
                    Rate Driver
                  </Button>
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