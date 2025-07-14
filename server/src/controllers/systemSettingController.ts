import { Request, Response } from 'express';
import { SystemSettingService, CreateSystemSettingRequest, UpdateSystemSettingRequest } from '../services/systemSettingService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class SystemSettingController {
  static async createSystemSetting(req: Request, res: Response) {
    try {
      const settingData: CreateSystemSettingRequest = req.body;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('insert', 'system_settings', { adminUserId, key: settingData.key, type: settingData.type });
      
      const result = await SystemSettingService.createSystemSetting(settingData);

      const response: ApiResponse = {
        success: true,
        message: 'System setting created successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'create_system_setting', 
        adminUserId,
        settingData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create system setting',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getAllSystemSettings(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'system_settings', { userId, page, limit });
      
      const result = await SystemSettingService.getAllSystemSettings(page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'System settings retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_all_system_settings', 
        userId,
        page: req.query.page,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get system settings',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getSystemSettingByKey(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'system_settings', { key, userId });
      
      const result = await SystemSettingService.getSystemSettingByKey(key);

      const response: ApiResponse = {
        success: true,
        message: 'System setting retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_system_setting_by_key', 
        key: req.params.key,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get system setting',
        error: error.message
      };

      res.status(404).json(response);
    }
  }

  static async updateSystemSetting(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const updateData: UpdateSystemSettingRequest = req.body;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('update', 'system_settings', { key, adminUserId, updateFields: Object.keys(updateData) });
      
      const result = await SystemSettingService.updateSystemSetting(key, updateData);

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
        key: req.params.key,
        adminUserId,
        updateData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update system setting',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async deleteSystemSetting(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('delete', 'system_settings', { key, adminUserId });
      
      const result = await SystemSettingService.deleteSystemSetting(key);

      const response: ApiResponse = {
        success: true,
        message: 'System setting deleted successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'delete_system_setting', 
        key: req.params.key,
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete system setting',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getSystemSettingsByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'system_settings', { type, page, limit, userId, operation: 'by_type' });
      
      const result = await SystemSettingService.getSystemSettingsByType(type, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'System settings by type retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_system_settings_by_type', 
        type: req.params.type,
        page: req.query.page,
        limit: req.query.limit,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get system settings by type',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async searchSystemSettings(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user?.userId || 'anonymous';
      
      if (!query) {
        throw new Error('Search query is required');
      }

      logDatabase('select', 'system_settings', { query, page, limit, userId, operation: 'search' });
      
      const result = await SystemSettingService.searchSystemSettings(query, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'System settings search completed successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'search_system_settings', 
        query: req.query.q,
        page: req.query.page,
        limit: req.query.limit,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to search system settings',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getSystemSettingStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'system_settings', { userId, operation: 'stats' });
      
      const result = await SystemSettingService.getSystemSettingStats();

      const response: ApiResponse = {
        success: true,
        message: 'System setting statistics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_system_setting_stats', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get system setting statistics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getMultipleSystemSettings(req: Request, res: Response) {
    try {
      const { keys } = req.body;
      const userId = (req as any).user?.userId || 'anonymous';
      
      if (!Array.isArray(keys) || keys.length === 0) {
        throw new Error('Keys array is required');
      }

      logDatabase('select', 'system_settings', { keys, userId, operation: 'multiple' });
      
      const result = await SystemSettingService.getMultipleSystemSettings(keys);

      const response: ApiResponse = {
        success: true,
        message: 'Multiple system settings retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_multiple_system_settings', 
        keys: req.body.keys,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get multiple system settings',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async bulkUpdateSystemSettings(req: Request, res: Response) {
    try {
      const { updates } = req.body;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error('Updates array is required');
      }

      logDatabase('update', 'system_settings', { updates: updates.length, adminUserId, operation: 'bulk_update' });
      
      const result = await SystemSettingService.bulkUpdateSystemSettings(updates);

      const response: ApiResponse = {
        success: true,
        message: 'System settings bulk updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'bulk_update_system_settings', 
        updates: req.body.updates,
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to bulk update system settings',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 