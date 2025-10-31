import { Request, Response } from 'express';
import { TrackingService, LocationUpdate } from '../services/trackingService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class TrackingController {
  static async updateLocation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const locationData: LocationUpdate = {
        ...req.body,
        timestamp: new Date()
      };
      
      logDatabase('insert', 'tracking', { 
        userId, 
        driverId: locationData.driverId,
        latitude: locationData.latitude,
        longitude: locationData.longitude 
      });
      
      const result = await TrackingService.updateLocation(locationData);

      logDatabase('insert_success', 'tracking', { trackingId: result.id, driverId: locationData.driverId });

      const response: ApiResponse = {
        success: true,
        message: 'Location updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'update_location', 
        userId,
        locationData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update location',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getCurrentLocation(req: Request, res: Response) {
    try {
      const { driverId } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'tracking', { 
        driverId, 
        requestedBy: userId, 
        operation: 'current_location' 
      });
      
      const result = await TrackingService.getCurrentLocation(driverId);

      const response: ApiResponse = {
        success: true,
        message: 'Current location retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_current_location', 
        driverId: req.params.driverId,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get current location',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getTrackingHistory(req: Request, res: Response) {
    try {
      const { driverId } = req.params;
      const startTime = new Date(req.query.startTime as string);
      const endTime = new Date(req.query.endTime as string);
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'tracking', { 
        driverId, 
        startTime, 
        endTime, 
        requestedBy: userId,
        operation: 'tracking_history' 
      });
      
      const result = await TrackingService.getTrackingHistory(driverId, startTime, endTime);

      const response: ApiResponse = {
        success: true,
        message: 'Tracking history retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_tracking_history', 
        driverId: req.params.driverId,
        startTime: req.query.startTime,
        endTime: req.query.endTime,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get tracking history',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getActiveDriversInArea(req: Request, res: Response) {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const radius = parseFloat(req.query.radius as string) || 10;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'tracking', { 
        latitude, 
        longitude, 
        radius, 
        requestedBy: userId,
        operation: 'active_drivers_in_area' 
      });
      
      const result = await TrackingService.getActiveDriversInArea(latitude, longitude, radius);

      const response: ApiResponse = {
        success: true,
        message: 'Active drivers in area retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_active_drivers_in_area', 
        latitude: req.query.latitude,
        longitude: req.query.longitude,
        radius: req.query.radius,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get active drivers in area',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getDriverRoute(req: Request, res: Response) {
    try {
      const { driverId, bookingId } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'tracking', { 
        driverId, 
        bookingId, 
        requestedBy: userId,
        operation: 'driver_route' 
      });
      
      const result = await TrackingService.getDriverRoute(driverId, bookingId);

      const response: ApiResponse = {
        success: true,
        message: 'Driver route retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_driver_route', 
        driverId: req.params.driverId,
        bookingId: req.params.bookingId,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get driver route',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getTrackingStats(req: Request, res: Response) {
    try {
      const { driverId } = req.params;
      const days = parseInt(req.query.days as string) || 7;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'tracking', { 
        driverId, 
        days, 
        requestedBy: userId,
        operation: 'tracking_stats' 
      });
      
      const result = await TrackingService.getTrackingStats(driverId, days);

      const response: ApiResponse = {
        success: true,
        message: 'Tracking statistics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_tracking_stats', 
        driverId: req.params.driverId,
        days: req.query.days,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get tracking statistics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 