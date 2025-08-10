'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { driverApi, Booking } from '@/lib/dashboardApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  CalendarIcon, 
  UserCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

export default function DriverBookingsPage() {
  const { successToast, errorToast, question } = useSweetAlert();
  
  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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
      const response = await driverApi.getRecentBookings();
      setBookings(response);
      setTotalBookings(response.length);
      setTotalPages(Math.ceil(response.length / pageSize));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      errorToast('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [pageSize, errorToast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearch = async () => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleAcceptBooking = async (booking: Booking) => {
    const result = await question(
      `Are you sure you want to accept this booking from ${booking.user || 'customer'}?`,
      'Accept Booking'
    );

    if (!result.isConfirmed) return;

    try {
      await driverApi.acceptBooking(booking.id);
      successToast('Booking accepted successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error accepting booking:', error);
      errorToast('Failed to accept booking');
    }
  };

  const handleDeclineBooking = async (booking: Booking) => {
    const result = await question(
      `Are you sure you want to decline this booking from ${booking.user || 'customer'}?`,
      'Decline Booking'
    );

    if (!result.isConfirmed) return;

    try {
      await driverApi.declineBooking(booking.id);
      successToast('Booking declined successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error declining booking:', error);
      errorToast('Failed to decline booking');
    }
  };

  const handleStartTrip = async (booking: Booking) => {
    try {
      await driverApi.startTrip(booking.id);
      successToast('Trip started successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error starting trip:', error);
      errorToast('Failed to start trip');
    }
  };

  const handleCompleteTrip = async (booking: Booking) => {
    try {
      await driverApi.completeTrip(booking.id);
      successToast('Trip completed successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error completing trip:', error);
      errorToast('Failed to complete trip');
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  // Table columns
  const columns: Column<Booking>[] = [
    {
      key: 'id',
      header: 'Booking ID',
      render: (value) => `#${(value as string).slice(-8).toUpperCase()}`
    },
    {
      key: 'user.name',
      header: 'Customer',
      render: (value, row) => {
        const userName = typeof row.user === 'string' ? row.user : row.user?.name || 'Unknown';
        const userEmail = typeof row.user === 'string' ? '' : row.user?.email || '';
        return (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <UserCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">{userName}</div>
              {userEmail && <div className="text-sm text-gray-500">{userEmail}</div>}
            </div>
          </div>
        );
      }
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

  return (
    <ProtectedRoute requiredRole="DRIVER">
      <DashboardLayout title="My Bookings" subtitle="Manage your bookings and trips">
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
            searchPlaceholder="Search bookings by customer name or location..."
            actions={{
              view: handleViewBooking
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
                    Created on {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleDateString() : 'Unknown'}
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

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h4>
                <div className="flex items-center mb-3">
                  <UserCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {typeof selectedBooking.user === 'string' ? selectedBooking.user : selectedBooking.user?.name || 'Unknown'}
                    </p>
                    {typeof selectedBooking.user === 'object' && selectedBooking.user?.email && (
                      <p className="text-sm text-gray-500">{selectedBooking.user.email}</p>
                    )}
                    {typeof selectedBooking.user === 'object' && selectedBooking.user?.phone && (
                      <div className="flex items-center mt-1">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">{selectedBooking.user.phone}</span>
                      </div>
                    )}
                  </div>
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

              {/* Action Buttons */}
              {selectedBooking.status === 'PENDING' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleAcceptBooking(selectedBooking)}
                      className="flex-1"
                    >
                      Accept Booking
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeclineBooking(selectedBooking)}
                      className="flex-1"
                    >
                      Decline Booking
                    </Button>
                  </div>
                </div>
              )}

              {selectedBooking.status === 'CONFIRMED' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
                  <Button
                    onClick={() => handleStartTrip(selectedBooking)}
                    className="w-full"
                  >
                    Start Trip
                  </Button>
                </div>
              )}

              {selectedBooking.status === 'IN_PROGRESS' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
                  <Button
                    onClick={() => handleCompleteTrip(selectedBooking)}
                    className="w-full"
                  >
                    Complete Trip
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