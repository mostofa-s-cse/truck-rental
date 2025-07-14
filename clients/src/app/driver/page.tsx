'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { apiClient } from '@/lib/api';
import { 
  TruckIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  MapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Chart from '@/components/ui/Chart';

const DriverDashboard = () => {
  const { errorToast, successToast } = useSweetAlert();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    todayEarnings: number;
    activeBookings: number;
    rating: number;
    onlineHours: number;
    recentBookings: Array<{
      id: string;
      status: string;
      fare: number;
      createdAt: string;
      user: { name: string };
    }>;
    earningsData: Array<{ day: string; amount: number }>;
    ratingData: Array<{ rating: number; count: number }>;
  } | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDriverDashboardStats();
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        errorToast('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      errorToast('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityToggle = async () => {
    try {
      const newAvailability = !isAvailable;
      const response = await apiClient.updateAvailability(newAvailability);
      if (response.success) {
        setIsAvailable(newAvailability);
        successToast(newAvailability ? 'You are now available for bookings' : 'You are now offline');
      } else {
        errorToast('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      errorToast('Failed to update availability');
    }
  };

  const stats = dashboardData ? [
    {
      name: 'Today\'s Earnings',
      value: `$${dashboardData.todayEarnings.toFixed(2)}`,
      change: '+12%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Active Bookings',
      value: dashboardData.activeBookings.toString(),
      change: '2 new',
      changeType: 'neutral',
      icon: CalendarIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Rating',
      value: dashboardData.rating.toFixed(1),
      change: '+0.2',
      changeType: 'positive',
      icon: StarIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Online Hours',
      value: `${dashboardData.onlineHours}h`,
      change: 'Today',
      changeType: 'neutral',
      icon: ClockIcon,
      color: 'bg-purple-500'
    }
  ] : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'PENDING':
        return <ClockIcon className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <ChartBarIcon className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'PENDING':
        return 'Pending';
      case 'IN_PROGRESS':
        return 'Active';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['DRIVER']}>
        <DashboardLayout title="Driver Dashboard" subtitle="Manage your deliveries">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading dashboard...</span>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['DRIVER']}>
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
                onClick={handleAvailabilityToggle}
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
                data={dashboardData?.earningsData?.map(d => ({
                  label: d.day,
                  value: d.amount,
                  color: '#22c55e'
                })) || []}
                type="line"
              />
            </div>

            {/* Rating Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Ratings</h3>
              <Chart
                data={dashboardData?.ratingData?.map(d => ({
                  label: `${d.rating}★`,
                  value: d.count,
                  color: d.rating === 5 ? '#22c55e' : 
                         d.rating === 4 ? '#3b82f6' : 
                         d.rating === 3 ? '#eab308' : 
                         d.rating === 2 ? '#f97316' : '#ef4444'
                })) || []}
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
                    {dashboardData?.recentBookings?.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.id}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.user?.name || 'Unknown Customer'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{getStatusText(booking.status)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${booking.fare.toFixed(2)}</div>
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
                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <MapIcon className="h-5 w-5 mr-2" />
                  Update Location
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  View Active Trips
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  View Earnings
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Emergency Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DriverDashboard; 