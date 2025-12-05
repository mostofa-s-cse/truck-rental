'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { userApi, Booking } from '@/lib/dashboardApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { useAuth } from '@/hooks/useAuth';
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
  CreditCardIcon,
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
  const { user } = useAuth();
  
  // State
  const [allBookings, setAllBookings] = useState<Booking[]>([]); // Store all bookings data
  const [bookings, setBookings] = useState<Booking[]>([]); // Display bookings (paginated)
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
  const [paymentRequestBooking, setPaymentRequestBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelComment, setCancelComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  
  // Payment form data
  const [paymentData, setPaymentData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: 'Dhaka',
    customerPostCode: '1000',
    customerCountry: 'Bangladesh'
  });
  
  // Helper function to get driver name from driver object or string
  const getDriverName = (driver: Booking['driver']): string => {
    if (typeof driver === 'string') return driver;
    return driver?.name || 'Driver Assigned';
  };
  
  // Helper function to get driver avatar from driver object
  const getDriverAvatar = (driver: Booking['driver']): string | undefined => {
    if (typeof driver === 'object') return driver?.avatar;
    return undefined;
  };
  
  // Helper function to get proper image URL
  const getImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) return "";

    // If it's already a full URL (http/https), return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // For local uploads, ensure the path starts with /
    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return normalizedPath;
  };
  
  // Helper function to check if a booking can be rated
  const canRateBooking = (booking: Booking) => {
    const isCompleted = booking.status === 'COMPLETED';
    const hasNoRating = !booking.rating || booking.rating === null || booking.rating === 0;
    
    // Allow rating if:
    // 1. Trip is completed
    // 2. No existing rating
    // 3. Payment is completed (PAID) OR payment just completed (localStorage flag)
    const isPaymentComplete = booking.paymentStatus === 'PAID' || 
                             localStorage.getItem('payment_just_completed') === 'true';
    
    // Block rating if payment is explicitly requested and not completed
    const isPaymentBlocked = booking.paymentStatus === 'PAYMENT_REQUESTED' && 
                           !localStorage.getItem('payment_just_completed');
    
    console.log('canRateBooking check:', {
      bookingId: booking.id?.slice(-6),
      isCompleted,
      hasNoRating,
      paymentStatus: booking.paymentStatus,
      isPaymentComplete,
      isPaymentBlocked,
      result: isCompleted && hasNoRating && !isPaymentBlocked
    });
    
    return isCompleted && hasNoRating && !isPaymentBlocked;
  };

  // Calculate pending ratings - completed trips that can be rated
  const pendingRatings = allBookings.filter(canRateBooking);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch real booking data from the server
      const bookingsData = await userApi.getRecentBookings();
      console.log('Fetched bookings data:', bookingsData);
      
      // Log specific details about completed bookings
      const completedBookings = bookingsData.filter(b => b.status === 'COMPLETED');
      console.log('Completed bookings analysis:', completedBookings.map(b => ({
        id: b.id.slice(-6),
        status: b.status,
        paymentStatus: b.paymentStatus,
        rating: b.rating,
        driver: getDriverName(b.driver),
        canRate: canRateBooking(b)
      })));
      
      // Log rateable bookings specifically
      const rateableBookings = bookingsData.filter(canRateBooking);
      console.log(`Found ${rateableBookings.length} rateable bookings out of ${bookingsData.length} total bookings`);
      console.log('Rateable bookings:', rateableBookings.map(b => ({
        id: b.id.slice(-6),
        status: b.status,
        paymentStatus: b.paymentStatus,
        rating: b.rating
      })));
      
      // Log paid bookings that should show rate button
      const paidCompletedBookings = bookingsData.filter(b => 
        b.status === 'COMPLETED' && 
        b.paymentStatus === 'PAID'
      );
      console.log(`Paid completed bookings: ${paidCompletedBookings.length}`, paidCompletedBookings.map(b => ({
        id: b.id.slice(-6),
        paymentStatus: b.paymentStatus,
        rating: b.rating,
        canRate: canRateBooking(b)
      })));
      
      // Store all bookings data
      setAllBookings(bookingsData);
      
      // Filter bookings based on search query and status
      let filteredBookings = bookingsData;
      
      if (searchQuery) {
        filteredBookings = filteredBookings.filter(booking =>
          booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getDriverName(booking.driver).toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (filterStatus) {
        filteredBookings = filteredBookings.filter(booking => booking.status === filterStatus);
      }

      // Calculate pagination for display
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

      // Update display data
      setBookings(paginatedBookings);
      setTotalBookings(filteredBookings.length);
      setTotalPages(Math.ceil(filteredBookings.length / pageSize));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      errorToast('Failed to fetch bookings');
      // Set empty data on error
      setAllBookings([]);
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

  // Check for payment success in URL params on component mount
  useEffect(() => {
    const checkPaymentSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get('payment_success');
      const bookingId = urlParams.get('booking_id');
      const status = urlParams.get('status');
      const tranId = urlParams.get('tran_id');
      
      // Check multiple possible success indicators
      const isPaymentSuccess = paymentSuccess === 'true' || 
                              paymentSuccess === '1' || 
                              status === 'success' || 
                              status === 'VALID';
      
      if (isPaymentSuccess && bookingId) {
        console.log('Payment success detected for booking:', bookingId, 'Status:', status || paymentSuccess, 'Transaction ID:', tranId);
        
        // Store for rating modal trigger
        localStorage.setItem('pending_rating_booking', bookingId);
        localStorage.setItem('payment_just_completed', 'true');
        localStorage.setItem('payment_transaction_id', tranId || '');
        
        // Clean up URL immediately to prevent duplicate processing
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        
        // Show success message
        successToast('Payment completed successfully! Your trip is now paid. Refreshing your bookings...');
        
        // Force immediate refresh and additional refreshes to ensure backend updates are reflected
        await fetchBookings();
        setTimeout(() => fetchBookings(), 1000);
        setTimeout(() => fetchBookings(), 3000);
        setTimeout(() => fetchBookings(), 5000);
      }
    };
    
    checkPaymentSuccess();
  }, [fetchBookings, successToast]);

  // Check for completed trips that need payment
  useEffect(() => {
    const completedTripsNeedingPayment = allBookings.filter(
      booking => booking.status === 'COMPLETED' && 
                booking.paymentStatus === 'PAYMENT_REQUESTED' && 
                !localStorage.getItem(`payment_notified_${booking.id}`)
    );
    
    if (completedTripsNeedingPayment.length > 0) {
      // Show notification for the first trip needing payment
      const tripToNotify = completedTripsNeedingPayment[0];
      setPaymentRequestBooking(tripToNotify);
      
      // Small delay before showing modal for better UX
      setTimeout(() => {
        setShowPaymentRequestModal(true);
      }, 500);
      
      // Mark as notified to avoid showing again
      localStorage.setItem(`payment_notified_${tripToNotify.id}`, 'true');
    }
  }, [allBookings]);

  // Check for completed payment to show rating modal
  useEffect(() => {
    const pendingRatingBookingId = localStorage.getItem('pending_rating_booking');
    const paymentJustCompleted = localStorage.getItem('payment_just_completed');
    const transactionId = localStorage.getItem('payment_transaction_id');
    
    if (pendingRatingBookingId && allBookings.length > 0) {
      // Look for the booking in all bookings data
      const paidBooking = allBookings.find(booking => 
        booking.id === pendingRatingBookingId
      );
      
      console.log('Checking for paid booking after payment:', {
        bookingId: pendingRatingBookingId.slice(-6),
        transactionId: transactionId?.slice(-6),
        foundBooking: !!paidBooking,
        bookingDetails: paidBooking ? {
          id: paidBooking.id.slice(-6),
          status: paidBooking.status,
          paymentStatus: paidBooking.paymentStatus,
          canRate: canRateBooking(paidBooking),
          rating: paidBooking.rating
        } : null,
        totalBookings: allBookings.length,
        paymentJustCompleted
      });
      
      if (paidBooking) {
        const isPaymentComplete = paidBooking.paymentStatus === 'PAID' || 
                                 paymentJustCompleted === 'true';
        
        // Check if booking is completed and payment is done
        const shouldShowRatingModal = paidBooking.status === 'COMPLETED' && 
                                     isPaymentComplete && 
                                     canRateBooking(paidBooking);
        
        if (shouldShowRatingModal) {
          console.log('Showing rating modal after successful payment:', {
            id: paidBooking.id.slice(-6),
            status: paidBooking.status,
            paymentStatus: paidBooking.paymentStatus,
            canRate: canRateBooking(paidBooking),
            transactionId: transactionId?.slice(-6)
          });
          
          // Clean up localStorage
          localStorage.removeItem('pending_rating_booking');
          localStorage.removeItem('payment_just_completed');
          localStorage.removeItem('payment_transaction_id');
          
          // Show rating modal with delay to ensure UI is ready
          setTimeout(() => {
            setSelectedBooking(paidBooking);
            setShowRatingModal(true);
            successToast('Payment successful! Your trip is now paid. Please rate your driver experience.');
          }, 800);
        } else if (paymentJustCompleted === 'true' && paidBooking.status === 'COMPLETED') {
          // Payment completed but may need more time for status sync
          console.log('Payment completed, waiting for status sync...');
          setTimeout(() => {
            fetchBookings();
          }, 2000);
        }
      } else if (paymentJustCompleted === 'true') {
        // If payment just completed but booking not found, keep refreshing
        console.log('Payment completed but booking not found, continuing to refresh...');
        setTimeout(() => {
          fetchBookings();
        }, 1500);
      }
    }
  }, [allBookings, successToast, fetchBookings]);

  // Auto-fill payment form when payment modal opens
  useEffect(() => {
    if (showPaymentModal && user && selectedBooking) {
      setPaymentData(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone,
        customerAddress: prev.customerAddress || `${selectedBooking.source} to ${selectedBooking.destination}`
      }));
    }
  }, [showPaymentModal, user, selectedBooking]);

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
    // Enhanced validation with detailed logging
    console.log('Rating validation for booking:', {
      id: booking.id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      rating: booking.rating,
      driver: booking.driver,
      canRate: canRateBooking(booking)
    });

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

    // Use centralized validation
    if (!canRateBooking(selectedBooking)) {
      if (selectedBooking.status !== 'COMPLETED') {
        errorToast('Can only rate completed trips');
      } else if (selectedBooking.rating && selectedBooking.rating !== null && selectedBooking.rating !== 0) {
        errorToast('You have already rated this trip');
      } else if (selectedBooking.paymentStatus === 'PAYMENT_REQUESTED') {
        errorToast('Payment must be completed before rating');
      } else {
        errorToast('Unable to rate this trip at the moment');
      }
      return;
    }

    try {
      console.log('Submitting rating for booking:', selectedBooking.id, 'Rating:', rating, 'Payment Status:', selectedBooking.paymentStatus);
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

  const handleContactDriver = async (booking: Booking) => {
    if (getDriverName(booking.driver) === 'Driver Assigned' || !booking.driverId) {
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

  const handlePayForTrip = (booking: Booking) => {
    setSelectedBooking(booking);
    // Pre-fill payment data with current user info
    setPaymentData(prev => ({
      ...prev,
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || '',
      customerAddress: `${booking.source} to ${booking.destination}`
    }));
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedBooking) return;

    setIsPaymentLoading(true);
    try {
      const response = await userApi.payForCompletedTrip(selectedBooking.id, {
        customerInfo: {
          name: paymentData.customerName,
          email: paymentData.customerEmail,
          phone: paymentData.customerPhone,
          address: paymentData.customerAddress,
          city: paymentData.customerCity,
          postCode: paymentData.customerPostCode,
          country: paymentData.customerCountry
        }
      });

      if (response.success && response.data?.gatewayUrl) {
        successToast('Payment initiated! Redirecting to SSLCommerz secure gateway...');
        
        // Store booking ID for post-payment rating
        localStorage.setItem('pending_rating_booking', selectedBooking.id);
        
        // Close payment modal
        setShowPaymentModal(false);
        
        // Redirect to payment gateway
        setTimeout(() => {
          if (response.data?.gatewayUrl) {
            window.location.href = response.data.gatewayUrl;
          }
        }, 1500);
      } else {
        errorToast('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      errorToast('Payment initiation failed. Please check your information and try again.');
    } finally {
      setIsPaymentLoading(false);
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
      render: (value, row) => {
        const driverName = getDriverName(row.driver);
        const driverAvatar = getDriverAvatar(row.driver);
        
        return (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
              {driverAvatar ? (
                <Image
                  src={getImageUrl(driverAvatar)}
                  alt={driverName}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                  unoptimized
                  onError={() => {
                    // Fallback will be handled by Next.js
                  }}
                />
              ) : (
                <UserCircleIcon className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {driverName}
              </div>
              <div className="text-sm text-gray-500">
                {driverName !== 'Driver Assigned' ? 'Assigned Driver' : 'Awaiting Assignment'}
              </div>
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
          <span className="text-sm font-medium text-gray-900">৳{value as number}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value, row) => {
        const statusValue = value as string;
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
                <span className="text-xs text-orange-600 font-medium">Payment Due</span>
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
          {/* Debug logging for rate button visibility */}
          {(() => {
            const canRate = canRateBooking(row);
            console.log('Quick Actions Debug:', {
              bookingId: row.id.slice(-6),
              status: row.status,
              paymentStatus: row.paymentStatus,
              rating: row.rating,
              canRate,
              driver: row.driver,
              conditions: {
                isCompleted: row.status === 'COMPLETED',
                hasNoRating: !row.rating || row.rating === null || row.rating === 0,
                paymentAllowsRating: row.paymentStatus !== 'PAYMENT_REQUESTED'
              }
            });
            return null;
          })()}
          
          {/* Make Payment Button - COMPLETED but payment requested */}
          {row.status === 'COMPLETED' && row.paymentStatus === 'PAYMENT_REQUESTED' && (
            <Button
              size="sm"
              onClick={() => handlePayForTrip(row)}
              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs"
            >
              <CreditCardIcon className="h-3 w-3 mr-1" />
              Pay
            </Button>
          )}
          
          {/* Rate Driver Button - Use centralized logic */}
          {canRateBooking(row) && (
            <Button
              size="sm"
              onClick={() => handleRateDriver(row)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 text-xs"
            >
              <StarIcon className="h-3 w-3 mr-1" />
              Rate
            </Button>
          )}
          
          {/* Contact Driver Button - During active trips */}
          {['CONFIRMED', 'IN_PROGRESS'].includes(row.status) && getDriverName(row.driver) !== 'Driver Assigned' && row.driverId && (
            <Button
              size="sm"
              onClick={() => handleContactDriver(row)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs"
            >
              <PhoneIcon className="h-3 w-3 mr-1" />
              Call
            </Button>
          )}
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
          {/* Payment Due Alert */}
          {allBookings.some(b => b.status === 'COMPLETED' && b.paymentStatus === 'PAYMENT_REQUESTED') && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCardIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">
                      Payment Required
                    </h3>
                    <div className="text-sm text-orange-700 mt-1">
                      You have {allBookings.filter(b => b.status === 'COMPLETED' && b.paymentStatus === 'PAYMENT_REQUESTED').length} completed trip(s) awaiting payment.
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const firstPaymentDue = allBookings.find(b => b.status === 'COMPLETED' && b.paymentStatus === 'PAYMENT_REQUESTED');
                    if (firstPaymentDue) {
                      handlePayForTrip(firstPaymentDue);
                    }
                  }}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Pay Now
                </Button>
              </div>
            </div>
          )}

          {/* Debug Info - Remove in production */}
          {localStorage.getItem('pending_rating_booking') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Debug:</strong> Waiting for payment confirmation for booking: {localStorage.getItem('pending_rating_booking')?.slice(-6)}
                <br />
                All Bookings: {allBookings.length}, Display Bookings: {bookings.length}
                <br />
                Rateable Bookings: {pendingRatings.length}
              </p>
            </div>
          )}

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
                        {allBookings.filter(b => b.status === 'COMPLETED').length}
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
                            <p className="text-sm font-medium text-gray-900">
                              {typeof booking.driver === 'string' ? booking.driver : booking.driver?.name || 'Driver Assigned'}
                            </p>
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
                          Fare: ৳{booking.fare}
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
                      <span className="text-sm text-gray-900">
                        {typeof selectedBooking.driver === 'string' ? selectedBooking.driver : selectedBooking.driver?.name || 'Not Assigned Yet'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {selectedBooking.driver ? 'Assigned Driver' : 'Driver will be assigned soon'}
                      </span>
                    </div>
                    {getDriverName(selectedBooking.driver) !== 'Driver Assigned' && (
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
                        <span className="text-sm text-gray-600">Fare: ৳{selectedBooking.fare}</span>
                    </div>
                    {selectedBooking.paymentStatus && (
                      <div className="flex items-center">
                        <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className={`text-sm font-medium ${
                          selectedBooking.paymentStatus === 'PAID' ? 'text-green-600' :
                          selectedBooking.paymentStatus === 'PAYMENT_REQUESTED' ? 'text-orange-600' :
                          'text-gray-600'
                        }`}>
                          Payment: {selectedBooking.paymentStatus === 'PAID' ? 'Completed' : 
                                  selectedBooking.paymentStatus === 'PAYMENT_REQUESTED' ? 'Pending' : 
                                  selectedBooking.paymentStatus.replace('_', ' ')}
                        </span>
                      </div>
                    )}
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

                {selectedBooking.status === 'COMPLETED' && selectedBooking.paymentStatus === 'PAYMENT_REQUESTED' && (
                  <Button
                    onClick={() => {
                      handlePayForTrip(selectedBooking);
                      setShowViewModal(false);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Pay Now ৳{selectedBooking.fare}
                  </Button>
                )}
                {canRateBooking(selectedBooking) && (
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
                {['CONFIRMED', 'IN_PROGRESS'].includes(selectedBooking.status) && getDriverName(selectedBooking.driver) !== 'Driver Assigned' && selectedBooking.driverId && (
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
                  <p><strong>Fare:</strong> ৳{selectedBooking.fare}</p>
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
              {/* Validation Messages */}
              {selectedBooking.status !== 'COMPLETED' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Trip Not Completed</p>
                      <p className="text-sm text-yellow-600 mt-1">
                        You can only rate completed trips.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedBooking.paymentStatus === 'PAYMENT_REQUESTED' && selectedBooking.status === 'COMPLETED' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <CreditCardIcon className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-orange-800 font-medium">Payment Required</p>
                      <p className="text-sm text-orange-600 mt-1">
                        Please complete your payment before rating the driver.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedBooking.rating && selectedBooking.rating !== null && selectedBooking.rating !== 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <StarIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Already Rated</p>
                      <p className="text-sm text-blue-600 mt-1">
                        You have already rated this trip: {selectedBooking.rating}/5 stars
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Driver Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Driver Information</h4>
                <div className="flex items-center">
                  <UserCircleIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {typeof selectedBooking.driver === 'string' ? selectedBooking.driver : selectedBooking.driver?.name || 'Driver Assigned'}
                    </p>
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
                  disabled={
                    rating === 0 || 
                    !canRateBooking(selectedBooking)
                  }
                  className={`${
                    rating === 0 || 
                    !canRateBooking(selectedBooking)
                      ? 'opacity-50 cursor-not-allowed bg-gray-300' 
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  <StarIcon className="h-4 w-4 mr-2" />
                  {selectedBooking.rating && selectedBooking.rating !== null && selectedBooking.rating !== 0 ? 'Already Rated' : 'Submit Rating'}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Pay for Completed Trip"
          size="md"
        >
          {selectedBooking && (
            <div className="space-y-6">
              {/* Trip Summary */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  Trip Summary
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Booking ID:</span>
                    <span className="font-medium">#{selectedBooking.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Route:</span>
                    <span className="font-medium text-right">{selectedBooking.source} → {selectedBooking.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Driver:</span>
                    <span className="font-medium">
                      {typeof selectedBooking.driver === 'string' ? selectedBooking.driver : selectedBooking.driver?.name || 'Driver Assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed At:</span>
                    <span className="font-medium">{selectedBooking.completedAt ? new Date(selectedBooking.completedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-green-300">
                    <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">৳{selectedBooking.fare}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Payment Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={paymentData.customerName}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={paymentData.customerEmail}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={paymentData.customerPhone}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={paymentData.customerAddress}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, customerAddress: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Payment Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CreditCardIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Secure Payment</p>
                    <p className="text-sm text-blue-600 mt-1">
                      You will be redirected to our secure payment gateway (SSLCommerz) to complete your payment safely.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitPayment}
                  disabled={!paymentData.customerName || !paymentData.customerEmail || !paymentData.customerPhone || isPaymentLoading}
                  className={`${(!paymentData.customerName || !paymentData.customerEmail || !paymentData.customerPhone || isPaymentLoading) ? 'opacity-50 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                  {isPaymentLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="h-4 w-4 mr-2" />
                      Pay ৳{selectedBooking.fare}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Payment Request Notification Modal */}
        <Modal
          isOpen={showPaymentRequestModal}
          onClose={() => setShowPaymentRequestModal(false)}
          title="🚛 Trip Completed - Payment Required"
          size="md"
        >
          {paymentRequestBooking && (
            <div className="space-y-6">
              {/* Trip Completion Notice */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your Trip Has Been Completed!
                </h3>
                <p className="text-sm text-gray-600">
                  Your driver has successfully completed the trip and is now requesting payment.
                </p>
              </div>

              {/* Trip Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Trip Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-medium">#{paymentRequestBooking.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver:</span>
                    <span className="font-medium">
                      {typeof paymentRequestBooking.driver === 'string' ? paymentRequestBooking.driver : paymentRequestBooking.driver?.name || 'Driver Assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-medium text-right">
                      {paymentRequestBooking.source} → {paymentRequestBooking.destination}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">
                      {paymentRequestBooking.completedAt ? 
                        new Date(paymentRequestBooking.completedAt).toLocaleString() : 'Just now'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t">
                    <span>Total Fare:</span>
                    <span>৳{paymentRequestBooking.fare}</span>
                  </div>
                </div>
              </div>

              {/* Payment Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CreditCardIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Secure Payment Process</p>
                    <p className="text-sm text-blue-600 mt-1">
                      After payment, you&apos;ll be able to rate your driver and provide feedback about your experience.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentRequestModal(false)}
                  className="flex-1"
                >
                  I&apos;ll Pay Later
                </Button>
                <Button
                  onClick={() => {
                    setSelectedBooking(paymentRequestBooking);
                    setPaymentData(prev => ({
                      ...prev,
                      customerName: user?.name || '',
                      customerEmail: user?.email || '',
                      customerPhone: user?.phone || '',
                      customerAddress: `${paymentRequestBooking.source} to ${paymentRequestBooking.destination}`
                    }));
                    setShowPaymentRequestModal(false);
                    setShowPaymentModal(true);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Pay Now ৳{paymentRequestBooking.fare}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}