import { Request, Response } from 'express';
import { TruckCategoryService, CreateTruckCategoryRequest, UpdateTruckCategoryRequest } from '../services/truckCategoryService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class TruckCategoryController {
  static async createTruckCategory(req: Request, res: Response) {
    try {
      const truckCategoryData: CreateTruckCategoryRequest = req.body;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('insert', 'truck_categories', { adminUserId, name: truckCategoryData.name });
      
      const result = await TruckCategoryService.createTruckCategory(truckCategoryData);

      const response: ApiResponse = {
        success: true,
        message: 'Truck category created successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'create_truck_category', 
        adminUserId,
        truckCategoryData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create truck category',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getAllTruckCategories(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const includeInactive = req.query.includeInactive === 'true';
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'truck_categories', { userId, page, limit, includeInactive });
      
      const result = await TruckCategoryService.getAllTruckCategories(page, limit, includeInactive);

      const response: ApiResponse = {
        success: true,
        message: 'Truck categories retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_all_truck_categories', 
        userId,
        page: req.query.page,
        limit: req.query.limit,
        includeInactive: req.query.includeInactive
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get truck categories',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getTruckCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'truck_categories', { id, userId });
      
      const result = await TruckCategoryService.getTruckCategoryById(id);

      const response: ApiResponse = {
        success: true,
        message: 'Truck category retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_truck_category_by_id', 
        id: req.params.id,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get truck category',
        error: error.message
      };

      res.status(404).json(response);
    }
  }

  static async updateTruckCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateTruckCategoryRequest = req.body;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('update', 'truck_categories', { id, adminUserId, updateFields: Object.keys(updateData) });
      
      const result = await TruckCategoryService.updateTruckCategory(id, updateData);

      const response: ApiResponse = {
        success: true,
        message: 'Truck category updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'update_truck_category', 
        id: req.params.id,
        adminUserId,
        updateData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update truck category',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async deleteTruckCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('delete', 'truck_categories', { id, adminUserId });
      
      const result = await TruckCategoryService.deleteTruckCategory(id);

      const response: ApiResponse = {
        success: true,
        message: 'Truck category deleted successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'delete_truck_category', 
        id: req.params.id,
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete truck category',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async deactivateTruckCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('update', 'truck_categories', { id, adminUserId, action: 'deactivate' });
      
      const result = await TruckCategoryService.deactivateTruckCategory(id);

      const response: ApiResponse = {
        success: true,
        message: 'Truck category deactivated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'deactivate_truck_category', 
        id: req.params.id,
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to deactivate truck category',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async activateTruckCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('update', 'truck_categories', { id, adminUserId, action: 'activate' });
      
      const result = await TruckCategoryService.activateTruckCategory(id);

      const response: ApiResponse = {
        success: true,
        message: 'Truck category activated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'activate_truck_category', 
        id: req.params.id,
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to activate truck category',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async searchTruckCategories(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user?.userId || 'anonymous';
      
      if (!query) {
        throw new Error('Search query is required');
      }

      logDatabase('select', 'truck_categories', { query, page, limit, userId, operation: 'search' });
      
      const result = await TruckCategoryService.searchTruckCategories(query, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Truck categories search completed successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'search_truck_categories', 
        query: req.query.q,
        page: req.query.page,
        limit: req.query.limit,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to search truck categories',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getTruckCategoryStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'truck_categories', { userId, operation: 'stats' });
      
      const result = await TruckCategoryService.getTruckCategoryStats();

      const response: ApiResponse = {
        success: true,
        message: 'Truck category statistics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_truck_category_stats', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get truck category statistics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 