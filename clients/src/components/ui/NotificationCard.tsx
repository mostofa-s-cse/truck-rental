'use client';

import React from 'react';
import { 
  BellIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CogIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType, Notification } from '@/types';

interface NotificationCardProps {
  notification: Notification;
  onView?: (notification: Notification) => void;
  onDelete?: (notificationId: string) => void;
  onMarkAsRead?: (notificationId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onView,
  onDelete,
  onMarkAsRead,
  showActions = true,
  compact = false
}) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'border-l-red-500 bg-red-50';
      case 'HIGH':
        return 'border-l-orange-500 bg-orange-50';
      case 'MEDIUM':
        return 'border-l-blue-500 bg-blue-50';
      case 'LOW':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(notification);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.id);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
  };

  if (compact) {
    return (
      <div
        className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
          !notification.isRead ? 'bg-blue-50' : ''
        }`}
        onClick={handleView}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className={`text-sm font-medium ${
                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {notification.title}
              </h4>
              <div className="flex items-center space-x-2 ml-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(notification.priority)}`}>
                  {notification.priority}
                </span>
                {!notification.isRead && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    New
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
              
              {showActions && (
                <div className="flex items-center space-x-2">
                  {!notification.isRead && onMarkAsRead && (
                    <button
                      onClick={handleMarkAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
      onClick={handleView}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-base font-medium ${
                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {notification.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(notification.priority)}`}>
                {notification.priority}
              </span>
              {!notification.isRead && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  New
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
              {notification.relatedType && (
                <span className="capitalize">{notification.relatedType}</span>
              )}
            </div>
            
            {showActions && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleView}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <EyeIcon className="h-3 w-3 mr-1" />
                  View Details
                </button>
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
