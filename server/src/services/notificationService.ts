import { PrismaClient, NotificationType, NotificationPriority } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createUserNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          relatedId,
          relatedType,
          priority,
        },
      });
    } catch (error) {
      console.error('Error creating user notification:', error);
      throw new Error('Failed to create user notification');
    }
  }

  /**
   * Create a notification for a specific driver
   */
  static async createDriverNotification(
    driverId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ) {
    try {
      return await prisma.notification.create({
        data: {
          driverId,
          type,
          title,
          message,
          relatedId,
          relatedType,
          priority,
        },
      });
    } catch (error) {
      console.error('Error creating driver notification:', error);
      throw new Error('Failed to create driver notification');
    }
  }

  /**
   * Create a notification for all admins
   */
  static async createAdminNotification(
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ) {
    try {
      // Get all admin users
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      // Create notifications for all admins
      const notifications = await Promise.all(
        admins.map(admin =>
          prisma.notification.create({
            data: {
              adminId: admin.id,
              type,
              title,
              message,
              relatedId,
              relatedType,
              priority,
            },
          })
        )
      );

      return notifications;
    } catch (error) {
      console.error('Error creating admin notifications:', error);
      throw new Error('Failed to create admin notifications');
    }
  }

  /**
   * Get notifications for a specific user
   */
  static async getUserNotifications(userId: string, limit: number = 50) {
    try {
      return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw new Error('Failed to fetch user notifications');
    }
  }

  /**
   * Get notifications for a specific driver
   */
  static async getDriverNotifications(driverId: string, limit: number = 50) {
    try {
      return await prisma.notification.findMany({
        where: { driverId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Error fetching driver notifications:', error);
      throw new Error('Failed to fetch driver notifications');
    }
  }

  /**
   * Get notifications for a specific admin
   */
  static async getAdminNotifications(adminId: string, limit: number = 50) {
    try {
      // Validate inputs
      if (!adminId || typeof adminId !== 'string') {
        throw new Error('Invalid admin ID provided');
      }

      if (limit < 1 || limit > 100) {
        limit = 50; // Default to 50 if invalid limit
      }

      console.log(`Fetching admin notifications for adminId: ${adminId}, limit: ${limit}`);

      // For admin notifications, we need to get notifications that are either:
      // 1. Specifically assigned to this admin (adminId matches)
      // 2. General admin notifications (adminId is null but type is admin-related)
      // 3. System notifications that admins should see
      const notifications = await prisma.notification.findMany({
        where: {
          OR: [
            { adminId: adminId },
            { 
              AND: [
                { adminId: null },
                { 
                  OR: [
                    { type: 'SYSTEM_ALERT' },
                    { type: 'EMERGENCY_ALERT' },
                    { relatedType: 'BOOKING' },
                    { relatedType: 'PAYMENT' }
                  ]
                }
              ]
            }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      console.log(`Successfully fetched ${notifications.length} admin notifications for admin: ${adminId}`);
      return notifications;
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        throw new Error(`Failed to fetch admin notifications: ${error.message}`);
      }
      
      throw new Error('Failed to fetch admin notifications');
    }
  }

  /**
   * Get notifications for a specific driver by user ID
   */
  static async getDriverNotificationsByUserId(userId: string, limit: number = 50) {
    try {
      // First get the driver ID from user ID
      const driver = await prisma.driver.findUnique({
        where: { userId },
        select: { id: true }
      });

      if (!driver) {
        throw new Error('Driver profile not found');
      }

      return await this.getDriverNotifications(driver.id, limit);
    } catch (error) {
      console.error('Error fetching driver notifications by user ID:', error);
      throw new Error('Failed to fetch driver notifications');
    }
  }

  /**
   * Mark a notification as read
   */
  static async markNotificationAsRead(notificationId: string, userId: string) {
    try {
      // Get the user to determine their role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      let whereClause: any;

      if (user.role === 'ADMIN') {
        // For admins, they can mark as read notifications that are either:
        // 1. Specifically assigned to this admin
        // 2. General admin notifications (adminId is null but type is admin-related)
        // 3. System notifications
        whereClause = {
          id: notificationId,
          OR: [
            { adminId: userId },
            { 
              AND: [
                { adminId: null },
                { 
                  OR: [
                    { type: 'SYSTEM_ALERT' },
                    { type: 'EMERGENCY_ALERT' },
                    { relatedType: 'BOOKING' },
                    { relatedType: 'PAYMENT' }
                  ]
                }
              ]
            }
          ]
        };
      } else if (user.role === 'DRIVER') {
        // For drivers, they can mark as read their own notifications
        const driver = await prisma.driver.findUnique({
          where: { userId },
          select: { id: true }
        });

        if (driver) {
          whereClause = {
            id: notificationId,
            driverId: driver.id
          };
        } else {
          whereClause = {
            id: notificationId,
            userId: userId
          };
        }
      } else {
        // For regular users, they can only mark as read their own notifications
        whereClause = {
          id: notificationId,
          userId: userId
        };
      }

      const notification = await prisma.notification.findFirst({
        where: whereClause
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      return await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllNotificationsAsRead(userId: string) {
    try {
      // Get the user to determine their role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      let whereClause: any;

      if (user.role === 'ADMIN') {
        // For admins, mark as read notifications that are either:
        // 1. Specifically assigned to this admin
        // 2. General admin notifications (adminId is null but type is admin-related)
        // 3. System notifications
        whereClause = {
          OR: [
            { adminId: userId },
            { 
              AND: [
                { adminId: null },
                { 
                  OR: [
                    { type: 'SYSTEM_ALERT' },
                    { type: 'EMERGENCY_ALERT' },
                    { relatedType: 'BOOKING' },
                    { relatedType: 'PAYMENT' }
                  ]
                }
              ]
            }
          ],
          isRead: false
        };
      } else if (user.role === 'DRIVER') {
        // For drivers, get their driver profile and mark notifications as read
        const driver = await prisma.driver.findUnique({
          where: { userId },
          select: { id: true }
        });

        if (driver) {
          whereClause = {
            driverId: driver.id,
            isRead: false
          };
        } else {
          whereClause = {
            userId: userId,
            isRead: false
          };
        }
      } else {
        // For regular users, mark their notifications as read
        whereClause = {
          userId: userId,
          isRead: false
        };
      }

      const result = await prisma.notification.updateMany({
        where: whereClause,
        data: { isRead: true }
      });

      return { count: result.count };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    try {
      // Get the user to determine their role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      let whereClause: any;

      if (user.role === 'ADMIN') {
        // For admins, they can delete notifications that are either:
        // 1. Specifically assigned to this admin
        // 2. General admin notifications (adminId is null but type is admin-related)
        // 3. System notifications
        whereClause = {
          id: notificationId,
          OR: [
            { adminId: userId },
            { 
              AND: [
                { adminId: null },
                { 
                  OR: [
                    { type: 'SYSTEM_ALERT' },
                    { type: 'EMERGENCY_ALERT' },
                    { relatedType: 'BOOKING' },
                    { relatedType: 'PAYMENT' }
                  ]
                }
              ]
            }
          ]
        };
      } else if (user.role === 'DRIVER') {
        // For drivers, they can delete their own notifications
        const driver = await prisma.driver.findUnique({
          where: { userId },
          select: { id: true }
        });

        if (driver) {
          whereClause = {
            id: notificationId,
            driverId: driver.id
          };
        } else {
          whereClause = {
            id: notificationId,
            userId: userId
          };
        }
      } else {
        // For regular users, they can only delete their own notifications
        whereClause = {
          id: notificationId,
          userId: userId
        };
      }

      const notification = await prisma.notification.findFirst({
        where: whereClause
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      await prisma.notification.delete({
        where: { id: notificationId }
      });

      return { success: true, message: 'Notification deleted successfully' };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string) {
    try {
      // Validate inputs
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID provided');
      }

      console.log(`Getting unread count for userId: ${userId}`);

      // Get the user to determine their role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      console.log(`User role determined: ${user.role}`);

      let whereClause: any;

      if (user.role === 'ADMIN') {
        // For admins, count notifications that are either:
        // 1. Specifically assigned to this admin
        // 2. General admin notifications (adminId is null but type is admin-related)
        // 3. System notifications
        whereClause = {
          OR: [
            { adminId: userId },
            { 
              AND: [
                { adminId: null },
                { 
                  OR: [
                    { type: 'SYSTEM_ALERT' },
                    { type: 'EMERGENCY_ALERT' },
                    { relatedType: 'BOOKING' },
                    { relatedType: 'PAYMENT' }
                  ]
                }
              ]
            }
          ],
          isRead: false
        };
      } else if (user.role === 'DRIVER') {
        // For drivers, get their driver profile and count notifications
        const driver = await prisma.driver.findUnique({
          where: { userId },
          select: { id: true }
        });

        if (driver) {
          whereClause = {
            driverId: driver.id,
            isRead: false
          };
        } else {
          whereClause = {
            userId: userId,
            isRead: false
          };
        }
      } else {
        // For regular users, count their notifications
        whereClause = {
          userId: userId,
          isRead: false
        };
      }

      console.log(`Executing count query with whereClause:`, JSON.stringify(whereClause, null, 2));

      const count = await prisma.notification.count({
        where: whereClause
      });

      console.log(`Successfully counted ${count} unread notifications for user: ${userId}`);
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        throw new Error(`Failed to get unread count: ${error.message}`);
      }
      
      throw new Error('Failed to get unread count');
    }
  }

  /**
   * Delete old notifications (older than 30 days)
   */
  static async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return await prisma.notification.deleteMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          isRead: true,
        },
      });
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw new Error('Failed to cleanup old notifications');
    }
  }
}
