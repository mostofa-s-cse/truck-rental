'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { driverApi, userApi, Booking } from '@/lib/dashboardApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  CalendarIcon, 
  UserCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon,
  CreditCardIcon,
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
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching driver bookings...');
      const response = await driverApi.getRecentBookings();
      console.log('Fetched bookings:', response);
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
    // Validate booking status
    if (booking.status !== 'PENDING') {
      errorToast('Can only accept pending bookings');
      return;
    }

    const result = await question(
      `Are you sure you want to accept this booking from ${booking.user || 'customer'}?`,
      'Accept Booking'
    );

    if (!result.isConfirmed) return;

    try {
      await driverApi.acceptBooking(booking.id);
      successToast('Booking accepted successfully');
      fetchBookings();
    } catch (error: unknown) {
      console.error('Error accepting booking:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to accept booking';
      errorToast(errorMessage);
    }
  };

  const handleDeclineBooking = async (booking: Booking) => {
    // Validate booking status
    if (booking.status !== 'PENDING') {
      errorToast('Can only decline pending bookings');
      return;
    }

    const result = await question(
      `Are you sure you want to decline this booking from ${booking.user || 'customer'}?`,
      'Decline Booking'
    );

    if (!result.isConfirmed) return;

    try {
      await driverApi.declineBooking(booking.id);
      successToast('Booking declined successfully');
      fetchBookings();
    } catch (error: unknown) {
      console.error('Error declining booking:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to decline booking';
      errorToast(errorMessage);
    }
  };

  const handleStartTrip = async (booking: Booking) => {
    // Validate booking status
    if (booking.status !== 'CONFIRMED') {
      errorToast('Can only start confirmed bookings');
      return;
    }

    const result = await question(
      `Are you sure you want to start this trip?`,
      'Start Trip'
    );

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      console.log('Starting trip for booking:', booking.id);
      await driverApi.startTrip(booking.id);
      successToast('Trip started successfully');
      setShowViewModal(false); // Close the modal
      await fetchBookings(); // Refresh the bookings list
    } catch (error: unknown) {
      console.error('Error starting trip:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to start trip';
      errorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = async (booking: Booking) => {
    // Validate booking status
    if (booking.status !== 'IN_PROGRESS') {
      errorToast('Can only complete trips that are in progress');
      return;
    }

    const result = await question(
      `Are you sure you want to complete this trip? This will request payment from the customer.`,
      'Complete Trip'
    );

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      console.log('Completing trip for booking:', booking.id);
      await driverApi.completeTrip(booking.id);
      successToast('Trip completed successfully! Payment request sent to customer.');
      setShowViewModal(false); // Close the modal
      await fetchBookings(); // Refresh the bookings list
    } catch (error: unknown) {
      console.error('Error completing trip:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to complete trip';
      errorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const handleRateCustomer = async (booking: Booking) => {
    // Validate booking before opening modal
    if (booking.status !== 'COMPLETED') {
      errorToast('Can only rate completed trips');
      return;
    }

    if (booking.rating && booking.rating !== null && booking.rating !== 0) {
      errorToast('You have already rated this customer');
      return;
    }

    if (booking.paymentStatus !== 'PAID') {
      errorToast('Payment must be completed before rating');
      return;
    }

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

    // Validate booking status
    if (selectedBooking.status !== 'COMPLETED') {
      errorToast('Can only rate completed trips');
      return;
    }

    // Check if already rated
    if (selectedBooking.rating && selectedBooking.rating !== null && selectedBooking.rating !== 0) {
      errorToast('You have already rated this customer');
      return;
    }

    // Check payment status
    if (selectedBooking.paymentStatus !== 'PAID') {
      errorToast('Payment must be completed before rating');
      return;
    }

    try {
      console.log('Submitting rating for booking:', selectedBooking.id, 'Rating:', rating);
      await userApi.submitRating(selectedBooking.id, rating, ratingComment);
      successToast('Rating submitted successfully!');
      setShowRatingModal(false);
      
      // Clear rating form
      setRating(0);
      setRatingComment('');
      setHoveredStar(0);
      
      // Refresh bookings to show the updated rating
      await fetchBookings();
    } catch (error: unknown) {
      console.error('Error submitting rating:', error);
      
      // Extract specific error message
      let errorMessage = 'Failed to submit rating';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      } else if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
        errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || errorMessage;
      }
      
      errorToast(errorMessage);
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
      key: 'user.name',
      header: 'Customer',
      render: (value, row) => {
        const userName = typeof row.user === 'string' ? row.user : row.user?.name || 'Unknown';
        const userEmail = typeof row.user === 'string' ? '' : row.user?.email || '';
        const userAvatar = typeof row.user === 'object' ? row.user?.avatar : null;
        
        // Normalize avatar URL
        const normalizeAvatar = (src?: string) => {
          if (!src) return undefined;
          if (src.startsWith('http://localhost') || src.startsWith('http://127.0.0.1')) {
            return src.replace(/^https?:\/\/(localhost|127\.0\.0\.1):\d+/, '');
          }
          if (src.startsWith('/')) return src;
          return undefined;
        };
        
        return (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
              {userAvatar ? (
                <Image
                  src={normalizeAvatar(userAvatar) || userAvatar}
                  alt={userName}
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="h-5 w-5 text-green-600" />
              )}
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
        <div className="flex items-start">
          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
          <div className="text-sm">
            <div className="text-gray-900 break-words" title={row.source}>{row.source}</div>
            <div className="text-gray-500 break-words" title={row.destination}>→ {row.destination}</div>
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
          <span className="text-sm font-medium text-gray-900">৳{value as number}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value, row) => {
        const statusValue = value as string;
        
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

        return (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              {getStatusIcon(statusValue)}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(statusValue)}`}>
                {statusValue.replace('_', ' ')}
              </span>
              {row.rating && row.rating !== null && row.rating !== 0 && (
                <div className="flex items-center ml-2">
                  <StarIcon className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs text-gray-600 ml-1">{row.rating}</span>
                </div>
              )}
            </div>
            {row.paymentStatus === 'PAYMENT_REQUESTED' && (
              <div className="flex items-center">
                <CreditCardIcon className="h-3 w-3 text-orange-500 mr-1" />
                <span className="text-xs text-orange-600 font-medium">Payment Requested</span>
              </div>
            )}
            {row.paymentStatus === 'PAID' && (
              <div className="flex items-center">
                <CreditCardIcon className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600 font-medium">Paid</span>
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
    {
      key: 'actions',
      header: 'Quick Actions',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {/* Rate Customer Button */}
          {row.status === 'COMPLETED' && row.paymentStatus === 'PAID' && (!row.rating || row.rating === null || row.rating === 0) && (
            <Button
              size="sm"
              onClick={() => handleRateCustomer(row)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 text-xs"
            >
              <StarIcon className="h-3 w-3 mr-1" />
              Rate
            </Button>
          )}
          
          {/* Contact Customer Button */}
          {['CONFIRMED', 'IN_PROGRESS'].includes(row.status) && (
            <Button
              size="sm"
              onClick={() => {
                if (typeof row.user === 'object' && row.user?.phone) {
                  successToast(`Customer phone: ${row.user.phone}`);
                } else if (typeof row.user === 'object' && row.user?.email) {
                  successToast(`Customer email: ${row.user.email}`);
                } else {
                  errorToast('Customer contact info not available');
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs"
            >
              <PhoneIcon className="h-3 w-3 mr-1" />
              Contact
            </Button>
          )}
        </div>
      )
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
              <button
                onClick={() => setFilterStatus('COMPLETED')}
                className="px-3 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
              >
                Show Completed Trips
              </button>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={filterStatus ? bookings.filter(booking => booking.status === filterStatus) : bookings}
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
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden mr-3">
                    {typeof selectedBooking.user === 'object' && selectedBooking.user?.avatar ? (
                      <Image
                        src={(() => {
                          const avatar = selectedBooking.user.avatar;
                          if (avatar?.startsWith('http://localhost') || avatar?.startsWith('http://127.0.0.1')) {
                            return avatar.replace(/^https?:\/\/(localhost|127\.0\.0\.1):\d+/, '');
                          }
                          return avatar?.startsWith('/') ? avatar : undefined;
                        })() || selectedBooking.user.avatar}
                        alt={typeof selectedBooking.user === 'string' ? selectedBooking.user : selectedBooking.user?.name || 'Customer'}
                        width={48}
                        height={48}
                        unoptimized
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="h-8 w-8 text-green-600" />
                    )}
                  </div>
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
                    <p className="text-sm text-gray-900 break-words">{selectedBooking.source}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">To</label>
                    <p className="text-sm text-gray-900 break-words">{selectedBooking.destination}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-sm text-gray-900">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fare</label>
                    <p className="text-sm font-medium text-gray-900">৳{selectedBooking.fare}</p>
                  </div>
                  {selectedBooking.paymentStatus && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                      <p className={`text-sm font-medium ${
                        selectedBooking.paymentStatus === 'PAYMENT_REQUESTED' ? 'text-orange-600' :
                        selectedBooking.paymentStatus === 'PAID' ? 'text-green-600' :
                        selectedBooking.paymentStatus === 'PENDING_PAYMENT' ? 'text-yellow-600' :
                        'text-gray-900'
                      }`}>
                        {selectedBooking.paymentStatus.replace('_', ' ')}
                      </p>
                    </div>
                  )}
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

              {/* Action Buttons - Pending Status */}
              {selectedBooking.status === 'PENDING' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleAcceptBooking(selectedBooking)}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Accepting...' : 'Accept Booking'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeclineBooking(selectedBooking)}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Declining...' : 'Decline Booking'}
                    </Button>
                  </div>
                </div>
              )}

              {selectedBooking.status === 'CONFIRMED' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
                  <Button
                    onClick={() => handleStartTrip(selectedBooking)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Starting Trip...' : 'Start Trip'}
                  </Button>
                </div>
              )}

              {selectedBooking.status === 'COMPLETED' && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-700 mb-3">Trip Status</h4>
                  <div className="flex items-center text-green-800">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">
                      Trip completed successfully! 
                      {selectedBooking.paymentStatus === 'PAYMENT_REQUESTED' && (
                        <span className="block text-xs mt-1">Payment request sent to customer.</span>
                      )}
                      {selectedBooking.paymentStatus === 'PAID' && (
                        <span className="block text-xs mt-1 text-green-600">Payment received.</span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {selectedBooking.status === 'IN_PROGRESS' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
                  <Button
                    onClick={() => handleCompleteTrip(selectedBooking)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Completing Trip...' : 'Complete Trip'}
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

        {/* Rating Modal */}
        <Modal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          title="Rate Your Customer"
          size="md"
        >
          {selectedBooking && (
            <div className="space-y-6">
              {/* Validation Messages */}
              {selectedBooking.status !== 'COMPLETED' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Trip Not Completed</h4>
                      <p className="text-xs text-yellow-600 mt-1">You can only rate customers after completing the trip.</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedBooking.paymentStatus !== 'PAID' && selectedBooking.status === 'COMPLETED' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-orange-400 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-orange-800">Payment Pending</h4>
                      <p className="text-xs text-orange-600 mt-1">Customer must complete payment before you can submit a rating.</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedBooking.rating && selectedBooking.rating !== null && selectedBooking.rating !== 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Already Rated</h4>
                      <p className="text-xs text-blue-600 mt-1">You have already rated this customer with {selectedBooking.rating} stars.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h4>
                <p className="text-sm text-gray-600">
                  <strong>Customer:</strong> {typeof selectedBooking.user === 'string' ? selectedBooking.user : selectedBooking.user?.name || 'Unknown'}<br />
                  <strong>Trip:</strong> {selectedBooking.source} → {selectedBooking.destination}<br />
                  <strong>Fare:</strong> ৳{selectedBooking.fare}
                </p>
              </div>

              {/* Rating Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rate Your Customer Experience (1-5 stars)
                </label>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="focus:outline-none"
                      type="button"
                    >
                      <StarIcon
                        className={`h-8 w-8 ${
                          star <= (hoveredStar || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {rating === 0 && 'Select a rating'}
                  {rating === 1 && 'Poor - Customer was difficult to work with'}
                  {rating === 2 && 'Fair - Customer was okay'}
                  {rating === 3 && 'Good - Customer was respectful'}
                  {rating === 4 && 'Very Good - Customer was pleasant'}
                  {rating === 5 && 'Excellent - Customer was exceptional'}
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
                  placeholder="Share your experience with this customer. Were they polite? On time? Any issues?"
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
                  disabled={
                    rating === 0 || 
                    selectedBooking.status !== 'COMPLETED' || 
                    selectedBooking.paymentStatus !== 'PAID' ||
                    Boolean(selectedBooking.rating)
                  }
                  className={
                    Boolean(selectedBooking.rating)
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }
                >
                  {Boolean(selectedBooking.rating) ? 'Already Rated' : 'Submit Rating'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 