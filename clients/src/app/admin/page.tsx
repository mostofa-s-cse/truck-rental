'use client';

import React from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  UsersIcon, 
  TruckIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Chart from '@/components/ui/Chart';

const AdminDashboard = () => {
  const stats = [
    {
      name: 'Total Users',
      value: '2,847',
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Drivers',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      icon: TruckIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Total Bookings',
      value: '1,234',
      change: '+23%',
      changeType: 'positive',
      icon: CalendarIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Revenue',
      value: '$45,678',
      change: '+15%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    }
  ];

  const recentBookings = [
    {
      id: 'BK001',
      customer: 'John Doe',
      driver: 'Mike Smith',
      truck: 'Ford F-150',
      status: 'completed',
      amount: '$150',
      date: '2024-01-15'
    },
    {
      id: 'BK002',
      customer: 'Jane Smith',
      driver: 'Tom Wilson',
      truck: 'Chevrolet Silverado',
      status: 'pending',
      amount: '$200',
      date: '2024-01-15'
    },
    {
      id: 'BK003',
      customer: 'Bob Johnson',
      driver: 'Sarah Davis',
      truck: 'Toyota Tacoma',
      status: 'active',
      amount: '$180',
      date: '2024-01-14'
    },
    {
      id: 'BK004',
      customer: 'Alice Brown',
      driver: 'David Lee',
      truck: 'Nissan Frontier',
      status: 'cancelled',
      amount: '$120',
      date: '2024-01-14'
    }
  ];

  const pendingDrivers = [
    {
      id: 'DR001',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      phone: '+1 234-567-8901',
      documents: 'Pending',
      status: 'pending'
    },
    {
      id: 'DR002',
      name: 'Maria Garcia',
      email: 'maria@example.com',
      phone: '+1 234-567-8902',
      documents: 'Submitted',
      status: 'review'
    },
    {
      id: 'DR003',
      name: 'Carlos Rodriguez',
      email: 'carlos@example.com',
      phone: '+1 234-567-8903',
      documents: 'Pending',
      status: 'pending'
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
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout title="Admin Dashboard" subtitle="Platform Overview">
        <div className="space-y-6">
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
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
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
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
              <Chart
                data={[
                  { label: 'Jan', value: 12000, color: '#3b82f6' },
                  { label: 'Feb', value: 19000, color: '#3b82f6' },
                  { label: 'Mar', value: 15000, color: '#3b82f6' },
                  { label: 'Apr', value: 25000, color: '#3b82f6' },
                  { label: 'May', value: 22000, color: '#3b82f6' },
                  { label: 'Jun', value: 30000, color: '#3b82f6' }
                ]}
                type="line"
              />
            </div>

            {/* Bookings Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Status</h3>
              <Chart
                data={[
                  { label: 'Completed', value: 45, color: '#22c55e' },
                  { label: 'Active', value: 25, color: '#3b82f6' },
                  { label: 'Pending', value: 20, color: '#eab308' },
                  { label: 'Cancelled', value: 10, color: '#ef4444' }
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.driver}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{booking.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Driver Verifications */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Pending Driver Verifications</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingDrivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                            <div className="text-sm text-gray-500">{driver.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {driver.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            driver.documents === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {driver.documents}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Review</button>
                          <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                          <button className="text-red-600 hover:text-red-900">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <UsersIcon className="h-5 w-5 mr-2" />
                Add User
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                <TruckIcon className="h-5 w-5 mr-2" />
                Add Driver
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                <CalendarIcon className="h-5 w-5 mr-2" />
                View Bookings
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard; 