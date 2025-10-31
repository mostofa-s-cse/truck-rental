import { PrismaClient, NotificationType, NotificationPriority } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedNotifications() {
  console.log('🔔 Seeding notifications...');

  try {
    // Get some users for notifications
    const users = await prisma.user.findMany({ take: 5 });
    const drivers = await prisma.driver.findMany({ take: 3 });
    const adminUsers = await prisma.user.findMany({ 
      where: { role: 'ADMIN' }, 
      take: 2 
    });

    if (users.length === 0) {
      console.log('⚠️ No users found, skipping notification seeding');
      return;
    }

    // Create user notifications
    for (const user of users) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM_ALERT',
          title: 'Welcome to TruckBook!',
          message: 'Thank you for joining our platform. We hope you have a great experience!',
          priority: 'MEDIUM',
          isRead: false
        }
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'BOOKING_CREATED',
          title: 'Booking Confirmation',
          message: 'Your booking has been created successfully. We will notify you when a driver accepts it.',
          priority: 'HIGH',
          isRead: false
        }
      });
    }

    // Create driver notifications
    for (const driver of drivers) {
      await prisma.notification.create({
        data: {
          driverId: driver.id,
          type: 'SYSTEM_ALERT',
          title: 'Driver Account Verified',
          message: 'Congratulations! Your driver account has been verified. You can now accept bookings.',
          priority: 'HIGH',
          isRead: false
        }
      });

      await prisma.notification.create({
        data: {
          driverId: driver.id,
          type: 'BOOKING_ACCEPTED',
          title: 'New Booking Available',
          message: 'A new booking is available in your area. Check it out!',
          priority: 'MEDIUM',
          isRead: false
        }
      });
    }

    // Create admin notifications
    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          adminId: admin.id,
          type: 'SYSTEM_ALERT',
          title: 'Admin Dashboard Access',
          message: 'You have full access to the admin dashboard. Monitor and manage the platform.',
          priority: 'HIGH',
          isRead: false
        }
      });

      await prisma.notification.create({
        data: {
          adminId: admin.id,
          type: 'EMERGENCY_ALERT',
          title: 'System Status',
          message: 'All systems are running normally. No issues detected.',
          priority: 'LOW',
          isRead: false
        }
      });
    }

    // Create general admin notifications (not assigned to specific admin)
    await prisma.notification.create({
      data: {
        type: 'SYSTEM_ALERT',
        title: 'Platform Update',
        message: 'New features have been deployed. Check the changelog for details.',
        priority: 'MEDIUM',
        isRead: false
      }
    });

    await prisma.notification.create({
      data: {
        type: 'EMERGENCY_ALERT',
        title: 'Maintenance Notice',
        message: 'Scheduled maintenance will occur tonight from 2-4 AM. Minimal disruption expected.',
        priority: 'MEDIUM',
        isRead: false
      }
    });

    await prisma.notification.create({
      data: {
        type: 'SYSTEM_ALERT',
        title: 'Performance Report',
        message: 'Monthly performance report is ready. Overall platform health is excellent.',
        priority: 'LOW',
        isRead: false
      }
    });

    console.log('✅ Notifications seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    throw error;
  }
}
