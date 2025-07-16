'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import DashboardLayout from '@/components/ui/DashboardLayout';
import SecureRouteGuard from '@/components/auth/SecureRouteGuard';
import { driverApi, DriverStats, Earnings, Booking } from '@/lib/dashboardApi';
import { 
  CurrencyDollarIcon, 
  CalendarIcon,
  StarIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapIcon,
  ChartBarIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

interface DriverDashboardProps {}

export default function DriverDashboard({}: DriverDashboardProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, earningsData, bookingsData] = await Promise.all([
          driverApi.getDriverStats(),
          driverApi.getEarnings(),
          driverApi.getRecentBookings()
        ]);
        
        setStats(statsData);
        setEarnings(earningsData);
        setRecentBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleToggleAvailability = async () => {
    try {
      await driverApi.updateAvailability(!isAvailable);
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await driverApi.acceptBooking(bookingId);
      // Refresh recent bookings
      const bookings = await driverApi.getRecentBookings();
      setRecentBookings(bookings);
    } catch (error) {
      console.error('Error accepting booking:', error);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      await driverApi.declineBooking(bookingId);
      // Refresh recent bookings
      const bookings = await driverApi.getRecentBookings();
      setRecentBookings(bookings);
    } catch (error) {
      console.error('Error declining booking:', error);
    }
  };

  return (
    <SecureRouteGuard requiredRole="DRIVER">
      <DashboardLayout title="Driver Dashboard" subtitle={`Welcome back, ${user?.name}`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Availability Toggle */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Availability Status</h3>
                  <p className="text-sm text-gray-600">
                    {isAvailable ? 'You are currently available for bookings' : 'You are currently offline'}
                  </p>
                </div>
                <button
                  onClick={handleToggleAvailability}
                  className={`flex items-center px-4 py-2 rounded-md text-white font-medium ${
                    isAvailable 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isAvailable ? (
                    <>
                      <PauseIcon className="h-4 w-4 mr-2" />
                      Go Offline
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Go Online
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Trips</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalTrips || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <StarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.completionRate?.toFixed(1) || 0}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.responseTime || '0 min'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Overview */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-500 mr-2" />
                  Earnings Overview
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Today</p>
                    <p className="text-2xl font-bold text-gray-900">${earnings?.today?.toFixed(2) || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">${earnings?.thisWeek?.toFixed(2) || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">${earnings?.thisMonth?.toFixed(2) || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">${earnings?.totalEarnings?.toFixed(2) || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                  Recent Bookings
                </h3>
              </div>
              <div className="p-6">
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No recent bookings</p>
                    <p className="text-sm text-gray-400">New booking requests will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900">
                              {booking.source} → {booking.destination}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">${booking.fare}</p>
                          <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                          {booking.pickupTime && (
                            <p className="text-sm text-gray-500">Pickup: {new Date(booking.pickupTime).toLocaleString()}</p>
                          )}
                        </div>
                        {booking.status === 'PENDING' && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleAcceptBooking(booking.id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineBooking(booking.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </SecureRouteGuard>
  );
} 