'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Truck, MapPin, DollarSign, Loader2, CheckCircle, AlertCircle, CreditCard, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { apiClient } from '@/lib/api';
import { Driver } from '@/types';
import { useAppSelector } from '@/hooks/redux';
import DynamicMap from '@/components/ui/DynamicMap';

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
  shippingMethod: string;
}

interface AreaData {
  value: string;
  label: string;
  area: string;
  latitude: number;
  longitude: number;
}

interface ServerArea {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  address: string;
}

export default function BookingModal({ driver, isOpen, onClose, onBookingComplete }: BookingModalProps) {
  const { errorToast, successToast, question } = useSweetAlert();
  const { user } = useAppSelector((state) => state.auth);
  
  // Debug: Log user data
  console.log('BookingModal - Redux user data:', user);
  
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
    customerCountry: 'Bangladesh',
    shippingMethod: 'Truck'
  });

  // UI states
  const [step, setStep] = useState<'booking' | 'payment' | 'processing' | 'success' | 'error'>('booking');
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedFare, setCalculatedFare] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Selected area coordinates
  const [selectedSourceArea, setSelectedSourceArea] = useState<AreaData | null>(null);
  const [selectedDestinationArea, setSelectedDestinationArea] = useState<AreaData | null>(null);
  
  const [areaOptions, setAreaOptions] = useState<AreaData[]>([]);
  const [sourceQuery, setSourceQuery] = useState<string>('');
  const [destinationQuery, setDestinationQuery] = useState<string>('');
  
  // Route details for map preview
  const [routeDetails, setRouteDetails] = useState<{
    distance: number;
    duration: number;
    routeGeometry: string;
    waypoints: Array<{ latitude: number; longitude: number }>;
  } | null>(null);

  // Pre-fill user info from Redux
  useEffect(() => {
    if (user) {
      console.log('Setting payment data with user:', user);
      setPaymentData(prev => ({
        ...prev,
        customerName: user.name || '',
        customerEmail: user.email || '',
        customerPhone: user.phone || '',
        shippingMethod: 'Truck'
      }));
    } else {
      console.log('No user data available from Redux');
    }
  }, [user]);

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
        customerCountry: 'Bangladesh',
        shippingMethod: 'Truck'
      });
      setCalculatedFare(0);
      setBookingId(null);
      // route details removed
      setSelectedSourceArea(null);
      setSelectedDestinationArea(null);
      setPaymentError(null);
    } else {
      // Ensure calculated fare is reset when modal closes
      setCalculatedFare(0);
      // route details removed
    }
  }, [isOpen]);

  // Load Dhaka areas for dropdown search (server provides all Dhaka areas)
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const res = await apiClient.getDhakaAreas(undefined, 500);
        if (res?.success && Array.isArray(res.data)) {
          setAreaOptions(
            res.data.map((a: ServerArea) => ({
              value: a.id,
              label: `${a.name}, ${a.city}`,
              area: a.address,
              latitude: a.latitude,
              longitude: a.longitude,
            }))
          );
        }
      } catch {
        // ignore
      }
    };
    if (isOpen) loadAreas();
  }, [isOpen]);

  // Calculate fare when selected areas change

  const fetchRouteDetails = useCallback(async () => {
    try {
      if (!selectedSourceArea || !selectedDestinationArea) {
        return;
      }

      const response = await apiClient.getRouteDetails(
        {
          latitude: selectedSourceArea.latitude,
          longitude: selectedSourceArea.longitude,
          address: bookingData.source
        },
        {
          latitude: selectedDestinationArea.latitude,
          longitude: selectedDestinationArea.longitude,
          address: bookingData.destination
        }
      );
      if (response.success && response.data) {
        setRouteDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching route details:', error);
    }
  }, [selectedSourceArea, selectedDestinationArea, bookingData.source, bookingData.destination]);

  const calculateFare = useCallback(async () => {
    try {
      // Use coordinates from selected areas if available
      if (!selectedSourceArea || !selectedDestinationArea) {
        return; // Don't calculate if areas aren't selected
      }
      
      // Fetch route details for map display
      await fetchRouteDetails();
      
      const response = await apiClient.calculateFare({
        source: {
          latitude: selectedSourceArea.latitude,
          longitude: selectedSourceArea.longitude,
          address: bookingData.source
        },
        destination: {
          latitude: selectedDestinationArea.latitude,
          longitude: selectedDestinationArea.longitude,
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
          sourceLat: selectedSourceArea.latitude,
          sourceLng: selectedSourceArea.longitude,
          destLat: selectedDestinationArea.latitude,
          destLng: selectedDestinationArea.longitude
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
  }, [selectedSourceArea, selectedDestinationArea, bookingData.source, bookingData.destination, driver, fetchRouteDetails]);

  // Calculate fare when selected areas change
  useEffect(() => {
    if (selectedSourceArea && selectedDestinationArea && driver) {
      void calculateFare();
    }
  }, [selectedSourceArea, selectedDestinationArea, driver, calculateFare]);

  const handleBookingSubmit = async () => {
    if (!driver) return;

    // Debug: Check authentication status
    console.log('Booking submit - Authentication check:', {
      isAuthenticated: !!user,
      user: user,
      token: localStorage.getItem('token'),
      tokenLength: localStorage.getItem('token')?.length
    });

    // Check if user is authenticated
    if (!user || !localStorage.getItem('token')) {
      errorToast('Please login to create a booking');
      return;
    }

    // Validate booking data
    if (!bookingData.source || !bookingData.destination || !bookingData.pickupTime) {
      errorToast('Please fill in all required fields');
      return;
    }

    if (calculatedFare <= 0) {
      errorToast('Please enter valid source and destination to calculate fare');
      return;
    }

    // Auto-populate shipping information based on booking details
    const sourceCity = extractCityFromLocation(bookingData.source);
    const destCity = extractCityFromLocation(bookingData.destination);
    
    setPaymentData(prev => ({
      ...prev,
      customerCity: sourceCity || destCity || '',
      customerAddress: `${bookingData.source} to ${bookingData.destination}`,
      customerPostCode: '1000', // Default postal code for Bangladesh
      customerCountry: 'Bangladesh'
    }));

    // Debug: Log the current state
    console.log('Booking submit - User data:', user);
    console.log('Booking submit - Payment data:', paymentData);

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
        console.log('Booking created successfully:', {
          bookingId: bookingData.id,
          response: response
        });
        setBookingId(bookingData.id);
        setStep('payment');
        successToast('Booking created successfully! Please proceed with payment.');
      } else {
        console.error('Booking creation failed:', response);
        errorToast(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      errorToast('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Map selector handlers removed

  // Helper function to extract city from location string
  const extractCityFromLocation = (location: string): string => {
    if (!location) return '';
    
    // Common cities in Bangladesh
    const cities = [
      'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 
      'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Narayanganj',
      'Gazipur', 'Tangail', 'Bogra', 'Kushtia', 'Jessore'
    ];
    
    for (const city of cities) {
      if (location.toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
    
    // If no city found, try to extract from the location string
    const parts = location.split(',').map(part => part.trim());
    return parts[0] || '';
  };

  const handlePaymentSubmit = async () => {
    if (!bookingId) return;

    // Debug: Check booking ID and authentication
    console.log('Payment submit - Debug info:', {
      bookingId: bookingId,
      isAuthenticated: !!user,
      user: user,
      token: localStorage.getItem('token')
    });

    // Get the actual values (from Redux user or paymentData)
    const customerName = user?.name || paymentData.customerName;
    const customerEmail = user?.email || paymentData.customerEmail;
    const customerPhone = user?.phone || paymentData.customerPhone;

    // Validate payment data
    if (!customerName || !customerEmail || !customerPhone) {
      errorToast('Please fill in all required payment information');
      return;
    }

    setIsLoading(true);
    setStep('processing');
    setPaymentError(null);

    try {
      // Use the new SSLCommerz service
      const paymentRequest = {
        bookingId,
        customerInfo: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: paymentData.customerAddress,
          city: paymentData.customerCity,
          postCode: paymentData.customerPostCode,
          country: paymentData.customerCountry
        }
      };

      console.log('Initiating SSLCommerz payment with:', paymentRequest);
      const response = await apiClient.initiateSSLCommerzPayment(paymentRequest);
      console.log('SSLCommerz payment response:', response);

      if (response.success && response.data && response.data.gatewayUrl) {
        // Show success message before redirect
        successToast('Redirecting to secure payment gateway...');
        
        // Small delay to show the message
        setTimeout(() => {
          // Redirect to SSLCommerz payment gateway
          window.location.href = response.data!.gatewayUrl;
        }, 1000);
      } else {
        console.error('SSLCommerz payment initiation failed:', response);
        throw new Error(response.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error initiating SSLCommerz payment:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('Booking not found')) {
          errorToast('Booking not found. Please create a new booking.');
          setStep('booking');
          setBookingId(null);
        } else if (error.message.includes('SSLCommerz')) {
          setPaymentError('Payment gateway is currently unavailable. Please try again later.');
          setStep('error');
        } else {
          setPaymentError(error.message || 'Failed to process payment. Please try again.');
          setStep('error');
        }
      } else {
        setPaymentError('An unexpected error occurred. Please try again.');
        setStep('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    if (step === 'processing') {
      return; // Don't allow closing during payment processing
    }

    if (step === 'booking' && (bookingData.source || bookingData.destination || calculatedFare > 0)) {
      // Use SweetAlert confirmation
      const result = await question(
        'Are you sure you want to cancel this booking? All entered data will be lost.',
        'Cancel Booking'
      );
      
      if (result.isConfirmed) {
        // Reset all form data and calculated fare
        setBookingData({
          source: '',
          destination: '',
          pickupTime: '',
          fare: 0,
          distance: 0
        });
        setCalculatedFare(0);
        setBookingId(null);
        onClose();
      }
    } else {
      // Reset calculated fare even if no data entered
      setCalculatedFare(0);
      onClose();
    }
  };

  if (!isOpen || !driver) return null;

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-10 flex items-center justify-center z-50 p-4">
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
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bookingData.source}
                      onChange={(e) => {
                        setBookingData(prev => ({ ...prev, source: e.target.value }));
                        setSourceQuery(e.target.value);
                      }}
                      placeholder="Type to search Dhaka locations..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                       
                        {areaOptions.length > 0 && sourceQuery && (
                          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-white text-gray-700 shadow">
                            {areaOptions
                              .filter((opt) => opt.label.toLowerCase().includes(sourceQuery.toLowerCase()) || opt.area.toLowerCase().includes(sourceQuery.toLowerCase()))
                              .slice(0, 50)
                              .map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    setBookingData(prev => ({ ...prev, source: opt.area }));
                                    setSelectedSourceArea(opt);
                                    setSourceQuery('');
                                  }}
                                  className="block w-full px-3 py-2 text-left hover:bg-gray-50"
                                >
                                  {opt.label}
                                </button>
                              ))}
                          </div>
                        )}
                  </div>
                </div>

                {/* Destination */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bookingData.destination}
                      onChange={(e) => {
                        setBookingData(prev => ({ ...prev, destination: e.target.value }));
                        setDestinationQuery(e.target.value);
                      }}
                      placeholder="Type to search Dhaka locations..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                        {areaOptions.length > 0 && destinationQuery && (
                          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-white text-gray-700 shadow">
                            {areaOptions
                              .filter((opt) => opt.label.toLowerCase().includes(destinationQuery.toLowerCase()) || opt.area.toLowerCase().includes(destinationQuery.toLowerCase()))
                              .slice(0, 50)
                              .map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    setBookingData(prev => ({ ...prev, destination: opt.area }));
                                    setSelectedDestinationArea(opt);
                                    setDestinationQuery('');
                                  }}
                                  className="block w-full px-3 py-2 text-left hover:bg-gray-50"
                                >
                                  {opt.label}
                                </button>
                              ))}
                          </div>
                        )}
                  </div>
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

              {/* Map Preview below selections */}
              {selectedSourceArea && selectedDestinationArea && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Route Preview</h4>
                  <DynamicMap
                    sourceLat={selectedSourceArea.latitude}
                    sourceLng={selectedSourceArea.longitude}
                    destLat={selectedDestinationArea.latitude}
                    destLng={selectedDestinationArea.longitude}
                    routeGeometry={routeDetails?.routeGeometry}
                    className="h-48 w-full rounded-md"
                  />
                  {routeDetails && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Distance: {routeDetails.distance.toFixed(1)} km</p>
                      <p>Estimated Time: {Math.round(routeDetails.duration)} minutes</p>
                    </div>
                  )}
                </div>
              )}

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
              {/* Payment Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800 mb-1">Secure Payment</h3>
                    <p className="text-sm text-green-700">
                      Your payment will be processed securely through SSLCommerz, a trusted payment gateway in Bangladesh. 
                      All your financial information is encrypted and protected.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Information - Read Only */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Customer Information</h3>
                  {user ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Auto-filled from account
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Manual entry required
                    </span>
                  )}
                </div>
                
                {user ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user.name || ''}
                          disabled
                          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed text-gray-700"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={user.phone || ''}
                        disabled
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed text-gray-700"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">User information not available</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
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
                        <label className="block text-sm font-medium text-gray-600 mb-1">
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

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
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
                  </div>
                )}
              </div>

              {/* Shipping Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Shipping Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={paymentData.customerCity}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, customerCity: e.target.value }))}
                      placeholder="Auto-filled from booking location"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                    />
                    <p className="text-xs text-blue-600 mt-1">Auto-detected from pickup/destination location</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={paymentData.customerPostCode}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, customerPostCode: e.target.value }))}
                      placeholder="Default: 1000"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                    />
                    <p className="text-xs text-blue-600 mt-1">Default postal code for Bangladesh</p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={paymentData.customerAddress}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, customerAddress: e.target.value }))}
                    placeholder="Auto-filled from booking route"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                  />
                  <p className="text-xs text-blue-600 mt-1">Auto-filled: {bookingData.source} to {bookingData.destination}</p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={paymentData.customerCountry}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed text-gray-700"
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
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Payment
                    </>
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
              <p className="text-gray-600 mb-4">Please wait while we redirect you to the secure payment gateway...</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Shield className="w-4 h-4" />
                  <span>Your payment is being processed securely through SSLCommerz</span>
                </div>
              </div>
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
              {paymentError && (
                <p className="text-gray-600 mb-4">{paymentError}</p>
              )}
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

      {/* Map Selectors removed */}
    </div>
  );
} 