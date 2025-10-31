'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationType, NotificationPriority } from '@/types';
import { 
  BellIcon, 
  CheckIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CogIcon,
  CheckCircleIcon as CheckCircleSolidIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import DashboardLayout from './DashboardLayout';

export default function NotificationPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const [filterType, setFilterType] = useState<NotificationType | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'ALL'>('ALL');
  const [filterRead, setFilterRead] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  // Filter notifications based on selected filters
  const filteredNotifications = notifications.filter(notification => {
    // Type filter
    if (filterType !== 'ALL' && notification.type !== filterType) return false;
    
    // Priority filter
    if (filterPriority !== 'ALL' && notification.priority !== filterPriority) return false;
    
    // Read status filter
    if (filterRead === 'READ' && !notification.isRead) return false;
    if (filterRead === 'UNREAD' && notification.isRead) return false;
    
    // Search term filter
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'BOOKING_CREATED':
      case 'BOOKING_ACCEPTED':
      case 'BOOKING_REJECTED':
        return <CalendarIcon className="h-5 w-5 text-blue-500" />;
      case 'TRIP_STARTED':
      case 'TRIP_COMPLETED':
      case 'TRIP_CANCELLED':
        return <TruckIcon className="h-5 w-5 text-green-500" />;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_FAILED':
        return <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />;
      case 'DRIVER_ARRIVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'EMERGENCY_ALERT':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'SYSTEM_ALERT':
        return <CogIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Get notification types based on user role
  const getNotificationTypes = () => {
    const baseTypes: Array<{ value: NotificationType | 'ALL'; label: string }> = [
      { value: 'ALL', label: 'All Types' },
      { value: 'BOOKING_CREATED', label: user.role === 'DRIVER' ? 'New Booking' : 'Booking Created' },
      { value: 'BOOKING_ACCEPTED', label: 'Booking Accepted' },
      { value: 'BOOKING_REJECTED', label: 'Booking Rejected' },
      { value: 'TRIP_STARTED', label: 'Trip Started' },
      { value: 'TRIP_COMPLETED', label: 'Trip Completed' },
      { value: 'TRIP_CANCELLED', label: 'Trip Cancelled' },
      { value: 'PAYMENT_RECEIVED', label: 'Payment Received' },
      { value: 'PAYMENT_FAILED', label: 'Payment Failed' },
      { value: 'EMERGENCY_ALERT', label: 'Emergency Alert' },
      { value: 'SYSTEM_ALERT', label: 'System Alert' },
    ];

    // Add driver-specific types for drivers
    if (user.role === 'DRIVER') {
      baseTypes.splice(1, 0, { value: 'DRIVER_ARRIVED', label: 'Driver Arrived' });
    }

    return baseTypes;
  };

  const notificationTypes = getNotificationTypes();

  const priorityLevels: { value: NotificationPriority | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  // Get page title and description based on user role
  const getPageInfo = () => {
    switch (user.role) {
      case 'ADMIN':
        return {
          title: 'Admin Notifications',
          description: 'Manage and view all system notifications'
        };
      case 'DRIVER':
        return {
          title: 'Driver Notifications',
          description: 'View and manage your trip notifications'
        };
      case 'USER':
        return {
          title: 'User Notifications',
          description: 'View and manage your booking notifications'
        };
      default:
        return {
          title: 'Notifications',
          description: 'View and manage your notifications'
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pageInfo.title}</h1>
              <p className="mt-2 text-gray-600">
                {pageInfo.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <BellIcon className="h-5 w-5" />
                <span>{unreadCount} unread</span>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CheckCircleSolidIcon className="h-4 w-4 mr-2" />
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as NotificationType | 'ALL')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as NotificationPriority | 'ALL')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priorityLevels.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Read Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value as 'ALL' | 'READ' | 'UNREAD')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All</option>
                <option value="UNREAD">Unread</option>
                <option value="READ">Read</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BellIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {notifications.length === 0 
                  ? "You don't have any notifications yet." 
                  : "No notifications match your current filters."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-gray-400 hover:text-green-600 transition-colors p-1"
                              title="Mark as read"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Delete notification"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {notification.relatedId && (
                          <span className="text-blue-600">
                            ID: {notification.relatedId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Summary */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// CalendarIcon component
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
