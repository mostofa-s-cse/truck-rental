import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class AdminController {
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'admin', { operation: 'dashboard_stats', requestedBy: adminUserId });
      
      const result = await AdminService.getDashboardStats();

      const response: ApiResponse = {
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_dashboard_stats', 
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get dashboard statistics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getBookingAnalytics(req: Request, res: Response) {
    try {
      const timeRange = req.query.timeRange as 'day' | 'week' | 'month' | 'year' || 'month';
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'admin', { operation: 'booking_analytics', timeRange, requestedBy: adminUserId });
      
      const result = await AdminService.getBookingAnalytics(timeRange);

      const response: ApiResponse = {
        success: true,
        message: 'Booking analytics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_booking_analytics', 
        adminUserId,
        timeRange: req.query.timeRange
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get booking analytics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getDriverAnalytics(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'admin', { operation: 'driver_analytics', requestedBy: adminUserId });
      
      const result = await AdminService.getDriverAnalytics();

      const response: ApiResponse = {
        success: true,
        message: 'Driver analytics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_driver_analytics', 
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get driver analytics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getSystemSettings(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'admin', { operation: 'system_settings', requestedBy: adminUserId });
      
      const result = await AdminService.getSystemSettings();

      const response: ApiResponse = {
        success: true,
        message: 'System settings retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_system_settings', 
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get system settings',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async updateSystemSetting(req: Request, res: Response) {
    try {
      const { key, value, type } = req.body;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      if (!key || value === undefined || !type) {
        throw new Error('Key, value, and type are required');
      }

      logDatabase('update', 'admin', { operation: 'update_system_setting', key, type, requestedBy: adminUserId });
      
      const result = await AdminService.updateSystemSetting(key, value, type);

      logDatabase('update_success', 'admin', { operation: 'system_setting_updated', key, requestedBy: adminUserId });

      const response: ApiResponse = {
        success: true,
        message: 'System setting updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'update_system_setting', 
        adminUserId,
        key: req.body.key,
        type: req.body.type
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update system setting',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getPendingDriverVerifications(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'admin', { operation: 'pending_driver_verifications', requestedBy: adminUserId });
      
      const result = await AdminService.getPendingDriverVerifications();

      const response: ApiResponse = {
        success: true,
        message: 'Pending driver verifications retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_pending_driver_verifications', 
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get pending driver verifications',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getBookingReports(req: Request, res: Response) {
    try {
      const filters = {
        status: req.query.status as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        driverId: req.query.driverId as string,
        userId: req.query.userId as string
      };
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'admin', { operation: 'booking_reports', filters, requestedBy: adminUserId });
      
      const result = await AdminService.getBookingReports(filters);

      const response: ApiResponse = {
        success: true,
        message: 'Booking reports retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_booking_reports', 
        adminUserId,
        filters: req.query
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get booking reports',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getRevenueReport(req: Request, res: Response) {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const adminUserId = (req as any).user?.userId || 'anonymous';

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Valid startDate and endDate are required');
      }

      logDatabase('select', 'admin', { operation: 'revenue_report', startDate, endDate, requestedBy: adminUserId });
      
      const result = await AdminService.getRevenueReport(startDate, endDate);

      const response: ApiResponse = {
        success: true,
        message: 'Revenue report retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_revenue_report', 
        adminUserId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get revenue report',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 