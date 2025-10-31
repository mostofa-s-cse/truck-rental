'use client';

import React from 'react';
import { BellIcon, ClockIcon } from '@heroicons/react/24/outline';
import NotificationCard from './NotificationCard';
import { Notification } from '@/types';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  onNotificationClick: (notification: Notification) => void;
  onDeleteNotification: (notificationId: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  onNotificationClick,
  onDeleteNotification
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
        <p className="mt-1 text-sm text-gray-500">
          You&apos;re all caught up! No new notifications at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            All Notifications ({notifications.length})
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>Sorted by most recent</span>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onView={onNotificationClick}
            onDelete={onDeleteNotification}
            showActions={true}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationList;
