import { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class ReviewController {
  static async createReview(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const reviewData = {
        ...req.body,
        userId
      };
      
      logDatabase('insert', 'reviews', { userId, driverId: reviewData.driverId, rating: reviewData.rating });
      
      const result = await ReviewService.createReview(reviewData);

      logDatabase('insert_success', 'reviews', { reviewId: result.id, userId, driverId: reviewData.driverId });

      const response: ApiResponse = {
        success: true,
        message: 'Review created successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'create_review', 
        userId,
        reviewData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create review',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getDriverReviews(req: Request, res: Response) {
    try {
      const { driverId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'reviews', { driverId, page, limit, requestedBy: userId });
      
      const result = await ReviewService.getDriverReviews(driverId, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Driver reviews retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_driver_reviews', 
        driverId: req.params.driverId,
        userId,
        page: req.query.page,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get driver reviews',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getUserReviews(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      logDatabase('select', 'reviews', { userId, page, limit, operation: 'user_reviews' });
      
      const result = await ReviewService.getUserReviews(userId, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'User reviews retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_user_reviews', 
        userId,
        page: req.query.page,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get user reviews',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getAllReviews(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'reviews', { page, limit, rating, requestedBy: userId, operation: 'all_reviews' });
      
      const result = await ReviewService.getAllReviews(page, limit, rating);

      const response: ApiResponse = {
        success: true,
        message: 'All reviews retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_all_reviews', 
        userId,
        page: req.query.page,
        limit: req.query.limit,
        rating: req.query.rating
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get all reviews',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getReviewById(req: Request, res: Response) {
    try {
      const { reviewId } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'reviews', { reviewId, requestedBy: userId });
      
      const result = await ReviewService.getReviewById(reviewId);

      const response: ApiResponse = {
        success: true,
        message: 'Review retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_review_by_id', 
        reviewId: req.params.reviewId,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get review',
        error: error.message
      };

      res.status(404).json(response);
    }
  }

  static async updateReview(req: Request, res: Response) {
    try {
      const { reviewId } = req.params;
      const userId = (req as any).user.userId;
      const updateData = req.body;
      
      logDatabase('update', 'reviews', { reviewId, userId, updateFields: Object.keys(updateData) });
      
      const result = await ReviewService.updateReview(reviewId, userId, updateData);

      logDatabase('update_success', 'reviews', { reviewId, userId });

      const response: ApiResponse = {
        success: true,
        message: 'Review updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'update_review', 
        reviewId: req.params.reviewId,
        userId,
        updateData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update review',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async deleteReview(req: Request, res: Response) {
    try {
      const { reviewId } = req.params;
      const userId = (req as any).user.userId;
      
      logDatabase('delete', 'reviews', { reviewId, userId });
      
      const result = await ReviewService.deleteReview(reviewId, userId);

      logDatabase('delete_success', 'reviews', { reviewId, userId });

      const response: ApiResponse = {
        success: true,
        message: 'Review deleted successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'delete_review', 
        reviewId: req.params.reviewId,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete review',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getReviewStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'reviews', { operation: 'stats', requestedBy: userId });
      
      const result = await ReviewService.getReviewStats();

      const response: ApiResponse = {
        success: true,
        message: 'Review statistics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_review_stats', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get review statistics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 