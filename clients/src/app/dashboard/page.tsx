'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { apiClient } from '@/lib/api';
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
  DocumentTextIcon,
  ArrowPathIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import Chart from '@/components/ui/Chart';

const UserDashboard = () => {
  const { errorToast, successToast } = useSweetAlert();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    totalBookings: number;
    totalSpent: number;
    favoriteDrivers: number;
    averageRating: number;
    recentBookings: Array<{
      id: string;
      status: string;
      fare: number;
      createdAt: string;
      driver: {
        user: { name: string };
        truckType: string;
      };
      review?: { rating: number };
    }>;
    nearbyDrivers: Array<{
      id: string;
      rating: number;
      location: string;
      isAvailable: boolean;
      truckType: string;
      user: { name: string };
    }>;
    spendingData: Array<{ month: string; amount: number }>;
    bookingStatusData: Array<{ status: string; count: number }>;
  } | null>(null);

  const hasLoadedRef = useRef(false);

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    // Prevent multiple calls on initial load
    if (!isRefresh && hasLoadedRef.current) {
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await apiClient.getDashboardStats();
      
      if (response.success && response.data) {
        setDashboardData(response.data);
        hasLoadedRef.current = true;
        if (isRefresh) {
          successToast('Dashboard refreshed successfully');
        }
      } else {
        errorToast(response.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      errorToast('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [errorToast, successToast]);

  useEffect(() => {
    // Only load data once on component mount
    if (!hasLoadedRef.current) {
      loadDashboardData();
    }
  }, [loadDashboardData]);

  const handleRefresh = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  const stats = dashboardData ? [
    {
      name: 'Total Bookings',
      value: dashboardData.totalBookings.toString(),
      change: '+3',
      changeType: 'positive',
      icon: CalendarIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Spent',
      value: `$${dashboardData.totalSpent.toFixed(2)}`,
      change: '+15%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Favorite Drivers',
      value: dashboardData.favoriteDrivers.toString(),
      change: '+2',
      changeType: 'positive',
      icon: StarIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Average Rating',
      value: dashboardData.averageRating.toFixed(1),
      change: '+0.1',
      changeType: 'positive',
      icon: StarIcon,
      color: 'bg-purple-500'
    }
  ] : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800';
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
      case 'IN_PROGRESS':
        return <ChartBarIcon className="h-4 w-4" />;
      case 'CONFIRMED':
        return <ClockIcon className="h-4 w-4" />;
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
      case 'IN_PROGRESS':
        return 'Active';
      case 'CONFIRMED':
        return 'Upcoming';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['USER']}>
        <DashboardLayout title="User Dashboard" subtitle="Manage your bookings">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading dashboard...</span>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['USER']}>
      <DashboardLayout title="User Dashboard" subtitle="Manage your bookings">
        <div className="space-y-6">
          {/* Header with Refresh Button */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here&apos;s your activity overview.</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

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
              {dashboardData?.spendingData && dashboardData.spendingData.length > 0 ? (
                <Chart
                  data={dashboardData.spendingData.map((d) => ({
                    label: d.month,
                    value: d.amount,
                    color: '#3b82f6'
                  }))}
                  type="bar"
                />
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  No spending data available
                </div>
              )}
            </div>

            {/* Booking Status Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Status</h3>
              {dashboardData?.bookingStatusData && dashboardData.bookingStatusData.length > 0 ? (
                <Chart
                  data={dashboardData.bookingStatusData.map((d) => ({
                    label: d.status,
                    value: d.count,
                    color: d.status === 'Completed' ? '#22c55e' : 
                           d.status === 'Active' ? '#3b82f6' : 
                           d.status === 'Upcoming' ? '#eab308' : '#ef4444'
                  }))}
                  type="pie"
                />
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  No booking data available
                </div>
              )}
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
                {dashboardData?.recentBookings && dashboardData.recentBookings.length > 0 ? (
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
                      {dashboardData.recentBookings.map((booking) => (
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
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {booking.driver?.user?.name || 'Unknown Driver'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.driver?.truckType?.replace('_', ' ') || 'Unknown Truck'}
                              </div>
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
                            {booking.review && (
                              <div className="flex items-center text-sm text-gray-500">
                                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                {booking.review.rating}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>No recent bookings found</p>
                    <p className="text-sm">Start by booking your first truck!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Nearby Drivers */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Nearby Drivers</h3>
              </div>
              <div className="p-6">
                {dashboardData?.nearbyDrivers && dashboardData.nearbyDrivers.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.nearbyDrivers.map((driver) => (
                      <div key={driver.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{driver.user?.name || 'Unknown Driver'}</p>
                            <p className="text-sm text-gray-500">{driver.truckType?.replace('_', ' ')}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                              {driver.rating.toFixed(1)}
                              <span className="mx-2">•</span>
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {driver.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            driver.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {driver.isAvailable ? 'Available' : 'Busy'}
                          </span>
                          <button className="text-blue-600 hover:text-blue-900">
                            <PhoneIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <TruckIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>No nearby drivers found</p>
                    <p className="text-sm">Try expanding your search area</p>
                  </div>
                )}
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