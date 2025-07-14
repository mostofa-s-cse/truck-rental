'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  TruckIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  MapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Chart from '@/components/ui/Chart';

const DriverDashboard = () => {
  const [isAvailable, setIsAvailable] = useState(true);

  const stats = [
    {
      name: 'Today\'s Earnings',
      value: '$156.50',
      change: '+12%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Active Bookings',
      value: '3',
      change: '2 new',
      changeType: 'neutral',
      icon: CalendarIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Rating',
      value: '4.8',
      change: '+0.2',
      changeType: 'positive',
      icon: StarIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Online Hours',
      value: '8.5h',
      change: 'Today',
      changeType: 'neutral',
      icon: ClockIcon,
      color: 'bg-purple-500'
    }
  ];

  const recentBookings = [
    {
      id: 'BK001',
      customer: 'John Doe',
      pickup: '123 Main St, Downtown',
      dropoff: '456 Oak Ave, Uptown',
      status: 'active',
      amount: '$45.00',
      time: '2:30 PM'
    },
    {
      id: 'BK002',
      customer: 'Jane Smith',
      pickup: '789 Pine St, Midtown',
      dropoff: '321 Elm St, Westside',
      status: 'pending',
      amount: '$38.50',
      time: '4:15 PM'
    },
    {
      id: 'BK003',
      customer: 'Bob Johnson',
      pickup: '654 Maple Dr, Eastside',
      dropoff: '987 Cedar Ln, Southside',
      status: 'completed',
      amount: '$52.00',
      time: '1:20 PM'
    }
  ];

  const earningsData = [
    {
      day: 'Mon',
      amount: 45.00
    },
    {
      day: 'Tue',
      amount: 67.50
    },
    {
      day: 'Wed',
      amount: 38.00
    },
    {
      day: 'Thu',
      amount: 89.25
    },
    {
      day: 'Fri',
      amount: 156.50
    },
    {
      day: 'Sat',
      amount: 0
    },
    {
      day: 'Sun',
      amount: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
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
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'active':
        return <ChartBarIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <DashboardLayout title="Driver Dashboard" subtitle="Manage your deliveries">
        <div className="space-y-6">
          {/* Availability Toggle */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {isAvailable ? 'Available for Bookings' : 'Currently Offline'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isAvailable ? 'You are receiving booking requests' : 'You are not receiving new requests'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isAvailable 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isAvailable ? 'Go Offline' : 'Go Online'}
              </button>
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
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Earnings</h3>
              <Chart
                data={earningsData.map(d => ({
                  label: d.day,
                  value: d.amount,
                  color: '#22c55e'
                }))}
                type="line"
              />
            </div>

            {/* Rating Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Ratings</h3>
              <Chart
                data={[
                  { label: '5★', value: 65, color: '#22c55e' },
                  { label: '4★', value: 20, color: '#3b82f6' },
                  { label: '3★', value: 10, color: '#eab308' },
                  { label: '2★', value: 3, color: '#f97316' },
                  { label: '1★', value: 2, color: '#ef4444' }
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
                        Customer
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
                            <div className="text-sm text-gray-500">{booking.time}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.customer}</div>
                            <div className="text-sm text-gray-500">
                              <MapPinIcon className="h-3 w-3 inline mr-1" />
                              {booking.pickup}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{booking.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <MapIcon className="h-5 w-5 mr-2" />
                  Start Navigation
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Contact Customer
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  View Documents
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700">
                  <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                  Report Issue
                </button>
              </div>
            </div>
          </div>

          {/* Vehicle Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Vehicle</p>
                  <p className="text-sm text-gray-500">Ford F-150</p>
                  <p className="text-xs text-green-600">Ready for service</p>
                </div>
              </div>
              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPinIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-500">Downtown Area</p>
                  <p className="text-xs text-blue-600">GPS Active</p>
                </div>
              </div>
              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Maintenance</p>
                  <p className="text-sm text-gray-500">Due in 15 days</p>
                  <p className="text-xs text-yellow-600">Schedule service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DriverDashboard; 