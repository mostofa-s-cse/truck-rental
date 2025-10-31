import express from 'express';
import { auth, authorize } from '../../middleware/auth';
import { NotificationService } from '../../services/notificationService';

const router = express.Router();

// Get user notifications
router.get('/user', auth, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const { limit = 20 } = req.query;

    const notifications = await NotificationService.getUserNotifications(
      userId,
      Number(limit)
    );

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user notifications'
    });
  }
});

// Get driver notifications
router.get('/driver', auth, authorize('DRIVER'), async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const { limit = 20 } = req.query;

    const notifications = await NotificationService.getDriverNotificationsByUserId(
      userId,
      Number(limit)
    );

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching driver notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver notifications'
    });
  }
});

// Get admin notifications
router.get('/admin', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const adminId = (req as any).user?.userId;
    const { limit = 20 } = req.query;

    console.log(`Fetching admin notifications for adminId: ${adminId}, limit: ${limit}`);

    if (!adminId) {
      console.error('No adminId found in request user object');
      return res.status(400).json({
        success: false,
        message: 'Admin ID not found'
      });
    }

    const notifications = await NotificationService.getAdminNotifications(
      adminId,
      Number(limit)
    );

    console.log(`Successfully fetched ${notifications.length} admin notifications`);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to fetch admin notifications';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    await NotificationService.markNotificationAsRead(id, userId);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', auth, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const role = (req as any).user?.role;

    await NotificationService.markAllNotificationsAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    await NotificationService.deleteNotification(id, userId);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const role = (req as any).user?.role;

    console.log(`Fetching unread count for userId: ${userId}, role: ${role}`);

    if (!userId) {
      console.error('No userId found in request user object');
      return res.status(400).json({
        success: false,
        message: 'User ID not found'
      });
    }

    const count = await NotificationService.getUnreadCount(userId);

    console.log(`Successfully fetched unread count: ${count} for user: ${userId}`);

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to fetch unread count';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;
