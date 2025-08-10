import { Request, Response } from 'express';
import { AreaSearchService, AreaSearchRequest } from '../services/areaSearchService';
import { ApiResponse } from '../types';
import { logError } from '../utils/logger';

export class AreaSearchController {
  /**
   * Search for areas dynamically
   */
  static async searchAreas(req: Request, res: Response) {
    try {
      const { query, latitude, longitude, radius, limit } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Query parameter is required and must be a string',
          error: 'INVALID_QUERY'
        });
      }

      const searchRequest: AreaSearchRequest = {
        query: query.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        radius: radius ? parseInt(radius) : undefined,
        limit: limit ? parseInt(limit) : undefined
      };

      const results = await AreaSearchService.searchAreas(searchRequest);

      const response: ApiResponse = {
        success: true,
        message: 'Areas found successfully',
        data: results
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'search_areas',
        requestBody: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to search areas',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get areas for dropdown (compatible with existing API)
   */
  static async getAreasForDropdown(req: Request, res: Response) {
    try {
      const areas = await AreaSearchService.getAreasForDropdown();

      const response: ApiResponse = {
        success: true,
        message: 'Areas retrieved successfully',
        data: areas
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_areas_dropdown'
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get areas',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get all Dhaka areas (Public)
   */
  static async getDhakaAreas(req: Request, res: Response) {
    try {
      const { search = '', limit = '500' } = req.query as { search?: string; limit?: string };
      const limitNum = parseInt(limit as string) || 500;

      const areas = await AreaSearchService.getDhakaAreas(search as string, limitNum);

      const response: ApiResponse = {
        success: true,
        message: 'Dhaka areas retrieved successfully',
        data: areas
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { operation: 'get_dhaka_areas', query: req.query });
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get Dhaka areas',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get popular areas based on search count
   */
  static async getPopularAreas(req: Request, res: Response) {
    try {
      const { limit = 10 } = req.query;
      const limitNum = parseInt(limit as string) || 10;

      // This would typically query the database for most searched areas
      // For now, return common areas
      const areas = await AreaSearchService.getAreasForDropdown();
      const popularAreas = areas.slice(0, limitNum);

      const response: ApiResponse = {
        success: true,
        message: 'Popular areas retrieved successfully',
        data: popularAreas
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_popular_areas'
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get popular areas',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get nearby areas based on coordinates
   */
  static async getNearbyAreas(req: Request, res: Response) {
    try {
      const { latitude, longitude, radius = 50, limit = 20 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required',
          error: 'MISSING_COORDINATES'
        });
      }

      const searchRequest: AreaSearchRequest = {
        query: '', // Empty query to get all nearby places
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
        radius: parseInt(radius as string),
        limit: parseInt(limit as string)
      };

      const results = await AreaSearchService.searchAreas(searchRequest);

      const response: ApiResponse = {
        success: true,
        message: 'Nearby areas found successfully',
        data: results
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_nearby_areas',
        query: req.query
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get nearby areas',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get areas grouped by state and city
   */
  static async getAreasGrouped(req: Request, res: Response) {
    try {
      const areas = await AreaSearchService.getAreasForDropdown();
      
      // Group areas by state and city
      const grouped: { [state: string]: { [city: string]: any[] } } = {};
      
      areas.forEach(area => {
        const state = area.area.split(', ')[1] || 'Unknown';
        const city = area.area.split(', ')[0] || 'Unknown';
        
        if (!grouped[state]) {
          grouped[state] = {};
        }
        if (!grouped[state][city]) {
          grouped[state][city] = [];
        }
        grouped[state][city].push(area);
      });

      const response: ApiResponse = {
        success: true,
        message: 'Areas grouped successfully',
        data: grouped
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_areas_grouped'
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get grouped areas',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get cities by state
   */
  static async getCitiesByState(req: Request, res: Response) {
    try {
      const { state } = req.params;
      const areas = await AreaSearchService.getAreasForDropdown();
      
      const cities = [...new Set(
        areas
          .filter(area => area.area.includes(state))
          .map(area => area.area.split(', ')[0])
      )];

      const response: ApiResponse = {
        success: true,
        message: 'Cities retrieved successfully',
        data: cities
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_cities_by_state',
        state: req.params.state
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get cities',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get all states
   */
  static async getStates(req: Request, res: Response) {
    try {
      const areas = await AreaSearchService.getAreasForDropdown();
      
      const states = [...new Set(
        areas.map(area => area.area.split(', ')[1]).filter(Boolean)
      )];

      const response: ApiResponse = {
        success: true,
        message: 'States retrieved successfully',
        data: states
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_states'
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get states',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get all areas with filters (Admin only)
   */
  static async getAllAreas(req: Request, res: Response) {
    try {
      const { city, state, search, isActive } = req.query;
      
      const filters = {
        city: city as string,
        state: state as string,
        search: search as string,
        isActive: isActive === 'true'
      };

      const results = await AreaSearchService.searchAreas({
        query: filters.search || '',
        limit: 100
      });

      const response: ApiResponse = {
        success: true,
        message: 'Areas retrieved successfully',
        data: results
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_all_areas',
        query: req.query
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get areas',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get area by ID (Admin only)
   */
  static async getAreaById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // For now, return null as we don't have database integration yet
      const response: ApiResponse = {
        success: false,
        message: 'Area not found',
        data: null
      };

      res.status(404).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_area_by_id',
        id: req.params.id
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get area',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Create new area (Admin only)
   */
  static async createArea(req: Request, res: Response) {
    try {
      const areaData = req.body;
      
      // For now, return success but don't actually create
      const response: ApiResponse = {
        success: true,
        message: 'Area creation temporarily disabled until schema migration',
        data: { id: `temp-${Date.now()}` }
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'create_area',
        data: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create area',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Update area (Admin only)
   */
  static async updateArea(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // For now, return success but don't actually update
      const response: ApiResponse = {
        success: true,
        message: 'Area update temporarily disabled until schema migration',
        data: { id }
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'update_area',
        id: req.params.id,
        data: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update area',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Delete area (Admin only)
   */
  static async deleteArea(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // For now, return success but don't actually delete
      const response: ApiResponse = {
        success: true,
        message: 'Area deletion temporarily disabled until schema migration',
        data: { id }
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'delete_area',
        id: req.params.id
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete area',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get area search analytics (Admin only)
   */
  static async getAnalytics(req: Request, res: Response) {
    try {
      // For now, return mock analytics
      const analytics = {
        totalAreas: 20,
        totalSearches: 0,
        popularAreas: [
          { name: 'Dhaka', searches: 0 },
          { name: 'Chittagong', searches: 0 },
          { name: 'Sylhet', searches: 0 }
        ],
        searchTrends: {
          last7Days: 0,
          last30Days: 0,
          last90Days: 0
        }
      };

      const response: ApiResponse = {
        success: true,
        message: 'Analytics retrieved successfully',
        data: analytics
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_analytics'
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get analytics',
        error: error.message
      };

      res.status(500).json(response);
    }
  }
} 