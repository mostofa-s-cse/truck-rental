import { Request, Response } from 'express';
import { AreaService } from '../services/areaService';

const areaService = new AreaService();

export class AreaController {
  /**
   * Get all areas with optional filtering
   */
  static async getAllAreas(req: Request, res: Response) {
    try {
      const { city, state, search, isActive } = req.query;
      
      const filters = {
        city: city as string,
        state: state as string,
        search: search as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
      };

      const areas = await areaService.getAllAreas(filters);
      
      res.json({
        success: true,
        data: areas,
        message: 'Areas retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getAllAreas:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve areas',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get areas grouped by state and city
   */
  static async getAreasGrouped(req: Request, res: Response) {
    try {
      const groupedAreas = await areaService.getAreasGrouped();
      
      res.json({
        success: true,
        data: groupedAreas,
        message: 'Grouped areas retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getAreasGrouped:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve grouped areas',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get areas in dropdown format for frontend
   */
  static async getAreasForDropdown(req: Request, res: Response) {
    try {
      const areas = await areaService.getAreasForDropdown();
      
      res.json({
        success: true,
        data: areas,
        message: 'Areas for dropdown retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getAreasForDropdown:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve areas for dropdown',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get area by ID
   */
  static async getAreaById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Area ID is required'
        });
      }

      const area = await areaService.getAreaById(id);
      
      if (!area) {
        return res.status(404).json({
          success: false,
          message: 'Area not found'
        });
      }

      res.json({
        success: true,
        data: area,
        message: 'Area retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getAreaById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve area',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create a new area
   */
  static async createArea(req: Request, res: Response) {
    try {
      const { name, city, state, isActive } = req.body;
      
      // Validation
      if (!name || !city || !state) {
        return res.status(400).json({
          success: false,
          message: 'Name, city, and state are required'
        });
      }

      const area = await areaService.createArea({
        name,
        city,
        state,
        isActive
      });

      res.status(201).json({
        success: true,
        data: area,
        message: 'Area created successfully'
      });
    } catch (error) {
      console.error('Error in createArea:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create area',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update an area
   */
  static async updateArea(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, city, state, isActive } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Area ID is required'
        });
      }

      const area = await areaService.updateArea(id, {
        name,
        city,
        state,
        isActive
      });

      res.json({
        success: true,
        data: area,
        message: 'Area updated successfully'
      });
    } catch (error) {
      console.error('Error in updateArea:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update area',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete an area
   */
  static async deleteArea(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Area ID is required'
        });
      }

      await areaService.deleteArea(id);

      res.json({
        success: true,
        message: 'Area deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteArea:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete area',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get cities by state
   */
  static async getCitiesByState(req: Request, res: Response) {
    try {
      const { state } = req.params;
      
      if (!state) {
        return res.status(400).json({
          success: false,
          message: 'State parameter is required'
        });
      }

      const cities = await areaService.getCitiesByState(state);
      
      res.json({
        success: true,
        data: cities,
        message: 'Cities retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getCitiesByState:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cities',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all states
   */
  static async getStates(req: Request, res: Response) {
    try {
      const states = await areaService.getStates();
      
      res.json({
        success: true,
        data: states,
        message: 'States retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getStates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve states',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 