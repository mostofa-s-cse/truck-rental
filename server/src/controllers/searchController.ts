import { Request, Response } from 'express';
import { SearchService, SearchFilters } from '../services/searchService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class SearchController {
  static async searchTrucks(req: Request, res: Response) {
    try {
      const filters: SearchFilters = req.body;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user?.userId || 'anonymous';
      
      // Validate pagination parameters
      if (page < 1) {
        return res.status(400).json({
          success: false,
          message: 'Page number must be greater than 0',
          error: 'Invalid page parameter'
        });
      }
      
      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: 'Limit must be between 1 and 100',
          error: 'Invalid limit parameter'
        });
      }
      
      logDatabase('select', 'search_trucks', { 
        userId, 
        filters, 
        page, 
        limit 
      });
      
      const result = await SearchService.searchTrucks(filters, page, limit);

      const response: ApiResponse = {
        success: true,
        message: `Found ${result.total} trucks matching your criteria`,
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'search_trucks', 
        userId,
        filters: req.body,
        page: req.query.page,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to search trucks',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  static async getPopularTrucks(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'popular_trucks', { userId, limit });
      
      const result = await SearchService.getPopularTrucks(limit);

      const response: ApiResponse = {
        success: true,
        message: 'Popular trucks retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_popular_trucks', 
        userId,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get popular trucks',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getNearbyTrucks(req: Request, res: Response) {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const radius = parseFloat(req.query.radius as string) || 10;
      const limit = parseInt(req.query.limit as string) || 20;
      const userId = (req as any).user?.userId || 'anonymous';
      
      // Validate required parameters
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          success: false,
          message: 'Valid latitude and longitude are required',
          error: 'Missing or invalid coordinates'
        });
      }
      
      // Validate coordinate ranges
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          success: false,
          message: 'Latitude must be between -90 and 90',
          error: 'Invalid latitude'
        });
      }
      
      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: 'Longitude must be between -180 and 180',
          error: 'Invalid longitude'
        });
      }
      
      // Validate radius
      if (radius <= 0 || radius > 100) {
        return res.status(400).json({
          success: false,
          message: 'Radius must be between 0 and 100 km',
          error: 'Invalid radius'
        });
      }
      
      logDatabase('select', 'nearby_trucks', { 
        userId, 
        latitude, 
        longitude, 
        radius, 
        limit 
      });
      
      const result = await SearchService.getNearbyTrucks(latitude, longitude, radius, limit);

      const response: ApiResponse = {
        success: true,
        message: `Found ${result.length} trucks within ${radius}km`,
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_nearby_trucks', 
        userId,
        latitude: req.query.latitude,
        longitude: req.query.longitude,
        radius: req.query.radius,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get nearby trucks',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  static async getTruckRecommendations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      
      logDatabase('select', 'truck_recommendations', { userId, limit });
      
      const result = await SearchService.getTruckRecommendations(userId, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Truck recommendations retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_truck_recommendations', 
        userId,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get truck recommendations',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getSearchSuggestions(req: Request, res: Response) {
    try {
      const { query } = req.query;
      const userId = (req as any).user?.userId || 'anonymous';
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Query parameter is required',
          error: 'Missing or invalid query parameter'
        });
      }
      
      logDatabase('select', 'search_suggestions', { userId, query });
      
      const result = await SearchService.getSearchSuggestions(query);

      const response: ApiResponse = {
        success: true,
        message: 'Search suggestions retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_search_suggestions', 
        userId,
        query: req.query.query
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get search suggestions',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getAdvancedSearch(req: Request, res: Response) {
    try {
      const {
        truckType,
        capacity,
        location,
        latitude,
        longitude,
        radius,
        rating,
        minPrice,
        maxPrice,
        availability,
        verified,
        quality,
        sortBy,
        sortOrder,
        minTrips,
        maxTrips,
        page,
        limit
      } = req.query;

      // Build comprehensive filters
      const filters: SearchFilters & {
        sortBy?: 'rating' | 'distance' | 'price' | 'totalTrips';
        sortOrder?: 'asc' | 'desc';
        minTrips?: number;
        maxTrips?: number;
      } = {};

      // Basic filters
      if (truckType) filters.truckType = truckType as SearchFilters['truckType'];
      if (capacity) filters.capacity = parseFloat(capacity as string);
      if (location) filters.location = location as string;
      if (latitude) filters.latitude = parseFloat(latitude as string);
      if (longitude) filters.longitude = parseFloat(longitude as string);
      if (radius) filters.radius = parseFloat(radius as string);
      if (rating) filters.rating = parseFloat(rating as string);
      if (minPrice || maxPrice) {
        filters.priceRange = {};
        if (minPrice) filters.priceRange.min = parseFloat(minPrice as string);
        if (maxPrice) filters.priceRange.max = parseFloat(maxPrice as string);
      }
      if (availability !== undefined) filters.availability = availability === 'true';
      if (verified !== undefined) filters.verified = verified === 'true';
      if (quality) filters.quality = quality as SearchFilters['quality'];

      // Advanced filters
      if (sortBy) filters.sortBy = sortBy as 'rating' | 'distance' | 'price' | 'totalTrips';
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';
      if (minTrips) filters.minTrips = parseInt(minTrips as string);
      if (maxTrips) filters.maxTrips = parseInt(maxTrips as string);

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const userId = (req as any).user?.userId || 'anonymous';
      
      // Validate pagination
      if (pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Page number must be greater than 0',
          error: 'Invalid page parameter'
        });
      }
      
      if (limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Limit must be between 1 and 100',
          error: 'Invalid limit parameter'
        });
      }
      
      logDatabase('select', 'advanced_search', { 
        userId, 
        filters, 
        page: pageNum, 
        limit: limitNum 
      });
      
      const result = await SearchService.advancedSearch(filters, pageNum, limitNum);

      const response: ApiResponse = {
        success: true,
        message: `Advanced search completed. Found ${result.total} trucks matching criteria`,
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'advanced_search', 
        userId,
        query: req.query
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to perform advanced search',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  // Get search statistics and analytics
  static async getSearchStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'search_stats', { userId });
      
      // Get basic statistics
      const totalDrivers = await SearchService.getTotalDrivers();
      const availableDrivers = await SearchService.getAvailableDrivers();
      const verifiedDrivers = await SearchService.getVerifiedDrivers();
      const avgRating = await SearchService.getAverageRating();
      
      const stats = {
        totalDrivers,
        availableDrivers,
        verifiedDrivers,
        averageRating: avgRating,
        availabilityRate: totalDrivers > 0 ? (availableDrivers / totalDrivers * 100).toFixed(1) : 0,
        verificationRate: totalDrivers > 0 ? (verifiedDrivers / totalDrivers * 100).toFixed(1) : 0
      };

      const response: ApiResponse = {
        success: true,
        message: 'Search statistics retrieved successfully',
        data: stats
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_search_stats', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get search statistics',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  // Get truck types with counts
  static async getTruckTypeStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'truck_type_stats', { userId });
      
      const truckTypeStats = await SearchService.getTruckTypeStats();

      const response: ApiResponse = {
        success: true,
        message: 'Truck type statistics retrieved successfully',
        data: truckTypeStats
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_truck_type_stats', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get truck type statistics',
        error: error.message
      };

      res.status(500).json(response);
    }
  }
} 