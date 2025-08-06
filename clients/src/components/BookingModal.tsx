'use client';

import { useState, useEffect } from 'react';
import { X, Truck, MapPin, DollarSign, CreditCard, Loader2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { apiClient } from '@/lib/api';
import { Driver } from '@/types';

interface BookingModalProps {
  driver: Driver | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
}

interface BookingFormData {
  source: string;
  destination: string;
  pickupTime: string;
  fare: number;
  distance: number;
  sourceLat?: number;
  sourceLng?: number;
  destLat?: number;
  destLng?: number;
}

interface PaymentFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerPostCode: string;
  customerCountry: string;
}

interface AreaData {
  value: string;
  label: string;
  area: string;
}

export default function BookingModal({ driver, isOpen, onClose, onBookingComplete }: BookingModalProps) {
  const { errorToast } = useSweetAlert();
  
  // Form states
  const [bookingData, setBookingData] = useState<BookingFormData>({
    source: '',
    destination: '',
    pickupTime: '',
    fare: 0,
    distance: 0
  });
  
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    customerPostCode: '',
    customerCountry: 'Bangladesh'
  });

  // UI states
  const [step, setStep] = useState<'booking' | 'payment' | 'processing' | 'success' | 'error'>('booking');
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedFare, setCalculatedFare] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Area dropdown states
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [filteredSourceAreas, setFilteredSourceAreas] = useState<AreaData[]>([]);
  const [filteredDestinationAreas, setFilteredDestinationAreas] = useState<AreaData[]>([]);

  // Load areas from API
  useEffect(() => {
    const loadAreas = async () => {
      try {
        setIsLoadingAreas(true);
        const response = await apiClient.getAreasForDropdown();
        if (response.success && response.data) {
          setAreas(response.data);
          setFilteredSourceAreas(response.data);
          setFilteredDestinationAreas(response.data);
        }
      } catch (error) {
        console.error('Error loading areas:', error);
        errorToast('Failed to load areas');
      } finally {
        setIsLoadingAreas(false);
      }
    };

    loadAreas();
  }, [errorToast]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.location-dropdown')) {
        setShowSourceDropdown(false);
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('booking');
      setBookingData({
        source: '',
        destination: '',
        pickupTime: '',
        fare: 0,
        distance: 0
      });
      setPaymentData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        customerCity: '',
        customerPostCode: '',
        customerCountry: 'Bangladesh'
      });
      setCalculatedFare(0);
      setBookingId(null);
    }
  }, [isOpen]);

  // Calculate fare when source/destination changes
  useEffect(() => {
    if (bookingData.source && bookingData.destination && driver) {
      calculateFare();
    }
  }, [bookingData.source, bookingData.destination, driver]);

  const calculateFare = async () => {
    try {
      // For now, use default coordinates for Dhaka
      // In a real implementation, you would use a geocoding service to convert addresses to coordinates
      const defaultSourceCoords = { latitude: 23.8103, longitude: 90.4125 }; // Dhaka center
      const defaultDestCoords = { latitude: 23.7937, longitude: 90.4066 }; // Dhaka center (slightly different)
      
      const response = await apiClient.calculateFare({
        source: {
          latitude: defaultSourceCoords.latitude,
          longitude: defaultSourceCoords.longitude,
          address: bookingData.source
        },
        destination: {
          latitude: defaultDestCoords.latitude,
          longitude: defaultDestCoords.longitude,
          address: bookingData.destination
        },
        truckType: driver!.truckType
      });

      if (response.success && response.data) {
        const fareData = response.data;
        setCalculatedFare(fareData.totalFare);
        setBookingData(prev => ({
          ...prev,
          fare: fareData.totalFare,
          distance: fareData.distance,
          sourceLat: defaultSourceCoords.latitude,
          sourceLng: defaultSourceCoords.longitude,
          destLat: defaultDestCoords.latitude,
          destLng: defaultDestCoords.longitude
        }));
      }
    } catch (error) {
      console.error('Error calculating fare:', error);
      // Set a default fare if calculation fails
      setCalculatedFare(500); // Default 500 BDT
      setBookingData(prev => ({
        ...prev,
        fare: 500,
        distance: 10 // Default 10 km
      }));
    }
  };

  const handleBookingSubmit = async () => {
    if (!driver) return;

    // Validate booking data
    if (!bookingData.source || !bookingData.destination || !bookingData.pickupTime) {
      errorToast('Please fill in all required fields');
      return;
    }

    if (calculatedFare <= 0) {
      errorToast('Please enter valid source and destination to calculate fare');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.createBooking({
        driverId: driver.id,
        source: bookingData.source,
        destination: bookingData.destination,
        sourceLat: bookingData.sourceLat,
        sourceLng: bookingData.sourceLng,
        destLat: bookingData.destLat,
        destLng: bookingData.destLng,
        distance: bookingData.distance,
        fare: calculatedFare
      });

      if (response.success && response.data) {
        const bookingData = response.data as { id: string };
        setBookingId(bookingData.id);
        setStep('payment');
      } else {
        errorToast(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      errorToast('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!bookingId) return;

    // Validate payment data
    if (!paymentData.customerName || !paymentData.customerEmail || !paymentData.customerPhone) {
      errorToast('Please fill in all required payment information');
      return;
    }

    setIsLoading(true);
    setStep('processing');

    try {
      const baseUrl = window.location.origin;
      const paymentRequest = {
        bookingId,
        amount: calculatedFare,
        currency: 'BDT',
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        customerPhone: paymentData.customerPhone,
        customerAddress: paymentData.customerAddress,
        customerCity: paymentData.customerCity,
        customerPostCode: paymentData.customerPostCode,
        customerCountry: paymentData.customerCountry,
        successUrl: `${baseUrl}/api/payment/success`,
        failUrl: `${baseUrl}/api/payment/fail`,
        cancelUrl: `${baseUrl}/api/payment/cancel`,
        ipnUrl: `${baseUrl}/api/payment/ipn`
      };

      const response = await apiClient.createPaymentSession(paymentRequest);

      if (response.success && response.data?.redirectUrl) {
        // Redirect to SSLCommerz payment gateway
        window.location.href = response.data.redirectUrl;
      } else {
        throw new Error(response.message || 'Failed to create payment session');
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      setStep('error');
      errorToast('Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'processing') {
      return; // Don't allow closing during payment processing
    }

    if (step === 'booking' && (bookingData.source || bookingData.destination)) {
      // Simple confirmation - in a real app you'd use a proper confirmation dialog
      if (window.confirm('Are you sure you want to cancel this booking? All entered data will be lost.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen || !driver) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'booking' && 'Book Truck'}
            {step === 'payment' && 'Payment Information'}
            {step === 'processing' && 'Processing Payment'}
            {step === 'success' && 'Booking Successful'}
            {step === 'error' && 'Payment Error'}
          </h2>
          {step !== 'processing' && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Driver Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{driver.user.name}</h3>
                <p className="text-sm text-gray-600">{driver.truckType.replace('_', ' ')} • {driver.capacity} tons</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{driver.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          {step === 'booking' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pickup Location */}
                <div className="relative location-dropdown">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bookingData.source}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBookingData(prev => ({ ...prev, source: value }));
                        const filtered = areas.filter((area: AreaData) => 
                          area.label.toLowerCase().includes(value.toLowerCase())
                        );
                        setFilteredSourceAreas(filtered);
                        setShowSourceDropdown(true);
                      }}
                      onFocus={() => setShowSourceDropdown(true)}
                      placeholder={isLoadingAreas ? "Loading areas..." : "Enter pickup location..."}
                      disabled={isLoadingAreas}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {isLoadingAreas ? (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Source Dropdown */}
                  {showSourceDropdown && (
                    <div className="location-dropdown absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredSourceAreas.length > 0 ? (
                        filteredSourceAreas.map((area) => (
                          <button
                            key={area.value}
                            onClick={() => {
                              setBookingData(prev => ({ ...prev, source: area.label }));
                              setShowSourceDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            <div className="font-medium text-gray-900">{area.label}</div>
                            <div className="text-sm text-gray-500">{area.area}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">No locations found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Destination */}
                <div className="relative location-dropdown">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bookingData.destination}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBookingData(prev => ({ ...prev, destination: value }));
                        const filtered = areas.filter((area: AreaData) => 
                          area.label.toLowerCase().includes(value.toLowerCase())
                        );
                        setFilteredDestinationAreas(filtered);
                        setShowDestinationDropdown(true);
                      }}
                      onFocus={() => setShowDestinationDropdown(true)}
                      placeholder={isLoadingAreas ? "Loading areas..." : "Enter destination..."}
                      disabled={isLoadingAreas}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {isLoadingAreas ? (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Destination Dropdown */}
                  {showDestinationDropdown && (
                    <div className="location-dropdown absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredDestinationAreas.length > 0 ? (
                        filteredDestinationAreas.map((area) => (
                          <button
                            key={area.value}
                            onClick={() => {
                              setBookingData(prev => ({ ...prev, destination: area.label }));
                              setShowDestinationDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            <div className="font-medium text-gray-900">{area.label}</div>
                            <div className="text-sm text-gray-500">{area.area}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">No locations found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Time *
                </label>
                <input
                  type="datetime-local"
                  value={bookingData.pickupTime}
                  onChange={(e) => setBookingData(prev => ({ ...prev, pickupTime: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fare Display */}
              {calculatedFare > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Estimated Fare</p>
                      <p className="text-2xl font-bold text-blue-600">৳{calculatedFare.toLocaleString()}</p>
                      {bookingData.distance > 0 && (
                        <p className="text-sm text-gray-500">Distance: {bookingData.distance.toFixed(1)} km</p>
                      )}
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleBookingSubmit}
                  disabled={isLoading || calculatedFare <= 0}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    You will be redirected to SSLCommerz secure payment gateway
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={paymentData.customerName}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter your full name"
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
                    placeholder="Enter your email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={paymentData.customerPhone}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={paymentData.customerCity}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, customerCity: e.target.value }))}
                    placeholder="Enter your city"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={paymentData.customerAddress}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, customerAddress: e.target.value }))}
                  placeholder="Enter your address"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={paymentData.customerPostCode}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, customerPostCode: e.target.value }))}
                    placeholder="Enter postal code"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={paymentData.customerCountry}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, customerCountry: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">৳{calculatedFare.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handlePaymentSubmit}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
                <Button
                  onClick={() => setStep('booking')}
                  variant="outline"
                  disabled={isLoading}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we redirect you to the payment gateway...</p>
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-6">Your booking has been confirmed and payment processed successfully.</p>
              <Button
                onClick={() => {
                  onBookingComplete();
                  onClose();
                }}
                className="w-full"
              >
                View My Bookings
              </Button>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-6">There was an error processing your payment. Please try again.</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('payment')}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 