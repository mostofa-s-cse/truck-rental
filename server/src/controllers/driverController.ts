import { Request, Response } from 'express';
import { DriverService } from '../services/driverService';
import { CreateDriverRequest, SearchDriversRequest, ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class DriverController {
  static async createDriver(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const driverData: CreateDriverRequest = req.body;
      
      logDatabase('insert', 'drivers', { userId, driverData: { ...driverData, license: driverData.license } });
      
      const result = await DriverService.createDriver(userId, driverData);

      logDatabase('insert_success', 'drivers', { driverId: result.id, userId });

      const response: ApiResponse = {
        success: true,
        message: 'Driver profile created successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'create_driver', 
        userId,
        driverData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create driver profile',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async updateDriver(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const driverData: Partial<CreateDriverRequest> = req.body;
      
      logDatabase('update', 'drivers', { userId, updateFields: Object.keys(driverData) });
      
      const result = await DriverService.updateDriver(userId, driverData);

      logDatabase('update_success', 'drivers', { driverId: result.id, userId });

      const response: ApiResponse = {
        success: true,
        message: 'Driver profile updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'update_driver', 
        userId,
        driverData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update driver profile',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getDriverProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      logDatabase('select', 'drivers', { userId, operation: 'get_profile' });
      
      const result = await DriverService.getDriverProfile(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Driver profile retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_driver_profile', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get driver profile',
        error: error.message
      };

      res.status(404).json(response);
    }
  }

  static async searchDrivers(req: Request, res: Response) {
    try {
      const searchParams: SearchDriversRequest = req.query as any;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'drivers', { searchParams, requestedBy: userId, operation: 'search' });
      
      const result = await DriverService.searchDrivers(searchParams);

      const response: ApiResponse = {
        success: true,
        message: 'Drivers found successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'search_drivers', 
        userId,
        searchParams: req.query
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to search drivers',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async updateAvailability(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { isAvailable } = req.body;
      
      logDatabase('update', 'drivers', { userId, isAvailable, operation: 'update_availability' });
      
      const result = await DriverService.updateAvailability(userId, isAvailable);

      logDatabase('update_success', 'drivers', { driverId: result.id, userId, isAvailable });

      const response: ApiResponse = {
        success: true,
        message: 'Availability updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'update_availability', 
        userId,
        isAvailable: req.body.isAvailable
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update availability',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async updateLocation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { location, latitude, longitude } = req.body;
      
      logDatabase('update', 'drivers', { userId, location, latitude, longitude, operation: 'update_location' });
      
      const result = await DriverService.updateLocation(userId, location, latitude, longitude);

      logDatabase('update_success', 'drivers', { driverId: result.id, userId, location });

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
        location: req.body.location,
        latitude: req.body.latitude,
        longitude: req.body.longitude
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update location',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async verifyDriver(req: Request, res: Response) {
    try {
      const { driverId } = req.params;
      const { isVerified } = req.body;
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('update', 'drivers', { driverId, isVerified, requestedBy: adminUserId, operation: 'verify_driver' });
      
      const result = await DriverService.verifyDriver(driverId, isVerified);

      logDatabase('update_success', 'drivers', { driverId, isVerified, requestedBy: adminUserId });

      const response: ApiResponse = {
        success: true,
        message: `Driver ${isVerified ? 'verified' : 'unverified'} successfully`,
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const adminUserId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'verify_driver', 
        driverId: req.params.driverId,
        isVerified: req.body.isVerified,
        adminUserId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to verify driver',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getAllDrivers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'drivers', { page, limit, search, status, requestedBy: userId, operation: 'get_all_drivers' });
      
      const result = await DriverService.getAllDrivers(page, limit, search, status);

      const response: ApiResponse = {
        success: true,
        message: 'Drivers retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_all_drivers', 
        userId,
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        status: req.query.status
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get drivers',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async contactDriver(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { driverId } = req.params;
      const { message, bookingId } = req.body;
      
      logDatabase('contact', 'drivers', { userId, driverId, bookingId, hasMessage: !!message });
      
      const result = await DriverService.contactDriver(userId, driverId, message, bookingId);

      const response: ApiResponse = {
        success: true,
        message: 'Contact request sent successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'contact_driver', 
        userId,
        driverId: req.params.driverId,
        bookingId: req.body.bookingId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to contact driver',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 