import { Request, Response } from 'express';
import { PaymentService, PaymentData } from '../services/paymentService';
import { ApiResponse } from '../types';
import { logError, logPayment, logDatabase } from '../utils/logger';

export class PaymentController {
  static async createPayment(req: Request, res: Response) {
    try {
      const paymentData: PaymentData = req.body;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logPayment('create_payment_attempt', 'new', { userId, bookingId: paymentData.bookingId, amount: paymentData.amount });
      logDatabase('insert', 'payments', { userId, bookingId: paymentData.bookingId, amount: paymentData.amount });
      
      const result = await PaymentService.createPayment(paymentData);

      logPayment('create_payment_success', result.id, { userId, bookingId: paymentData.bookingId, amount: paymentData.amount });
      logDatabase('insert_success', 'payments', { paymentId: result.id, userId, bookingId: paymentData.bookingId });

      const response: ApiResponse = {
        success: true,
        message: 'Payment created successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'create_payment', 
        userId,
        paymentData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create payment',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { status, transactionId } = req.body;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logPayment('update_status_attempt', paymentId, { userId, status, transactionId });
      logDatabase('update', 'payments', { paymentId, userId, status, transactionId });
      
      const result = await PaymentService.updatePaymentStatus(paymentId, status, transactionId);

      logPayment('update_status_success', paymentId, { userId, status, transactionId });
      logDatabase('update_success', 'payments', { paymentId, userId, status });

      const response: ApiResponse = {
        success: true,
        message: 'Payment status updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'update_payment_status', 
        paymentId: req.params.paymentId,
        userId,
        status: req.body.status,
        transactionId: req.body.transactionId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update payment status',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getPaymentByBookingId(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'payments', { bookingId, requestedBy: userId });
      
      const result = await PaymentService.getPaymentByBookingId(bookingId);

      const response: ApiResponse = {
        success: true,
        message: 'Payment retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_payment_by_booking', 
        bookingId: req.params.bookingId,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get payment',
        error: error.message
      };

      res.status(404).json(response);
    }
  }

  static async getPaymentById(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'payments', { paymentId, requestedBy: userId });
      
      const result = await PaymentService.getPaymentById(paymentId);

      const response: ApiResponse = {
        success: true,
        message: 'Payment retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_payment_by_id', 
        paymentId: req.params.paymentId,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get payment',
        error: error.message
      };

      res.status(404).json(response);
    }
  }

  static async getAllPayments(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'payments', { page, limit, status, requestedBy: userId, operation: 'get_all_payments' });
      
      const result = await PaymentService.getAllPayments(page, limit, status);

      const response: ApiResponse = {
        success: true,
        message: 'All payments retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_all_payments', 
        userId,
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get all payments',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getPaymentStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logDatabase('select', 'payments', { operation: 'stats', requestedBy: userId });
      
      const result = await PaymentService.getPaymentStats();

      const response: ApiResponse = {
        success: true,
        message: 'Payment statistics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_payment_stats', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get payment statistics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async processRefund(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user?.userId || 'anonymous';
      
      if (!reason) {
        throw new Error('Refund reason is required');
      }

      logPayment('refund_attempt', paymentId, { userId, reason });
      logDatabase('update', 'payments', { paymentId, userId, action: 'refund', reason });
      
      const result = await PaymentService.processRefund(paymentId, reason);

      logPayment('refund_success', paymentId, { userId, reason });
      logDatabase('update_success', 'payments', { paymentId, userId, action: 'refunded' });

      const response: ApiResponse = {
        success: true,
        message: 'Refund processed successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'process_refund', 
        paymentId: req.params.paymentId,
        userId,
        reason: req.body.reason
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to process refund',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      logDatabase('select', 'payments', { userId, page, limit, operation: 'payment_history' });
      
      const result = await PaymentService.getPaymentHistory(userId, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Payment history retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_payment_history', 
        userId,
        page: req.query.page,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get payment history',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 