'use client';

import React from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  CalendarIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  UserCircleIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Chart from '@/components/ui/Chart';

const UserDashboard = () => {
  const stats = [
    {
      name: 'Total Bookings',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: CalendarIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Spent',
      value: '$1,245',
      change: '+15%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Favorite Drivers',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: StarIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Average Rating',
      value: '4.7',
      change: '+0.1',
      changeType: 'positive',
      icon: StarIcon,
      color: 'bg-purple-500'
    }
  ];

  const recentBookings = [
    {
      id: 'BK001',
      driver: 'Mike Smith',
      truck: 'Ford F-150',
      pickup: '123 Main St, Downtown',
      dropoff: '456 Oak Ave, Uptown',
      status: 'completed',
      amount: '$45.00',
      date: '2024-01-15',
      rating: 5
    },
    {
      id: 'BK002',
      driver: 'Sarah Davis',
      truck: 'Chevrolet Silverado',
      pickup: '789 Pine St, Midtown',
      dropoff: '321 Elm St, Westside',
      status: 'active',
      amount: '$38.50',
      date: '2024-01-15',
      rating: null
    },
    {
      id: 'BK003',
      driver: 'Tom Wilson',
      truck: 'Toyota Tacoma',
      pickup: '654 Maple Dr, Eastside',
      dropoff: '987 Cedar Ln, Southside',
      status: 'upcoming',
      amount: '$52.00',
      date: '2024-01-16',
      rating: null
    }
  ];

  const nearbyDrivers = [
    {
      id: 'DR001',
      name: 'Alex Johnson',
      truck: 'Ford F-150',
      rating: 4.8,
      distance: '0.5 km',
      available: true
    },
    {
      id: 'DR002',
      name: 'Maria Garcia',
      truck: 'Chevrolet Silverado',
      rating: 4.9,
      distance: '1.2 km',
      available: true
    },
    {
      id: 'DR003',
      name: 'Carlos Rodriguez',
      truck: 'Toyota Tacoma',
      rating: 4.7,
      distance: '2.1 km',
      available: false
    }
  ];

  const spendingData = [
    { month: 'Jan', amount: 180 },
    { month: 'Feb', amount: 220 },
    { month: 'Mar', amount: 195 },
    { month: 'Apr', amount: 280 },
    { month: 'May', amount: 320 },
    { month: 'Jun', amount: 245 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'active':
        return <ChartBarIcon className="h-4 w-4" />;
      case 'upcoming':
        return <ClockIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <DashboardLayout title="User Dashboard" subtitle="Manage your bookings">
        <div className="space-y-6">
          {/* Quick Search */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Truck Search</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                <input
                  type="text"
                  placeholder="Enter pickup address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Location</label>
                <input
                  type="text"
                  placeholder="Enter dropoff address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Search Trucks
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Spending</h3>
              <Chart
                data={spendingData.map(d => ({
                  label: d.month,
                  value: d.amount,
                  color: '#3b82f6'
                }))}
                type="bar"
              />
            </div>

            {/* Booking Status Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Status</h3>
              <Chart
                data={[
                  { label: 'Completed', value: 18, color: '#22c55e' },
                  { label: 'Active', value: 3, color: '#3b82f6' },
                  { label: 'Upcoming', value: 2, color: '#eab308' },
                  { label: 'Cancelled', value: 1, color: '#ef4444' }
                ]}
                type="pie"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.id}</div>
                            <div className="text-sm text-gray-500">{booking.date}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.driver}</div>
                            <div className="text-sm text-gray-500">{booking.truck}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{booking.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.amount}</div>
                          {booking.rating && (
                            <div className="flex items-center text-sm text-gray-500">
                              <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                              {booking.rating}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nearby Drivers */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Nearby Drivers</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {nearbyDrivers.map((driver) => (
                    <div key={driver.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <UserCircleIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                          <p className="text-sm text-gray-500">{driver.truck}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                            {driver.rating}
                            <span className="mx-2">•</span>
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {driver.distance}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          driver.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {driver.available ? 'Available' : 'Busy'}
                        </span>
                        <button className="text-blue-600 hover:text-blue-900">
                          <PhoneIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Find Truck
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Book Now
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                <HeartIcon className="h-5 w-5 mr-2" />
                Favorites
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                View History
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default UserDashboard; 