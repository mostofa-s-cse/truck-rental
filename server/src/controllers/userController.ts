import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const role = req.query.role as string;
      const search = req.query.search as string;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'users', { page, limit, role, search, requestedBy: userId });
      
      const result = await UserService.getAllUsers(page, limit, role as any, search);

      const response: ApiResponse = {
        success: true,
        message: 'Users retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_all_users', 
        userId,
        page: req.query.page,
        limit: req.query.limit,
        role: req.query.role,
        search: req.query.search
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get users',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const requestingUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'users', { targetUserId: userId, requestedBy: requestingUserId });
      
      const result = await UserService.getUserById(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const requestingUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_user_by_id', 
        targetUserId: req.params.userId,
        requestingUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get user',
        error: error.message
      };

      res.status(404).json(response);
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      const requestingUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('update', 'users', { targetUserId: userId, requestedBy: requestingUserId, fields: Object.keys(updateData) });
      
      const result = await UserService.updateUser(userId, updateData);

      const response: ApiResponse = {
        success: true,
        message: 'User updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const requestingUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'update_user', 
        targetUserId: req.params.userId,
        requestingUserId,
        updateData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update user',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async deactivateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const requestingUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('update', 'users', { targetUserId: userId, requestedBy: requestingUserId, action: 'deactivate' });
      
      const result = await UserService.deactivateUser(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User deactivated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const requestingUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'deactivate_user', 
        targetUserId: req.params.userId,
        requestingUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to deactivate user',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async activateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const requestingUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('update', 'users', { targetUserId: userId, requestedBy: requestingUserId, action: 'activate' });
      
      const result = await UserService.activateUser(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User activated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const requestingUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'activate_user', 
        targetUserId: req.params.userId,
        requestingUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to activate user',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getUserStats(req: Request, res: Response) {
    try {
      const requestingUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'users', { operation: 'stats', requestedBy: requestingUserId });
      
      const result = await UserService.getUserStats();

      const response: ApiResponse = {
        success: true,
        message: 'User statistics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const requestingUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_user_stats', 
        requestingUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get user statistics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async searchUsers(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const requestingUserId = (req as any).user?.userId || 'anonymous';
      
      if (!query) {
        throw new Error('Search query is required');
      }

      logDatabase('select', 'users', { operation: 'search', query, page, limit, requestedBy: requestingUserId });
      
      const result = await UserService.searchUsers(query, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Users search completed successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const requestingUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'search_users', 
        query: req.query.q,
        page: req.query.page,
        limit: req.query.limit,
        requestingUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to search users',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      logDatabase('select', 'users', { targetUserId: userId, operation: 'current_user' });
      
      const result = await UserService.getUserById(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Current user retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_current_user', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get current user',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async updateCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const updateData = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      const { role, isActive, ...safeUpdateData } = updateData;
      
      logDatabase('update', 'users', { targetUserId: userId, operation: 'current_user_update', fields: Object.keys(safeUpdateData) });
      
      const result = await UserService.updateUser(userId, safeUpdateData);

      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'update_current_user', 
        userId,
        updateData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update profile',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 