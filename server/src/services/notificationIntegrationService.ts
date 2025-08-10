import { NotificationController } from '../controllers/notificationController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationIntegrationService {
  /**
   * Send notifications when a new booking is created
   */
  static async onBookingCreated(bookingId: string) {
    try {
      await NotificationController.notifyBookingCreated(bookingId);
      console.log(`Notifications sent for booking creation: ${bookingId}`);
    } catch (error) {
      console.error('Failed to send booking creation notifications:', error);
      // Don't throw error to avoid breaking the main booking flow
    }
  }

  /**
   * Send notifications when booking status changes
   */
  static async onBookingStatusChanged(bookingId: string, status: string, driverId: string) {
    try {
      await NotificationController.notifyBookingStatusChanged(bookingId, status, driverId);
      console.log(`Notifications sent for booking status change: ${bookingId} -> ${status}`);
    } catch (error) {
      console.error('Failed to send booking status change notifications:', error);
      // Don't throw error to avoid breaking the main booking flow
    }
  }

  /**
   * Send notifications when trip starts
   */
  static async onTripStarted(bookingId: string) {
    try {
      await NotificationController.notifyTripStarted(bookingId);
      console.log(`Notifications sent for trip start: ${bookingId}`);
    } catch (error) {
      console.error('Failed to send trip start notifications:', error);
      // Don't throw error to avoid breaking the main trip flow
    }
  }

  /**
   * Send notifications when trip is completed
   */
  static async onTripCompleted(bookingId: string) {
    try {
      await NotificationController.notifyTripCompleted(bookingId);
      console.log(`Notifications sent for trip completion: ${bookingId}`);
    } catch (error) {
      console.error('Failed to send trip completion notifications:', error);
      // Don't throw error to avoid breaking the main trip flow
    }
  }

  /**
   * Send notifications when driver arrives at pickup location
   */
  static async onDriverArrived(bookingId: string) {
    try {
      await NotificationController.notifyDriverArrived(bookingId);
      console.log(`Notifications sent for driver arrival: ${bookingId}`);
    } catch (error) {
      console.error('Failed to send driver arrival notifications:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Send notifications when payment status changes
   */
  static async onPaymentStatusChanged(paymentId: string, status: string) {
    try {
      await NotificationController.notifyPaymentStatusChanged(paymentId, status);
      console.log(`Notifications sent for payment status change: ${paymentId} -> ${status}`);
    } catch (error) {
      console.error('Failed to send payment status change notifications:', error);
      // Don't throw error to avoid breaking the main payment flow
    }
  }

  /**
   * Send notifications when emergency alert is created
   */
  static async onEmergencyAlertCreated(alertId: string) {
    try {
      await NotificationController.notifyEmergencyAlert(alertId);
      console.log(`Notifications sent for emergency alert: ${alertId}`);
    } catch (error) {
      console.error('Failed to send emergency alert notifications:', error);
      // Don't throw error to avoid breaking the main emergency flow
    }
  }

  /**
   * Send system-wide notifications
   */
  static async sendSystemAlert(title: string, message: string, priority: string = 'MEDIUM') {
    try {
      await NotificationController.notifySystemAlert(title, message, priority);
      console.log(`System alert sent: ${title}`);
    } catch (error) {
      console.error('Failed to send system alert:', error);
      throw error; // System alerts are important, so we throw the error
    }
  }

  /**
   * Send welcome notification to new users
   */
  static async sendWelcomeNotification(userId: string, userName: string) {
    try {
      const { NotificationService } = await import('./notificationService');
      
      await NotificationService.createUserNotification(
        userId,
        'SYSTEM_ALERT',
        'Welcome!',
        `Welcome to our ride-sharing service, ${userName}! We're glad to have you on board.`,
        undefined,
        'SYSTEM',
        'LOW'
      );

      console.log(`Welcome notification sent to user: ${userId}`);
    } catch (error) {
      console.error('Failed to send welcome notification:', error);
      // Don't throw error to avoid breaking user registration
    }
  }

  /**
   * Send driver verification notification
   */
  static async sendDriverVerificationNotification(driverId: string, isVerified: boolean) {
    try {
      const { NotificationService } = await import('./notificationService');
      
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
        include: { user: true }
      });

      if (!driver) {
        throw new Error('Driver not found');
      }

      if (isVerified) {
        await NotificationService.createDriverNotification(
          driverId,
          'SYSTEM_ALERT',
          'Account Verified',
          'Congratulations! Your driver account has been verified. You can now accept bookings.',
          undefined,
          'SYSTEM',
          'HIGH'
        );
      } else {
        await NotificationService.createDriverNotification(
          driverId,
          'SYSTEM_ALERT',
          'Verification Required',
          'Your driver account verification is pending. Please complete all required documents.',
          undefined,
          'SYSTEM',
          'MEDIUM'
        );
      }

      console.log(`Driver verification notification sent: ${driverId} -> ${isVerified}`);
    } catch (error) {
      console.error('Failed to send driver verification notification:', error);
      // Don't throw error to avoid breaking the verification flow
    }
  }

  /**
   * Send booking reminder notifications
   */
  static async sendBookingReminder(bookingId: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          driver: {
            include: {
              user: true
            }
          }
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      const { NotificationService } = await import('./notificationService');

      // Send reminder to user
      await NotificationService.createUserNotification(
        booking.userId,
        'SYSTEM_ALERT',
        'Trip Reminder',
        `Reminder: Your trip from ${booking.source} to ${booking.destination} is scheduled. Please be ready.`,
        booking.id,
        'BOOKING',
        'MEDIUM'
      );

      // Send reminder to driver
      await NotificationService.createDriverNotification(
        booking.driverId,
        'SYSTEM_ALERT',
        'Trip Reminder',
        `Reminder: You have a scheduled trip from ${booking.source} to ${booking.destination}. Please be on time.`,
        booking.id,
        'BOOKING',
        'MEDIUM'
      );

      console.log(`Booking reminder notifications sent: ${bookingId}`);
    } catch (error) {
      console.error('Failed to send booking reminder notifications:', error);
      // Don't throw error to avoid breaking the reminder flow
    }
  }

  /**
   * Send payment reminder notifications
   */
  static async sendPaymentReminder(paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: {
            include: {
              user: true
            }
          }
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      const { NotificationService } = await import('./notificationService');

      // Send payment reminder to user
      await NotificationService.createUserNotification(
        payment.booking.userId,
        'SYSTEM_ALERT',
        'Payment Reminder',
        `Reminder: Your payment of $${payment.amount} for the trip from ${payment.booking.source} to ${payment.booking.destination} is pending.`,
        payment.id,
        'PAYMENT',
        'MEDIUM'
      );

      console.log(`Payment reminder notification sent: ${paymentId}`);
    } catch (error) {
      console.error('Failed to send payment reminder notification:', error);
      // Don't throw error to avoid breaking the reminder flow
    }
  }
}
