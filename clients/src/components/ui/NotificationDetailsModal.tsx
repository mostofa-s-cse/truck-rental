'use client';

import React from 'react';
import { 
  XMarkIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CogIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, format } from 'date-fns';
import { NotificationType, Notification } from '@/types';

interface NotificationDetailsModalProps {
  notification: Notification;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (notificationId: string) => void;
}

const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  notification,
  isOpen,
  onClose,
  onDelete
}) => {
  if (!isOpen) return null;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'BOOKING_CREATED':
      case 'BOOKING_ACCEPTED':
      case 'BOOKING_REJECTED':
        return <CalendarIcon className="h-8 w-8 text-blue-500" />;
      case 'TRIP_STARTED':
      case 'TRIP_COMPLETED':
      case 'TRIP_CANCELLED':
        return <TruckIcon className="h-8 w-8 text-green-500" />;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_FAILED':
        return <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />;
      case 'DRIVER_ARRIVED':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case 'EMERGENCY_ALERT':
        return <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />;
      case 'SYSTEM_ALERT':
        return <CogIcon className="h-8 w-8 text-gray-500" />;
      default:
        return <CalendarIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
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

  const getTypeDescription = (type: NotificationType) => {
    switch (type) {
      case 'BOOKING_CREATED':
        return 'A new booking has been created for your service';
      case 'BOOKING_ACCEPTED':
        return 'Your booking request has been accepted by the driver';
      case 'BOOKING_REJECTED':
        return 'Your booking request has been rejected';
      case 'TRIP_STARTED':
        return 'Your trip has started and is now in progress';
      case 'TRIP_COMPLETED':
        return 'Your trip has been completed successfully';
      case 'TRIP_CANCELLED':
        return 'Your trip has been cancelled';
      case 'PAYMENT_RECEIVED':
        return 'Payment has been received for your service';
      case 'PAYMENT_FAILED':
        return 'Payment processing failed for your service';
      case 'DRIVER_ARRIVED':
        return 'Your driver has arrived at the pickup location';
      case 'EMERGENCY_ALERT':
        return 'An emergency situation has been reported';
      case 'SYSTEM_ALERT':
        return 'System maintenance or important update';
      default:
        return 'General notification about your account or service';
    }
  };

  const handleDelete = () => {
    onDelete(notification.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getNotificationIcon(notification.type)}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Notification Details
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getTypeDescription(notification.type)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6">
            <div className="space-y-6">
              {/* Title and Priority */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {notification.title}
                </h4>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(notification.priority)}`}>
                    {notification.priority} Priority
                  </span>
                  {!notification.isRead && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      Unread
                    </span>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Message</h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Type</h5>
                  <div className="flex items-center space-x-2">
                    <TagIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 capitalize">
                      {notification.type.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Created</h5>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">
                      {format(new Date(notification.createdAt), 'PPP')}
                    </span>
                  </div>
                </div>

                {notification.relatedType && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Related To</h5>
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 capitalize">
                        {notification.relatedType}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Time Ago</h5>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related ID if exists */}
              {notification.relatedId && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Reference ID</h5>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <code className="text-sm text-gray-900 font-mono">
                      {notification.relatedId}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              ID: {notification.id}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailsModal;
