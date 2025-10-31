import { useCallback, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import { notificationApi } from '@/lib/notificationApi';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification as deleteNotificationAction,
  setNotifications,
  setUnreadCount,
  addNotification
} from '@/store/slices/notificationSlice';
import { Notification } from '@/types';

export const useNotifications = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount, loading, error } = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();

  // Fetch notifications based on user role
  const fetchNotificationsData = useCallback(async () => {
    if (!user) return;

    try {
      let notificationsData: Notification[];
      if (user.role === 'ADMIN') {
        notificationsData = await notificationApi.getAdminNotifications();
      } else if (user.role === 'DRIVER') {
        notificationsData = await notificationApi.getDriverNotifications();
      } else {
        notificationsData = await notificationApi.getUserNotifications();
      }

      dispatch(setNotifications(notificationsData));
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [user, dispatch]);

  // Fetch unread count
  const fetchUnreadCountData = useCallback(async () => {
    if (!user) return;

    try {
      const count = await notificationApi.getUnreadCount();
      dispatch(setUnreadCount(count));
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [user, dispatch]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      dispatch(markNotificationAsRead(notificationId));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, [dispatch]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      dispatch(markAllNotificationsAsRead());
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, [dispatch]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      dispatch(deleteNotificationAction(notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [dispatch]);

  // Add new notification (for real-time updates)
  const addNotificationData = useCallback((notification: Notification) => {
    dispatch(addNotification(notification));
  }, [dispatch]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotificationsData();
      fetchUnreadCountData();
    }
  }, [user, fetchNotificationsData, fetchUnreadCountData]);

  // Refresh notifications every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotificationsData();
      fetchUnreadCountData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchNotificationsData, fetchUnreadCountData]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications: fetchNotificationsData,
    fetchUnreadCount: fetchUnreadCountData,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification: addNotificationData,
  };
};
