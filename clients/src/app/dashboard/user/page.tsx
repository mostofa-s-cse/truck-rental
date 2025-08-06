'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { userApi, UserStats, Driver, Booking } from '@/lib/dashboardApi';
import { 
  CalendarIcon, 
  CurrencyDollarIcon,
  StarIcon,
  TruckIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Component props interface - currently no props needed
type UserDashboardProps = Record<string, never>;

export default function UserDashboard({}: UserDashboardProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    location: '',
    truckType: '',
    capacity: ''
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, bookingsData, driversData] = await Promise.all([
          userApi.getUserStats(),
          userApi.getRecentBookings(),
          userApi.getNearbyDrivers()
        ]);
        
        setStats(statsData);
        setRecentBookings(bookingsData);
        setNearbyDrivers(driversData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSearchDrivers = async () => {
    try {
      const drivers = await userApi.searchDrivers(searchParams);
      setNearbyDrivers(drivers);
    } catch (error) {
      console.error('Error searching drivers:', error);
    }
  };

  const handleCalculateFare = async (driverId: string, source: string, destination: string, truckType: string) => {
    try {
      const result = await userApi.calculateFare({ source, destination, truckType });
      // Handle fare calculation result
      console.log('Fare calculation:', result);
    } catch (error) {
      console.error('Error calculating fare:', error);
    }
  };

  return (
    <ProtectedRoute requiredRole="USER">
      <DashboardLayout title="User Dashboard" subtitle={`Welcome back, ${user?.name}`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">${stats?.totalSpent?.toFixed(2) || 0}</p>
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
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TruckIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Favorite Drivers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.favoriteDrivers || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Drivers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 text-blue-500 mr-2" />
                Search Drivers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Location"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={searchParams.truckType}
                  onChange={(e) => setSearchParams({ ...searchParams, truckType: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Truck Types</option>
                  <option value="MINI_TRUCK">Mini Truck</option>
                  <option value="PICKUP">Pickup</option>
                  <option value="LORRY">Lorry</option>
                  <option value="TRUCK">Truck</option>
                </select>
                <select
                  value={searchParams.capacity}
                  onChange={(e) => setSearchParams({ ...searchParams, capacity: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Capacities</option>
                  <option value="1">1 ton</option>
                  <option value="2">2 tons</option>
                  <option value="5">5 tons</option>
                  <option value="10">10+ tons</option>
                </select>
                <button
                  onClick={handleSearchDrivers}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Available Drivers */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <TruckIcon className="h-5 w-5 text-green-500 mr-2" />
                  Available Drivers ({nearbyDrivers.length})
                </h3>
              </div>
              <div className="p-6">
                {nearbyDrivers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No drivers available in your area</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nearbyDrivers.slice(0, 6).map((driver) => (
                      <div key={driver.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{driver.name}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            driver.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {driver.isAvailable ? 'Available' : 'Busy'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{driver.truckType} • {driver.capacity} tons</p>
                        <div className="flex items-center mb-2">
                          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">{driver.rating} ({driver.distance}km away)</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{driver.location}</p>
                        <button
                          onClick={() => handleCalculateFare(driver.id, '', '', driver.truckType)}
                          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                    <p className="text-gray-500 mb-4">No bookings yet</p>
                    <a
                      href="/search"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Book Your First Trip
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.source} → {booking.destination}
                          </p>
                          <p className="text-sm text-gray-600">${booking.fare}</p>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
} 