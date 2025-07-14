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
} 