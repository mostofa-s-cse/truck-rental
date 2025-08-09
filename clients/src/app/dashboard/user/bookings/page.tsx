'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { userApi, Booking } from '@/lib/dashboardApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  CalendarIcon, 
  UserCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

interface CancelReason {
  id: string;
  label: string;
  description: string;
}

const CANCEL_REASONS: CancelReason[] = [
  { id: 'changed_plans', label: 'Changed Plans', description: 'I changed my mind or plans' },
  { id: 'found_alternative', label: 'Found Alternative', description: 'I found a better option' },
  { id: 'price_too_high', label: 'Price Too High', description: 'The fare was too expensive' },
  { id: 'driver_delay', label: 'Driver Delay', description: 'Driver is taking too long' },
  { id: 'emergency', label: 'Emergency', description: 'I have an emergency' },
  { id: 'other', label: 'Other', description: 'Other reason' }
];

export default function UserBookingsPage() {
  const { successToast, errorToast } = useSweetAlert();
  
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
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelComment, setCancelComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  
  // Calculate pending ratings
  const pendingRatings = bookings.filter(b => b.status === 'COMPLETED' && !b.rating);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch real booking data from the server
      const bookingsData = await userApi.getRecentBookings();
      
      // Filter bookings based on search query and status
      let filteredBookings = bookingsData;
      
      if (searchQuery) {
        filteredBookings = filteredBookings.filter(booking =>
          booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (booking.driver && booking.driver.toLowerCase().includes(searchQuery.toLowerCase()))
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
      // Set empty data on error
      setBookings([]);
      setTotalBookings(0);
      setTotalPages(0);
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
    // Only allow cancellation for pending and confirmed bookings
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      errorToast('Only pending and confirmed bookings can be cancelled');
      return;
    }

    setSelectedBooking(booking);
    setCancelReason('');
    setCancelComment('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking || !cancelReason) {
      errorToast('Please select a cancellation reason');
      return;
    }

    try {
      await userApi.cancelBooking(selectedBooking.id, cancelReason, cancelComment);
      successToast('Booking cancelled successfully');
      setShowCancelModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      errorToast('Failed to cancel booking');
    }
  };

  const handleRateDriver = async (booking: Booking) => {
    setSelectedBooking(booking);
    setRating(0);
    setRatingComment('');
    setHoveredStar(0);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedBooking || rating === 0) {
      errorToast('Please select a rating');
      return;
    }

    try {
      await userApi.submitRating(selectedBooking.id, rating, ratingComment);
      successToast('Rating submitted successfully!');
      setShowRatingModal(false);
      fetchBookings(); // Refresh to show the rating
    } catch (error) {
      console.error('Error submitting rating:', error);
      errorToast('Failed to submit rating');
    }
  };

  const handleContactDriver = async (booking: Booking) => {
    if (!booking.driver || !booking.driverId) {
      errorToast('No driver assigned to this booking yet');
      return;
    }

    try {
      const result = await userApi.contactDriver(booking.driverId, 'User wants to contact driver', booking.id);
      
      successToast(`Driver contact info: ${result.contactInfo.phone || result.contactInfo.email}`);
    } catch (error) {
      console.error('Error contacting driver:', error);
      errorToast('Failed to contact driver');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'CONFIRMED':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'IN_PROGRESS':
        return <ClockIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Table columns
  const columns: Column<Booking>[] = [
    {
      key: 'id',
      header: 'Booking ID',
      render: (value) => `#${(value as string).slice(-8).toUpperCase()}`
    },
    {
      key: 'driver',
      header: 'Driver',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <UserCircleIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {row.driver || 'Driver Assigned'}
            </div>
            <div className="text-sm text-gray-500">
              {row.driver ? 'Assigned Driver' : 'Awaiting Assignment'}
            </div>
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
      render: (value, row) => {
        const statusValue = value as string;
        return (
          <div className="flex items-center space-x-2">
            {getStatusIcon(statusValue)}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(statusValue)}`}>
              {statusValue.replace('_', ' ')}
            </span>
            {row.rating && (
              <div className="flex items-center ml-2">
                <StarIcon className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-gray-600 ml-1">{row.rating}</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'date',
      header: 'Date',
      render: (value) => (
        <div className="text-sm">
          <div className="text-gray-900">{new Date(value as string).toLocaleDateString()}</div>
          <div className="text-gray-500">{new Date(value as string).toLocaleTimeString()}</div>
        </div>
      )
    },
  ];

  const pagination = {
    page: currentPage,
    limit: pageSize,
    total: totalBookings,
    totalPages: totalPages
  };

  const actions = {
    view: handleViewBooking,
    delete: handleCancelBooking
  };

  return (
    <ProtectedRoute requiredRole="USER">
      <DashboardLayout title="My Bookings" subtitle="View and manage your booking history">
        <div className="space-y-6">
          {/* Header with Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                <p className="text-sm text-gray-500 mt-2">View and manage your booking history</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {bookings.filter(b => b.status === 'COMPLETED').length}
                      </p>
                    </div>
                  </div>
                </div>
                {pendingRatings.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <StarIcon className="h-6 w-6 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">Pending Ratings</p>
                        <p className="text-2xl font-bold text-gray-900">{pendingRatings.length}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rating Section - Only show if there are pending ratings */}
          {pendingRatings.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  Rate Your Completed Trips
                </h3>
                <div className="text-sm text-gray-500">
                  {pendingRatings.length} trips pending rating
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRatings
                  .slice(0, 6) // Show max 6 pending ratings
                  .map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <UserCircleIcon className="h-8 w-8 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{booking.driver || 'Driver Assigned'}</p>
                            <p className="text-xs text-gray-500">Trip #{booking.id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-xs text-gray-600 mb-1">Route:</div>
                        <div className="text-sm text-gray-900">
                          {booking.source} → {booking.destination}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Fare: ${booking.fare}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleRateDriver(booking)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center space-x-1"
                        >
                          <StarIcon className="h-3 w-3" />
                          <span>Rate Driver</span>
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
              
              {pendingRatings.length > 6 && (
                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Filter to show only completed bookings without ratings
                      setFilterStatus('COMPLETED');
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                  >
                    View All Pending Ratings ({pendingRatings.length})
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* DataTable */}
          <div className="bg-white rounded-xl shadow-lg">
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
              emptyMessage="No bookings found. Start by making your first booking!"
              initialSearchQuery={searchQuery}
            />
          </div>
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
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Booking #{selectedBooking.id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Created on {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedBooking.status)}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Driver Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <UserCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Driver Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-600 w-20">Name:</span>
                      <span className="text-sm text-gray-900">{selectedBooking.driver || 'Not Assigned Yet'}</span>
                    </div>
                    <div className="flex items-center">
                      <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {selectedBooking.driver ? 'Assigned Driver' : 'Driver will be assigned soon'}
                      </span>
                    </div>
                    {selectedBooking.driver && (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 w-20">Status:</span>
                        <span className="text-sm text-gray-900">
                          {selectedBooking.status === 'COMPLETED' ? 'Trip Completed' : 'Active Driver'}
                        </span>
                      </div>
                    )}
                    {selectedBooking.rating && (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 w-20">Rating:</span>
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-gray-900 ml-1">{selectedBooking.rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MapPinIcon className="h-5 w-5 text-green-500 mr-2" />
                    Trip Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">From: {selectedBooking.source}</div>
                        <div className="text-gray-600">To: {selectedBooking.destination}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {new Date(selectedBooking.date).toLocaleDateString()} at {new Date(selectedBooking.date).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Fare: ${selectedBooking.fare}</span>
                    </div>
                    {selectedBooking.distance && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Distance: {selectedBooking.distance} km</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
                {['PENDING', 'CONFIRMED'].includes(selectedBooking.status) && (
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
                {selectedBooking.status === 'COMPLETED' && !selectedBooking.rating && (
                  <Button
                    onClick={() => {
                      handleRateDriver(selectedBooking);
                      setShowViewModal(false);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    <StarIcon className="h-4 w-4 mr-2" />
                    Rate Driver
                  </Button>
                )}
                {['CONFIRMED', 'IN_PROGRESS'].includes(selectedBooking.status) && selectedBooking.driver && (
                  <Button
                    onClick={() => handleContactDriver(selectedBooking)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Contact Driver
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Cancel Booking Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Booking"
          size="md"
        >
          {selectedBooking && (
            <div className="space-y-6">
              {/* Booking Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Booking Information</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Booking ID:</strong> #{selectedBooking.id.slice(-8).toUpperCase()}</p>
                  <p><strong>Route:</strong> {selectedBooking.source} → {selectedBooking.destination}</p>
                  <p><strong>Fare:</strong> ${selectedBooking.fare}</p>
                </div>
              </div>

              {/* Cancellation Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Why are you cancelling this booking? *
                </label>
                <div className="space-y-2">
                  {CANCEL_REASONS.map((reason) => (
                    <label key={reason.id} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason.id}
                        checked={cancelReason === reason.id}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{reason.label}</div>
                        <div className="text-sm text-gray-500">{reason.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Comment */}
              <div>
                <label htmlFor="cancelComment" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  id="cancelComment"
                  value={cancelComment}
                  onChange={(e) => setCancelComment(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Please provide any additional details about your cancellation..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Booking
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmCancel}
                  disabled={!cancelReason}
                  className={!cancelReason ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Rating Modal */}
        <Modal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          title="Rate Your Driver"
          size="md"
        >
          {selectedBooking && (
            <div className="space-y-6">
              {/* Driver Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Driver Information</h4>
                <div className="flex items-center">
                  <UserCircleIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedBooking.driver || 'Driver Assigned'}</p>
                    <p className="text-sm text-gray-500">Trip: {selectedBooking.source} → {selectedBooking.destination}</p>
                  </div>
                </div>
              </div>

              {/* Rating Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rate your experience (1-5 stars) *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className={`p-1 rounded-full transition-colors ${
                        star <= (hoveredStar || rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <svg
                        className="w-8 h-8 fill-current"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {rating === 0 && 'Select a rating'}
                  {rating === 1 && 'Poor - Very dissatisfied with the service'}
                  {rating === 2 && 'Fair - Below average experience'}
                  {rating === 3 && 'Good - Satisfactory service'}
                  {rating === 4 && 'Very Good - Above average experience'}
                  {rating === 5 && 'Excellent - Outstanding service'}
                </p>
              </div>

              {/* Comment Input */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  id="comment"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Share your experience with this driver. What went well? What could be improved?"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowRatingModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitRating}
                  disabled={rating === 0}
                  className={`${rating === 0 ? 'opacity-50 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
                >
                  <StarIcon className="h-4 w-4 mr-2" />
                  Submit Rating
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}