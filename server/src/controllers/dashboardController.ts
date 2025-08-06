import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class DashboardController {
  static async getUserDashboardStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      logDatabase('select', 'dashboard_stats', { userId, type: 'user' });
      
      const result = await DashboardService.getUserDashboardStats(userId);

      logDatabase('select_success', 'dashboard_stats', { userId, type: 'user' });

      const response: ApiResponse = {
        success: true,
        message: 'User dashboard stats retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_user_dashboard_stats', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get user dashboard stats',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getDriverDashboardStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      logDatabase('select', 'dashboard_stats', { userId, type: 'driver' });
      
      const result = await DashboardService.getDriverDashboardStats(userId);

      logDatabase('select_success', 'dashboard_stats', { userId, type: 'driver' });

      const response: ApiResponse = {
        success: true,
        message: 'Driver dashboard stats retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_driver_dashboard_stats', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get driver dashboard stats',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  // Admin Dashboard Methods
  static async getAdminDashboardStats(req: Request, res: Response) {
    try {
      logDatabase('select', 'admin_dashboard_stats');
      
      const result = await DashboardService.getAdminDashboardStats();

      logDatabase('select_success', 'admin_dashboard_stats');

      const response: ApiResponse = {
        success: true,
        message: 'Admin dashboard stats retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_admin_dashboard_stats'
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get admin dashboard stats',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getPendingDriverVerifications(req: Request, res: Response) {
    try {
      logDatabase('select', 'pending_driver_verifications');
      
      const result = await DashboardService.getPendingDriverVerifications();

      logDatabase('select_success', 'pending_driver_verifications');

      const response: ApiResponse = {
        success: true,
        message: 'Pending driver verifications retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_pending_driver_verifications'
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get pending driver verifications',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getRecentBookings(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      logDatabase('select', 'recent_bookings', { limit });
      
      const result = await DashboardService.getRecentBookings(limit);

      logDatabase('select_success', 'recent_bookings', { limit });

      const response: ApiResponse = {
        success: true,
        message: 'Recent bookings retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_recent_bookings'
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get recent bookings',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async approveDriver(req: Request, res: Response) {
    try {
      const { driverId } = req.params;
      
      logDatabase('update', 'driver_verification', { driverId, action: 'approve' });
      
      await DashboardService.approveDriver(driverId);

      logDatabase('update_success', 'driver_verification', { driverId, action: 'approve' });

      const response: ApiResponse = {
        success: true,
        message: 'Driver approved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const driverId = req.params.driverId || 'unknown';
      
      logError(error, { 
        operation: 'approve_driver',
        driverId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to approve driver',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async rejectDriver(req: Request, res: Response) {
    try {
      const { driverId } = req.params;
      
      logDatabase('update', 'driver_verification', { driverId, action: 'reject' });
      
      await DashboardService.rejectDriver(driverId);

      logDatabase('update_success', 'driver_verification', { driverId, action: 'reject' });

      const response: ApiResponse = {
        success: true,
        message: 'Driver rejected successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const driverId = req.params.driverId || 'unknown';
      
      logError(error, { 
        operation: 'reject_driver',
        driverId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to reject driver',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  // Driver-specific methods
  static async updateDriverAvailability(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { isAvailable } = req.body;
      
      logDatabase('update', 'driver_availability', { userId, isAvailable });
      
      await DashboardService.updateDriverAvailability(userId, isAvailable);

      logDatabase('update_success', 'driver_availability', { userId, isAvailable });

      const response: ApiResponse = {
        success: true,
        message: 'Driver availability updated successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'update_driver_availability',
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update driver availability',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async acceptBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      
      logDatabase('update', 'booking_status', { bookingId, action: 'accept' });
      
      await DashboardService.acceptBooking(bookingId);

      logDatabase('update_success', 'booking_status', { bookingId, action: 'accept' });

      const response: ApiResponse = {
        success: true,
        message: 'Booking accepted successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const bookingId = req.params.bookingId || 'unknown';
      
      logError(error, { 
        operation: 'accept_booking',
        bookingId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to accept booking',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async declineBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      
      logDatabase('update', 'booking_status', { bookingId, action: 'decline' });
      
      await DashboardService.declineBooking(bookingId);

      logDatabase('update_success', 'booking_status', { bookingId, action: 'decline' });

      const response: ApiResponse = {
        success: true,
        message: 'Booking declined successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const bookingId = req.params.bookingId || 'unknown';
      
      logError(error, { 
        operation: 'decline_booking',
        bookingId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to decline booking',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  // User-specific methods
  static async searchDrivers(req: Request, res: Response) {
    try {
      const { location, truckType, capacity, latitude, longitude, radius } = req.query;
      
      logDatabase('select', 'search_drivers', { location, truckType, capacity });
      
      const result = await DashboardService.searchDrivers({
        location: location as string,
        truckType: truckType as string,
        capacity: capacity ? parseInt(capacity as string) : undefined,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        radius: radius ? parseInt(radius as string) : undefined
      });

      logDatabase('select_success', 'search_drivers', { location, truckType, capacity });

      const response: ApiResponse = {
        success: true,
        message: 'Drivers search completed successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'search_drivers'
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to search drivers',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async calculateFare(req: Request, res: Response) {
    try {
      const { source, destination, truckType } = req.body;
      
      logDatabase('calculate', 'fare', { source, destination, truckType });
      
      const result = await DashboardService.calculateFare({
        source,
        destination,
        truckType
      });

      logDatabase('calculate_success', 'fare', { source, destination, truckType });

      const response: ApiResponse = {
        success: true,
        message: 'Fare calculated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'calculate_fare'
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to calculate fare',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getRevenueAnalytics(req: Request, res: Response) {
    try {
      const filters = req.query;
      
      logDatabase('select', 'revenue_analytics', { filters });
      
      const result = await DashboardService.getRevenueAnalytics(filters);

      logDatabase('select_success', 'revenue_analytics', { filters });

      const response: ApiResponse = {
        success: true,
        message: 'Revenue analytics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_revenue_analytics',
        query: req.query
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get revenue analytics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getBookingAnalytics(req: Request, res: Response) {
    try {
      const filters = req.query;
      
      logDatabase('select', 'booking_analytics', { filters });
      
      const result = await DashboardService.getBookingAnalytics(filters);

      logDatabase('select_success', 'booking_analytics', { filters });

      const response: ApiResponse = {
        success: true,
        message: 'Booking analytics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_booking_analytics',
        query: req.query
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get booking analytics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 