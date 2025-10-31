import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationController {
  /**
   * Send notification when user books a driver
   */
  static async notifyBookingCreated(bookingId: string) {
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

      // Notify user about booking creation
      await NotificationService.createUserNotification(
        booking.userId,
        'BOOKING_CREATED',
        'Booking Created',
        `Your booking from ${booking.source} to ${booking.destination} has been created successfully.`,
        booking.id,
        'BOOKING',
        'HIGH'
      );

      // Notify driver about new booking
      await NotificationService.createDriverNotification(
        booking.driverId,
        'BOOKING_CREATED',
        'New Booking Request',
        `You have a new booking request from ${booking.source} to ${booking.destination}.`,
        booking.id,
        'BOOKING',
        'HIGH'
      );

      // Notify all admins about new booking
      await NotificationService.createAdminNotification(
        'BOOKING_CREATED',
        'New Booking Created',
        `New booking created from ${booking.source} to ${booking.destination} by ${booking.user.name}`,
        booking.id,
        'BOOKING',
        'MEDIUM'
      );

      return { success: true, message: 'Booking notifications sent successfully' };
    } catch (error) {
      console.error('Error sending booking created notifications:', error);
      throw new Error('Failed to send booking created notifications');
    }
  }

  /**
   * Send notification when driver accepts/rejects a booking
   */
  static async notifyBookingStatusChanged(bookingId: string, status: string, driverId: string) {
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

      if (status === 'CONFIRMED') {
        // Notify user about booking confirmation
        await NotificationService.createUserNotification(
          booking.userId,
          'BOOKING_ACCEPTED',
          'Booking Confirmed',
          `Your booking has been confirmed by driver ${booking.driver.user.name}.`,
          booking.id,
          'BOOKING',
          'HIGH'
        );

        // Notify admins about booking confirmation
        await NotificationService.createAdminNotification(
          'BOOKING_ACCEPTED',
          'Booking Confirmed',
          `Driver ${booking.driver.user.name} has confirmed booking from ${booking.source} to ${booking.destination}`,
          booking.id,
          'BOOKING',
          'MEDIUM'
        );
      } else if (status === 'CANCELLED') {
        // Notify user about booking cancellation
        await NotificationService.createUserNotification(
          booking.userId,
          'BOOKING_REJECTED',
          'Booking Cancelled',
          `Your booking has been cancelled by driver ${booking.driver.user.name}.`,
          booking.id,
          'BOOKING',
          'HIGH'
        );

        // Notify admins about booking cancellation
        await NotificationService.createAdminNotification(
          'BOOKING_REJECTED',
          'Booking Cancelled',
          `Driver ${booking.driver.user.name} has cancelled booking from ${booking.source} to ${booking.destination}`,
          booking.id,
          'BOOKING',
          'HIGH'
        );
      }

      return { success: true, message: 'Booking status notifications sent successfully' };
    } catch (error) {
      console.error('Error sending booking status notifications:', error);
      throw new Error('Failed to send booking status notifications');
    }
  }

  /**
   * Send notification when trip starts
   */
  static async notifyTripStarted(bookingId: string) {
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

      // Notify user about trip start
      await NotificationService.createUserNotification(
        booking.userId,
        'TRIP_STARTED',
        'Trip Started',
        `Your trip from ${booking.source} to ${booking.destination} has started. Driver ${booking.driver.user.name} is on the way.`,
        booking.id,
        'BOOKING',
        'HIGH'
      );

      // Notify admins about trip start
      await NotificationService.createAdminNotification(
        'TRIP_STARTED',
        'Trip Started',
        `Trip started for booking from ${booking.source} to ${booking.destination} by driver ${booking.driver.user.name}`,
        booking.id,
        'BOOKING',
        'MEDIUM'
      );

      return { success: true, message: 'Trip started notifications sent successfully' };
    } catch (error) {
      console.error('Error sending trip started notifications:', error);
      throw new Error('Failed to send trip started notifications');
    }
  }

  /**
   * Send notification when trip is completed
   */
  static async notifyTripCompleted(bookingId: string) {
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

      // Notify user about trip completion
      await NotificationService.createUserNotification(
        booking.userId,
        'TRIP_COMPLETED',
        'Trip Completed',
        `Your trip from ${booking.source} to ${booking.destination} has been completed successfully. Thank you for using our service!`,
        booking.id,
        'BOOKING',
        'HIGH'
      );

      // Notify driver about trip completion
      await NotificationService.createDriverNotification(
        booking.driverId,
        'TRIP_COMPLETED',
        'Trip Completed',
        `You have successfully completed the trip from ${booking.source} to ${booking.destination}.`,
        booking.id,
        'BOOKING',
        'HIGH'
      );

      // Notify admins about trip completion
      await NotificationService.createAdminNotification(
        'TRIP_COMPLETED',
        'Trip Completed',
        `Trip completed for booking from ${booking.source} to ${booking.destination} by driver ${booking.driver.user.name}`,
        booking.id,
        'BOOKING',
        'MEDIUM'
      );

      return { success: true, message: 'Trip completed notifications sent successfully' };
    } catch (error) {
      console.error('Error sending trip completed notifications:', error);
      throw new Error('Failed to send trip completed notifications');
    }
  }

  /**
   * Send notification when driver arrives at pickup location
   */
  static async notifyDriverArrived(bookingId: string) {
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

      // Notify user about driver arrival
      await NotificationService.createUserNotification(
        booking.userId,
        'DRIVER_ARRIVED',
        'Driver Arrived',
        `Driver ${booking.driver.user.name} has arrived at the pickup location. Please proceed to meet them.`,
        booking.id,
        'BOOKING',
        'HIGH'
      );

      // Notify admins about driver arrival
      await NotificationService.createAdminNotification(
        'DRIVER_ARRIVED',
        'Driver Arrived at Pickup',
        `Driver ${booking.driver.user.name} has arrived at pickup location for booking from ${booking.source} to ${booking.destination}`,
        booking.id,
        'BOOKING',
        'MEDIUM'
      );

      return { success: true, message: 'Driver arrival notifications sent successfully' };
    } catch (error) {
      console.error('Error sending driver arrival notifications:', error);
      throw new Error('Failed to send driver arrival notifications');
    }
  }

  /**
   * Send notification for payment status changes
   */
  static async notifyPaymentStatusChanged(paymentId: string, status: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: {
            include: {
              user: true,
              driver: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (status === 'COMPLETED') {
        // Notify user about successful payment
        await NotificationService.createUserNotification(
          payment.booking.userId,
          'PAYMENT_RECEIVED',
          'Payment Successful',
          `Your payment of $${payment.amount} has been received successfully. Your booking is now confirmed!`,
          payment.id,
          'PAYMENT',
          'HIGH'
        );

        // Notify driver about payment received
        await NotificationService.createDriverNotification(
          payment.booking.driverId,
          'PAYMENT_RECEIVED',
          'Payment Received',
          `Payment of $${payment.amount} has been received for your booking from ${payment.booking.source} to ${payment.booking.destination}`,
          payment.id,
          'PAYMENT',
          'HIGH'
        );

        // Notify admins about successful payment
        await NotificationService.createAdminNotification(
          'PAYMENT_RECEIVED',
          'Payment Completed',
          `Payment of $${payment.amount} received for booking from ${payment.booking.source} to ${payment.booking.destination}`,
          payment.id,
          'PAYMENT',
          'MEDIUM'
        );
      } else if (status === 'FAILED') {
        // Notify user about failed payment
        await NotificationService.createUserNotification(
          payment.booking.userId,
          'PAYMENT_FAILED',
          'Payment Failed',
          `Your payment of $${payment.amount} has failed. Please try again or contact support.`,
          payment.id,
          'PAYMENT',
          'HIGH'
        );

        // Notify admins about failed payment
        await NotificationService.createAdminNotification(
          'PAYMENT_FAILED',
          'Payment Failed',
          `Payment of $${payment.amount} failed for booking from ${payment.booking.source} to ${payment.booking.destination}`,
          payment.id,
          'PAYMENT',
          'HIGH'
        );
      }

      return { success: true, message: 'Payment status notifications sent successfully' };
    } catch (error) {
      console.error('Error sending payment status notifications:', error);
      throw new Error('Failed to send payment status notifications');
    }
  }

  /**
   * Send emergency alert notification
   */
  static async notifyEmergencyAlert(alertId: string) {
    try {
      const alert = await prisma.emergencyAlert.findUnique({
        where: { id: alertId },
        include: {
          user: true
        }
      });

      if (!alert) {
        throw new Error('Emergency alert not found');
      }

      // Notify user about emergency alert
      await NotificationService.createUserNotification(
        alert.userId,
        'EMERGENCY_ALERT',
        'Emergency Alert',
        `Your emergency alert has been received and is being processed. Help is on the way.`,
        alert.id,
        'EMERGENCY_ALERT',
        'URGENT'
      );

      // Notify all admins about emergency alert
      await NotificationService.createAdminNotification(
        'EMERGENCY_ALERT',
        'Emergency Alert',
        `Emergency alert from ${alert.user.name}: ${alert.description} at ${JSON.stringify(alert.location)}`,
        alert.id,
        'EMERGENCY_ALERT',
        'URGENT'
      );

      return { success: true, message: 'Emergency alert notifications sent successfully' };
    } catch (error) {
      console.error('Error sending emergency alert notifications:', error);
      throw new Error('Failed to send emergency alert notifications');
    }
  }

  /**
   * Send system alert notification
   */
  static async notifySystemAlert(title: string, message: string, priority: string = 'MEDIUM') {
    try {
      // Notify all users about system alert
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true }
      });

      const notifications = await Promise.all(
        users.map(user =>
          NotificationService.createUserNotification(
            user.id,
            'SYSTEM_ALERT',
            title,
            message,
            undefined,
            'SYSTEM',
            priority as any
          )
        )
      );

      return { success: true, message: 'System alert notifications sent successfully', count: notifications.length };
    } catch (error) {
      console.error('Error sending system alert notifications:', error);
      throw new Error('Failed to send system alert notifications');
    }
  }
}
