import { Request, Response } from 'express';
import { PaymentService, PaymentRequest, PaymentStatus, PaymentMethod } from '../services/paymentService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class PaymentController {
  static async createPaymentSession(req: Request, res: Response) {
    try {
      const paymentRequest: PaymentRequest = req.body;
      const userId = (req as any).user?.userId;
      
      // Validate required fields
      if (!paymentRequest.bookingId || !paymentRequest.amount || !paymentRequest.customerEmail) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: bookingId, amount, customerEmail',
          error: 'Validation error'
        });
      }

      // Validate amount
      if (paymentRequest.amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0',
          error: 'Invalid amount'
        });
      }

      // Validate currency
      if (!paymentRequest.currency || paymentRequest.currency !== 'BDT') {
        return res.status(400).json({
          success: false,
          message: 'Only BDT currency is supported',
          error: 'Invalid currency'
        });
      }

      logDatabase('create', 'payment_session', { 
        userId, 
        bookingId: paymentRequest.bookingId,
        amount: paymentRequest.amount
      });

      // Create payment session with SSLCommerz
      const paymentSession = await PaymentService.createPaymentSession(paymentRequest);

      if (paymentSession.status === 'VALID') {
        const response: ApiResponse = {
          success: true,
          message: 'Payment session created successfully',
          data: {
            redirectUrl: paymentSession.redirectGatewayURL,
            sessionKey: paymentSession.sessionkey,
            transactionId: paymentSession.sessionkey
          }
        };

        res.status(200).json(response);
      } else {
        const response: ApiResponse = {
          success: false,
          message: paymentSession.failedreason || 'Failed to create payment session',
          error: paymentSession.failedreason
        };

        res.status(400).json(response);
      }
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'create_payment_session', 
        userId,
        body: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create payment session',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  static async validatePayment(req: Request, res: Response) {
    try {
      const { tran_id, amount, currency } = req.body;
      const userId = (req as any).user?.userId || 'anonymous';
      
      if (!tran_id || !amount || !currency) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: tran_id, amount, currency',
          error: 'Validation error'
        });
      }

      // Validate amount
      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount',
          error: 'Amount must be a positive number'
        });
      }

      logDatabase('validate', 'payment', { 
        userId, 
        tran_id, 
        amount, 
        currency 
      });

      const validationResult = await PaymentService.validatePayment(tran_id, parseFloat(amount), currency);

      const response: ApiResponse = {
        success: true,
        message: 'Payment validation completed',
        data: validationResult
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'validate_payment', 
        userId,
        body: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to validate payment',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  static async processIPN(req: Request, res: Response) {
    try {
      const ipnData = req.body;
      
      logDatabase('process', 'ipn', { 
        ipnData,
        headers: req.headers
      });

      await PaymentService.processIPN(ipnData);

      // Return success response to SSLCommerz
      res.status(200).send('OK');
    } catch (error: any) {
      logError(error, { 
        operation: 'process_ipn', 
        body: req.body,
        headers: req.headers
      });

      // Still return OK to SSLCommerz to prevent retries
      res.status(200).send('OK');
    }
  }

  static async getPaymentStatus(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: 'Booking ID is required',
          error: 'Missing booking ID'
        });
      }

      logDatabase('get', 'payment_status', { 
        userId, 
        bookingId 
      });

      const paymentStatus = await PaymentService.getPaymentStatus(bookingId);

      if (!paymentStatus) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
          error: 'Payment not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Payment status retrieved successfully',
        data: paymentStatus
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'get_payment_status', 
        userId,
        params: req.params
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get payment status',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  static async refundPayment(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user?.userId;
      
      if (!bookingId || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Booking ID and reason are required',
          error: 'Missing required fields'
        });
      }

      // Validate reason length
      if (reason.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Refund reason must be at least 10 characters long',
          error: 'Invalid reason'
        });
      }

      logDatabase('refund', 'payment', { 
        userId, 
        bookingId, 
        reason 
      });

      await PaymentService.refundPayment(bookingId, reason);

      const response: ApiResponse = {
        success: true,
        message: 'Payment refunded successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';
      
      logError(error, { 
        operation: 'refund_payment', 
        userId,
        params: req.params,
        body: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to refund payment',
        error: error.message
      };

      res.status(500).json(response);
    }
  }

  static async paymentSuccess(req: Request, res: Response) {
    try {
      const { tran_id, status, val_id, amount, currency } = req.query;
      
      logDatabase('payment_success', 'callback', { 
        tran_id, 
        status, 
        val_id, 
        amount, 
        currency 
      });

      if (status === 'VALID') {
        // Validate the payment
        await PaymentService.validatePayment(tran_id as string, parseFloat(amount as string), currency as string);
      }

      // Redirect to success page
      res.redirect(`/dashboard/user/bookings?payment=success&tran_id=${tran_id}`);
    } catch (error: any) {
      logError(error, { 
        operation: 'payment_success', 
        query: req.query
      });

      // Redirect to error page
      res.redirect('/dashboard/user/bookings?payment=error');
    }
  }

  static async paymentFail(req: Request, res: Response) {
    try {
      const { tran_id, status, error } = req.query;
      
      logDatabase('payment_fail', 'callback', { 
        tran_id, 
        status, 
        error 
      });

      // Redirect to failure page
      res.redirect(`/dashboard/user/bookings?payment=failed&tran_id=${tran_id}&error=${error}`);
    } catch (error: any) {
      logError(error, { 
        operation: 'payment_fail', 
        query: req.query
      });

      // Redirect to error page
      res.redirect('/dashboard/user/bookings?payment=error');
    }
  }

  static async paymentCancel(req: Request, res: Response) {
    try {
      const { tran_id } = req.query;
      
      logDatabase('payment_cancel', 'callback', { 
        tran_id 
      });

      // Redirect to cancellation page
      res.redirect(`/dashboard/user/bookings?payment=cancelled&tran_id=${tran_id}`);
    } catch (error: any) {
      logError(error, { 
        operation: 'payment_cancel', 
        query: req.query
      });

      // Redirect to error page
      res.redirect('/dashboard/user/bookings?payment=error');
    }
  }
} 