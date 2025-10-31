import { Request, Response } from 'express';
import { EmergencyAlertService, EmergencyAlertRequest } from '../services/emergencyAlertService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class EmergencyAlertController {
  static async createEmergencyAlert(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const alertData: EmergencyAlertRequest = {
        ...req.body,
        userId
      };
      
      logDatabase('insert', 'emergency_alerts', { 
        userId, 
        type: alertData.type, 
        severity: alertData.severity 
      });
      
      const result = await EmergencyAlertService.createEmergencyAlert(alertData);

      logDatabase('insert_success', 'emergency_alerts', { alertId: result.id, userId });

      const response: ApiResponse = {
        success: true,
        message: 'Emergency alert created successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'create_emergency_alert', 
        userId,
        alertData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create emergency alert',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getEmergencyAlerts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const severity = req.query.severity as string;
      const adminId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'emergency_alerts', { 
        page, 
        limit, 
        status, 
        severity, 
        requestedBy: adminId 
      });
      
      const result = await EmergencyAlertService.getEmergencyAlerts(page, limit, status, severity);

      const response: ApiResponse = {
        success: true,
        message: 'Emergency alerts retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_emergency_alerts', 
        adminId,
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
        severity: req.query.severity
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get emergency alerts',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getEmergencyAlertById(req: Request, res: Response) {
    try {
      const { alertId } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'emergency_alerts', { alertId, requestedBy: userId });
      
      const result = await EmergencyAlertService.getEmergencyAlertById(alertId);

      const response: ApiResponse = {
        success: true,
        message: 'Emergency alert retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_emergency_alert_by_id', 
        alertId: req.params.alertId,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get emergency alert',
        error: error.message
      };

      res.status(404).json(response);
    }
  }

  static async updateEmergencyAlertStatus(req: Request, res: Response) {
    try {
      const { alertId } = req.params;
      const { status } = req.body;
      const adminId = (req as any).user.userId;
      
      logDatabase('update', 'emergency_alerts', { 
        alertId, 
        status, 
        adminId 
      });
      
      const result = await EmergencyAlertService.updateEmergencyAlertStatus(alertId, status, adminId);

      logDatabase('update_success', 'emergency_alerts', { alertId, status, adminId });

      const response: ApiResponse = {
        success: true,
        message: 'Emergency alert status updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'update_emergency_alert_status', 
        alertId: req.params.alertId,
        status: req.body.status,
        adminId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update emergency alert status',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getUserEmergencyAlerts(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      logDatabase('select', 'emergency_alerts', { 
        userId, 
        page, 
        limit, 
        operation: 'user_alerts' 
      });
      
      const result = await EmergencyAlertService.getUserEmergencyAlerts(userId, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'User emergency alerts retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_user_emergency_alerts', 
        userId,
        page: req.query.page,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get user emergency alerts',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getEmergencyAlertStats(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'emergency_alerts', { 
        adminId, 
        operation: 'stats' 
      });
      
      const result = await EmergencyAlertService.getEmergencyAlertStats();

      const response: ApiResponse = {
        success: true,
        message: 'Emergency alert statistics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_emergency_alert_stats', 
        adminId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get emergency alert statistics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getActiveEmergencyAlerts(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'emergency_alerts', { 
        adminId, 
        operation: 'active_alerts' 
      });
      
      const result = await EmergencyAlertService.getActiveEmergencyAlerts();

      const response: ApiResponse = {
        success: true,
        message: 'Active emergency alerts retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_active_emergency_alerts', 
        adminId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get active emergency alerts',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 