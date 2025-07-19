'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { userApi, Driver } from '@/lib/dashboardApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TruckIcon,
  UserCircleIcon,
  StarIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface BookingForm {
  source: string;
  destination: string;
  date: string;
  time: string;
  truckType: string;
  capacity: number;
  description: string;
  paymentMethod: string;
}

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  rating: number;
  truckType: string;
  capacity: number;
  isAvailable: boolean;
  distance: number;
  estimatedFare: number;
}

export default function NewBookingPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { successToast, errorToast } = useSweetAlert();
  
  // State
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Form data
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    source: '',
    destination: '',
    date: '',
    time: '',
    truckType: '',
    capacity: 1,
    description: '',
    paymentMethod: 'CASH'
  });

  const handleSearchDrivers = async () => {
    if (!bookingForm.source || !bookingForm.destination || !bookingForm.truckType) {
      errorToast('Please fill in all required fields');
      return;
    }

    try {
      setSearching(true);
      
      // Mock API call (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockDrivers: Driver[] = [
        {
          id: '1',
          name: 'John Driver',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          rating: 4.8,
          truckType: 'MINI_TRUCK',
          capacity: 1.5,
          isAvailable: true,
          distance: 2.5,
          estimatedFare: 85
        },
        {
          id: '2',
          name: 'Mike Wilson',
          email: 'mike@example.com',
          phone: '+1 (555) 234-5678',
          rating: 4.5,
          truckType: 'PICKUP',
          capacity: 2.0,
          isAvailable: true,
          distance: 3.2,
          estimatedFare: 95
        },
        {
          id: '3',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1 (555) 345-6789',
          rating: 4.9,
          truckType: 'LORRY',
          capacity: 5.0,
          isAvailable: true,
          distance: 1.8,
          estimatedFare: 120
        },
        {
          id: '4',
          name: 'David Brown',
          email: 'david@example.com',
          phone: '+1 (555) 456-7890',
          rating: 4.2,
          truckType: 'TRUCK',
          capacity: 10.0,
          isAvailable: true,
          distance: 4.1,
          estimatedFare: 150
        }
      ];

      setAvailableDrivers(mockDrivers);
      setShowDriverModal(true);
    } catch (error) {
      console.error('Error searching drivers:', error);
      errorToast('Failed to search for drivers');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(false);
    setShowBookingModal(true);
  };

  const handleCreateBooking = async () => {
    if (!selectedDriver) {
      errorToast('Please select a driver first');
      return;
    }

    try {
      setLoading(true);
      
      // Mock API call (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      successToast('Booking created successfully! Driver will be notified.');
      
      // Reset form
      setBookingForm({
        source: '',
        destination: '',
        date: '',
        time: '',
        truckType: '',
        capacity: 1,
        description: '',
        paymentMethod: 'CASH'
      });
      setSelectedDriver(null);
      setShowBookingModal(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      errorToast('Failed to create booking');
    } finally {
      setLoading(false);
    }
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

  const getTruckTypeIcon = (truckType: string) => {
    return <TruckIcon className="h-5 w-5 text-blue-600" />;
  };

  return (
    <ProtectedRoute requiredRole="USER">
      <DashboardLayout title="New Booking" subtitle="Create a new booking request">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Booking Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source and Destination */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPinIcon className="h-4 w-4 inline mr-1" />
                      Pickup Location *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.source}
                      onChange={(e) => setBookingForm({ ...bookingForm, source: e.target.value })}
                      placeholder="Enter pickup address"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPinIcon className="h-4 w-4 inline mr-1" />
                      Delivery Location *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.destination}
                      onChange={(e) => setBookingForm({ ...bookingForm, destination: e.target.value })}
                      placeholder="Enter delivery address"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="h-4 w-4 inline mr-1" />
                  Preferred Time *
                </label>
                <input
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Truck Type and Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TruckIcon className="h-4 w-4 inline mr-1" />
                  Truck Type *
                </label>
                <select
                  value={bookingForm.truckType}
                  onChange={(e) => setBookingForm({ ...bookingForm, truckType: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select truck type</option>
                  <option value="MINI_TRUCK">Mini Truck (1-2 tons)</option>
                  <option value="PICKUP">Pickup (2-3 tons)</option>
                  <option value="LORRY">Lorry (5-7 tons)</option>
                  <option value="TRUCK">Truck (10+ tons)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                  Required Capacity (tons)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={bookingForm.capacity}
                  onChange={(e) => setBookingForm({ ...bookingForm, capacity: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                  placeholder="Describe what you need to transport..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Payment Method */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['CASH', 'CARD', 'MOBILE_MONEY'].map((method) => (
                    <label key={method} className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={bookingForm.paymentMethod === method}
                        onChange={(e) => setBookingForm({ ...bookingForm, paymentMethod: e.target.value })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{method.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-6">
              <Button
                onClick={handleSearchDrivers}
                disabled={searching || !bookingForm.source || !bookingForm.destination || !bookingForm.truckType}
                className="w-full"
              >
                {searching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching for drivers...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                    Search Available Drivers
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Selected Driver Summary */}
          {selectedDriver && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Driver</h3>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <UserCircleIcon className="h-10 w-10 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedDriver.name}</h4>
                    <p className="text-sm text-gray-600">{selectedDriver.truckType.replace('_', ' ')}</p>
                    {renderStars(selectedDriver.rating)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">${selectedDriver.estimatedFare}</p>
                  <p className="text-sm text-gray-600">{selectedDriver.distance} km away</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Available Drivers Modal */}
        <Modal
          isOpen={showDriverModal}
          onClose={() => setShowDriverModal(false)}
          title="Available Drivers"
          size="xl"
        >
          <div className="space-y-4">
            {availableDrivers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No drivers available for your request</p>
            ) : (
              availableDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleSelectDriver(driver)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserCircleIcon className="h-10 w-10 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">{driver.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{driver.truckType.replace('_', ' ')}</span>
                          <span>{driver.capacity} tons</span>
                          <span>{driver.distance} km away</span>
                        </div>
                        {renderStars(driver.rating)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">${driver.estimatedFare}</p>
                      <p className="text-sm text-green-600">Available</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>

        {/* Confirm Booking Modal */}
        <Modal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          title="Confirm Booking"
          size="lg"
        >
          {selectedDriver && (
            <div className="space-y-6">
              {/* Driver Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Driver Information</h4>
                <div className="flex items-center">
                  <UserCircleIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedDriver.name}</p>
                    <p className="text-sm text-gray-500">{selectedDriver.email}</p>
                    <div className="flex items-center mt-1">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">{selectedDriver.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <TruckIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">{selectedDriver.truckType.replace('_', ' ')}</span>
                  </div>
                  {renderStars(selectedDriver.rating)}
                </div>
              </div>

              {/* Trip Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Trip Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">From</label>
                    <p className="text-sm text-gray-900">{bookingForm.source}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">To</label>
                    <p className="text-sm text-gray-900">{bookingForm.destination}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-sm text-gray-900">{new Date(bookingForm.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="text-sm text-gray-900">{bookingForm.time}</p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Summary</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estimated Fare</span>
                  <span className="text-lg font-medium text-gray-900">${selectedDriver.estimatedFare}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <span className="text-sm text-gray-900">{bookingForm.paymentMethod.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBooking}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 