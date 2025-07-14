import { Request, Response } from 'express';
import { AreaService, CreateAreaRequest, UpdateAreaRequest } from '../services/areaService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class AreaController {
  static async createArea(req: Request, res: Response) {
    try {
      const areaData: CreateAreaRequest = req.body;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('insert', 'areas', { adminUserId, name: areaData.name, city: areaData.city });
      
      const result = await AreaService.createArea(areaData);

      const response: ApiResponse = {
        success: true,
        message: 'Area created successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'create_area', 
        adminUserId,
        areaData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create area',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getAllAreas(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const includeInactive = req.query.includeInactive === 'true';
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'areas', { userId, page, limit, includeInactive });
      
      const result = await AreaService.getAllAreas(page, limit, includeInactive);

      const response: ApiResponse = {
        success: true,
        message: 'Areas retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_all_areas', 
        userId,
        page: req.query.page,
        limit: req.query.limit,
        includeInactive: req.query.includeInactive
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get areas',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getAreaById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'areas', { id, userId });
      
      const result = await AreaService.getAreaById(id);

      const response: ApiResponse = {
        success: true,
        message: 'Area retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_area_by_id', 
        id: req.params.id,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get area',
        error: error.message
      };

      res.status(404).json(response);
    }
  }

  static async updateArea(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateAreaRequest = req.body;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('update', 'areas', { id, adminUserId, updateFields: Object.keys(updateData) });
      
      const result = await AreaService.updateArea(id, updateData);

      const response: ApiResponse = {
        success: true,
        message: 'Area updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'update_area', 
        id: req.params.id,
        adminUserId,
        updateData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update area',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async deleteArea(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('delete', 'areas', { id, adminUserId });
      
      const result = await AreaService.deleteArea(id);

      const response: ApiResponse = {
        success: true,
        message: 'Area deleted successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'delete_area', 
        id: req.params.id,
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete area',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async deactivateArea(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('update', 'areas', { id, adminUserId, action: 'deactivate' });
      
      const result = await AreaService.deactivateArea(id);

      const response: ApiResponse = {
        success: true,
        message: 'Area deactivated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'deactivate_area', 
        id: req.params.id,
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to deactivate area',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async activateArea(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('update', 'areas', { id, adminUserId, action: 'activate' });
      
      const result = await AreaService.activateArea(id);

      const response: ApiResponse = {
        success: true,
        message: 'Area activated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'activate_area', 
        id: req.params.id,
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to activate area',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async searchAreas(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user?.userId || 'anonymous';
      
      if (!query) {
        throw new Error('Search query is required');
      }

      logDatabase('select', 'areas', { query, page, limit, userId, operation: 'search' });
      
      const result = await AreaService.searchAreas(query, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Areas search completed successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'search_areas', 
        query: req.query.q,
        page: req.query.page,
        limit: req.query.limit,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to search areas',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getAreasByCity(req: Request, res: Response) {
    try {
      const { city } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'areas', { city, page, limit, userId, operation: 'by_city' });
      
      const result = await AreaService.getAreasByCity(city, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Areas by city retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_areas_by_city', 
        city: req.params.city,
        page: req.query.page,
        limit: req.query.limit,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get areas by city',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getAreasByState(req: Request, res: Response) {
    try {
      const { state } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'areas', { state, page, limit, userId, operation: 'by_state' });
      
      const result = await AreaService.getAreasByState(state, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Areas by state retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_areas_by_state', 
        state: req.params.state,
        page: req.query.page,
        limit: req.query.limit,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get areas by state',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getAreaStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'areas', { userId, operation: 'stats' });
      
      const result = await AreaService.getAreaStats();

      const response: ApiResponse = {
        success: true,
        message: 'Area statistics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_area_stats', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get area statistics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 