import { Request, Response } from 'express';
import { FareCalculationService, FareCalculationRequest } from '../services/fareCalculationService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FareCalculationController {
  static async calculateFare(req: Request, res: Response) {
    try {
      const fareRequest: FareCalculationRequest = req.body;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'fare_calculation', { 
        userId, 
        source: fareRequest.source, 
        destination: fareRequest.destination,
        truckType: fareRequest.truckType 
      });
      
      const result = await FareCalculationService.calculateFare(fareRequest);

      const response: ApiResponse = {
        success: true,
        message: 'Fare calculated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'calculate_fare', 
        userId,
        request: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to calculate fare',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getFareHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      logDatabase('select', 'fare_history', { userId, page, limit });
      
      const result = await FareCalculationService.getFareHistory(userId, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Fare history retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_fare_history', 
        userId,
        page: req.query.page,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get fare history',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getFareAnalytics(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.userId;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      logDatabase('select', 'fare_analytics', { 
        adminId, 
        startDate, 
        endDate 
      });
      
      const result = await FareCalculationService.getFareAnalytics(adminId, startDate, endDate);

      const response: ApiResponse = {
        success: true,
        message: 'Fare analytics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_fare_analytics', 
        adminId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get fare analytics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getTruckCategories(req: Request, res: Response) {
    try {
      logDatabase('select', 'truck_categories', {});
      
      const categories = await prisma.truckCategory.findMany({
        where: { isActive: true },
        orderBy: { capacity: 'asc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Truck categories retrieved successfully',
        data: categories
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'get_truck_categories'
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get truck categories',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getRouteDetails(req: Request, res: Response) {
    try {
      const { source, destination } = req.body;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'route_details', { 
        userId, 
        source, 
        destination 
      });
      
      const result = await FareCalculationService.getRouteDetails(source, destination);

      const response: ApiResponse = {
        success: true,
        message: 'Route details retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_route_details', 
        userId,
        request: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get route details',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 