import { Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { AppError, AuthenticatedRequest } from '../types';
import { logError } from '../utils/logger';

type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  // Get all payments
  getAllPayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const statusParam = req.query['status'] as string;
      const status = statusParam ? (statusParam as PaymentStatus) : undefined;
      const search = req.query['search'] as string;
      const method = req.query['method'] as string;
      const dateFrom = req.query['dateFrom'] as string;
      const dateTo = req.query['dateTo'] as string;

      const result = await this.paymentService.getAllPayments({ 
        page, 
        limit, 
        ...(status && { status }),
        ...(search && { search }),
        ...(method && { method }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      res.json({
        success: true,
        message: 'Payments retrieved successfully',
        data: result
      });
    } catch (error) {
      logError(error as Error, req);
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payments'
      });
    }
  };

  // Get payment statistics
  getPaymentStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.paymentService.getPaymentStats();

      res.json({
        success: true,
        message: 'Payment statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      logError(error as Error, req);
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment statistics'
      });
    }
  };

  // Get user payment history
  getUserPaymentHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const statusParam = req.query['status'] as string;
      const status = statusParam ? (statusParam as PaymentStatus) : undefined;
      const search = req.query['search'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const result = await this.paymentService.getUserPaymentHistory(userId, { 
        page, 
        limit, 
        ...(status && { status }),
        ...(search && { search })
      });

      res.json({
        success: true,
        message: 'User payment history retrieved successfully',
        data: result
      });
    } catch (error) {
      logError(error as Error, req);
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user payment history'
      });
    }
  };

  // Get payment by ID
  getPaymentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Payment ID is required'
        });
        return;
      }

      const payment = await this.paymentService.getPaymentById(id);

      res.json({
        success: true,
        message: 'Payment retrieved successfully',
        data: { payment }
      });
    } catch (error) {
      logError(error as Error, req);
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment'
      });
    }
  };

  // Update payment status
  updatePaymentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Payment ID is required'
        });
        return;
      }

      if (!status || !PAYMENT_STATUSES.includes(status as PaymentStatus)) {
        res.status(400).json({
          success: false,
          message: 'Valid payment status is required'
        });
        return;
      }

      const payment = await this.paymentService.updatePaymentStatus(id, status as PaymentStatus);

      res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: { payment }
      });
    } catch (error) {
      logError(error as Error, req);
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update payment status'
      });
    }
  };

  // Create new payment
  createPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const paymentData = req.body;
      const payment = await this.paymentService.createPayment(paymentData);

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: { payment }
      });
    } catch (error) {
      logError(error as Error, req);
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create payment'
      });
    }
  };

  // Delete payment
  deletePayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Payment ID is required'
        });
        return;
      }

      const result = await this.paymentService.deletePayment(id);

      res.json({
        success: true,
        message: 'Payment deleted successfully',
        data: result
      });
    } catch (error) {
      logError(error as Error, req);
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete payment'
      });
    }
  };
} 