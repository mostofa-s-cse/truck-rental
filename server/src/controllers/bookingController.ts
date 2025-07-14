import { Request, Response } from 'express';
import { BookingService } from '../services/bookingService';
import { CreateBookingRequest, UpdateBookingRequest, ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

export class BookingController {
  static async createBooking(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const bookingData: CreateBookingRequest = req.body;
      
      logDatabase('insert', 'bookings', { userId, bookingData: { ...bookingData, driverId: bookingData.driverId } });
      
      const result = await BookingService.createBooking(userId, bookingData);

      logDatabase('insert_success', 'bookings', { bookingId: result.id, userId, driverId: bookingData.driverId });

      const response: ApiResponse = {
        success: true,
        message: 'Booking created successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'create_booking', 
        userId,
        bookingData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create booking',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async updateBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const updateData: UpdateBookingRequest = req.body;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('update', 'bookings', { bookingId, userId, updateFields: Object.keys(updateData) });
      
      const result = await BookingService.updateBooking(bookingId, updateData);

      logDatabase('update_success', 'bookings', { bookingId, userId });

      const response: ApiResponse = {
        success: true,
        message: 'Booking updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'update_booking', 
        bookingId: req.params.bookingId,
        userId,
        updateData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update booking',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'bookings', { bookingId, requestedBy: userId });
      
      const result = await BookingService.getBooking(bookingId);

      const response: ApiResponse = {
        success: true,
        message: 'Booking retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_booking', 
        bookingId: req.params.bookingId,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get booking',
        error: error.message
      };

      res.status(404).json(response);
    }
  }

  static async getUserBookings(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      logDatabase('select', 'bookings', { userId, page, limit, operation: 'user_bookings' });
      
      const result = await BookingService.getUserBookings(userId, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'User bookings retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_user_bookings', 
        userId,
        page: req.query.page,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get user bookings',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getDriverBookings(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      logDatabase('select', 'drivers', { userId, operation: 'find_driver_for_bookings' });
      
      const prisma = new PrismaClient();
      
      // Get driver ID from user ID
      const driver = await prisma.driver.findUnique({
        where: { userId }
      });

      if (!driver) {
        throw new Error('Driver profile not found');
      }

      logDatabase('select', 'bookings', { driverId: driver.id, page, limit, operation: 'driver_bookings' });
      
      const result = await BookingService.getDriverBookings(driver.id, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Driver bookings retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_driver_bookings', 
        userId,
        page: req.query.page,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get driver bookings',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getAllBookings(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'bookings', { page, limit, status, requestedBy: userId, operation: 'all_bookings' });
      
      const result = await BookingService.getAllBookings(page, limit, status as any);

      const response: ApiResponse = {
        success: true,
        message: 'All bookings retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_all_bookings', 
        userId,
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get all bookings',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async cancelBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const userId = (req as any).user.userId;
      
      logDatabase('update', 'bookings', { bookingId, userId, action: 'cancel' });
      
      const result = await BookingService.cancelBooking(bookingId, userId);

      logDatabase('update_success', 'bookings', { bookingId, userId, action: 'cancelled' });

      const response: ApiResponse = {
        success: true,
        message: 'Booking cancelled successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'cancel_booking', 
        bookingId: req.params.bookingId,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to cancel booking',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 