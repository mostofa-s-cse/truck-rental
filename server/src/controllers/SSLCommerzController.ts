import { Response } from 'express';
import { SSLCommerzService, SSLCommerzPaymentData } from '../services/SSLCommerzService';
import { AppError, AuthenticatedRequest } from '../types';
import { logError } from '../utils/logger';

export class SSLCommerzController {
  private sslCommerzService: SSLCommerzService;

  constructor() {
    this.sslCommerzService = new SSLCommerzService();
  }

  // Initiate payment
  initiatePayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { bookingId, customerInfo } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!bookingId || !customerInfo) {
        res.status(400).json({
          success: false,
          message: 'Booking ID and customer information are required'
        });
        return;
      }

      // Validate customer information
      const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'postCode', 'country'];
      for (const field of requiredFields) {
        if (!customerInfo[field]) {
          res.status(400).json({
            success: false,
            message: `Customer ${field} is required`
          });
          return;
        }
      }

      // Get booking amount
      const booking = await this.sslCommerzService['prisma'].booking.findUnique({
        where: { id: bookingId, userId },
        include: { payment: true }
      });

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
        return;
      }

      if (!booking.payment) {
        res.status(400).json({
          success: false,
          message: 'Payment record not found for this booking'
        });
        return;
      }

      console.log('=== SSLCOMMERZ CONTROLLER DEBUG ===');
      console.log('Booking payment amount:', booking.payment.amount);
      console.log('Parsed amount:', parseFloat(booking.payment.amount.toString()));
      
      // Get the actual calculated amount from the booking
      const actualAmount = parseFloat(booking.payment.amount.toString());
      
      const paymentData: SSLCommerzPaymentData = {
        bookingId,
        userId,
        amount: actualAmount,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        customerCity: customerInfo.city,
        customerPostCode: customerInfo.postCode,
        customerCountry: customerInfo.country
      };
      
      console.log('Payment data being sent to SSLCommerz:', paymentData);

      const result = await this.sslCommerzService.createPaymentSession(paymentData);

      res.json({
        success: true,
        message: 'Payment session created successfully',
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
        message: 'Failed to initiate payment'
      });
    }
  };

  // Verify payment
  verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tranId } = req.body;

      if (!tranId) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID is required'
        });
        return;
      }

      const result = await this.sslCommerzService.verifyPayment(tranId);

      res.json({
        success: true,
        message: 'Payment verification completed',
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
        message: 'Failed to verify payment'
      });
    }
  };

  // Process IPN (Instant Payment Notification)
  processIPN = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const ipnData = req.body;

      if (!ipnData.tran_id) {
        res.status(400).json({
          success: false,
          message: 'Invalid IPN data'
        });
        return;
      }

      await this.sslCommerzService.processIPN(ipnData);

      res.json({
        success: true,
        message: 'IPN processed successfully'
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
        message: 'Failed to process IPN'
      });
    }
  };

  // Get payment status
  getPaymentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tranId } = req.params;

      if (!tranId) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID is required'
        });
        return;
      }

      const result = await this.sslCommerzService.getPaymentStatus(tranId);

      res.json({
        success: true,
        message: 'Payment status retrieved successfully',
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
        message: 'Failed to get payment status'
      });
    }
  };

  // Refund payment
  refundPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tranId } = req.params;
      const { amount, refundRemark } = req.body;

      if (!tranId) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID is required'
        });
        return;
      }

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Valid refund amount is required'
        });
        return;
      }

      const result = await this.sslCommerzService.refundPayment(
        tranId, 
        parseFloat(amount), 
        refundRemark || 'Customer requested refund'
      );

      res.json({
        success: true,
        message: 'Refund initiated successfully',
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
        message: 'Failed to process refund'
      });
    }
  };

  // Additional methods based on your examples
  initiatePaymentSimple = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const paymentData = req.body;
      const response = await this.sslCommerzService.initiateSSLCommerzPayment(paymentData);
      res.status(200).json(response);
    } catch (error) {
      logError(error as Error, req);
      res.status(500).json({ 
        success: false,
        message: 'Failed to initiate payment', 
        error: (error as Error).message 
      });
    }
  };

  handleIPN = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const ipnData = req.body;
      await this.sslCommerzService.handleIPN(ipnData);
      res.status(200).send('IPN received successfully');
    } catch (error) {
      logError(error as Error, req);
      res.status(500).send('IPN handling failed');
    }
  };

  // Enhanced payment success handler
  paymentSuccess = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tran_id, status, val_id, amount, store_amount, currency, bank_tran_id, card_type, card_issuer, card_brand, value_a, value_b, value_c, value_d } = req.body;

      console.log('Payment Success Callback:', {
        tran_id,
        status,
        val_id,
        amount,
        store_amount,
        currency,
        bank_tran_id,
        card_type,
        card_issuer,
        card_brand,
        value_a, // booking_id
        value_b, // user_id
        value_c, // from_location
        value_d  // to_location
      });

      if (!tran_id) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID is required'
        });
        return;
      }

      // Verify the payment with SSLCommerz
      const verificationResult = await this.sslCommerzService.verifyPayment(tran_id);
      
      if (verificationResult.status === 'VALID') {
        // Update payment and booking status
        const payment = await this.sslCommerzService['prisma'].payment.findFirst({
          where: { transactionId: tran_id },
          include: { booking: true }
        });

        if (payment) {
          await this.sslCommerzService['prisma'].$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: 'COMPLETED'
              }
            });

            await tx.booking.update({
              where: { id: payment.bookingId },
              data: { status: 'CONFIRMED' }
            });
          });
        }

        res.json({
          success: true,
          message: 'Payment completed successfully',
          data: {
            transactionId: tran_id,
            validationId: val_id,
            amount: amount,
            currency: currency,
            bankTransactionId: bank_tran_id,
            cardType: card_type,
            cardIssuer: card_issuer,
            cardBrand: card_brand,
            bookingId: value_a,
            userId: value_b,
            fromLocation: value_c,
            toLocation: value_d
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment verification failed',
          data: verificationResult
        });
      }
    } catch (error) {
      logError(error as Error, req);
      res.status(500).json({ 
        success: false,
        message: 'Failed to process success callback', 
        error: (error as Error).message 
      });
    }
  };

  // Enhanced payment failure handler
  paymentFailure = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tran_id, status, val_id, amount, store_amount, currency, bank_tran_id, error, errorReason, failedreason, value_a, value_b, value_c, value_d } = req.body;

      console.warn('Payment Failed:', {
        tran_id,
        status,
        val_id,
        amount,
        store_amount,
        currency,
        bank_tran_id,
        error,
        errorReason,
        failedreason,
        value_a, // booking_id
        value_b, // user_id
        value_c, // from_location
        value_d  // to_location
      });

      if (tran_id) {
        // Update payment and booking status to failed
        const payment = await this.sslCommerzService['prisma'].payment.findFirst({
          where: { transactionId: tran_id },
          include: { booking: true }
        });

        if (payment) {
          await this.sslCommerzService['prisma'].$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: 'FAILED'
              }
            });

            await tx.booking.update({
              where: { id: payment.bookingId },
              data: { status: 'CANCELLED' }
            });
          });
        }
      }

      res.json({ 
        success: false,
        status: 'failed', 
        message: 'Payment failed',
        data: {
          transactionId: tran_id,
          error: error || errorReason || failedreason,
          bookingId: value_a,
          userId: value_b,
          fromLocation: value_c,
          toLocation: value_d
        }
      });
    } catch (error) {
      logError(error as Error, req);
      res.status(500).json({ 
        success: false,
        message: 'Failed to process failure callback', 
        error: (error as Error).message 
      });
    }
  };

  // Payment cancel handler
  paymentCancel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tran_id, status, val_id, amount, store_amount, currency, bank_tran_id, value_a, value_b, value_c, value_d } = req.body;

      console.log('Payment Cancelled:', {
        tran_id,
        status,
        val_id,
        amount,
        store_amount,
        currency,
        bank_tran_id,
        value_a, // booking_id
        value_b, // user_id
        value_c, // from_location
        value_d  // to_location
      });

      if (tran_id) {
        // Update payment and booking status to cancelled
        const payment = await this.sslCommerzService['prisma'].payment.findFirst({
          where: { transactionId: tran_id },
          include: { booking: true }
        });

        if (payment) {
          await this.sslCommerzService['prisma'].$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: 'FAILED'
              }
            });

            await tx.booking.update({
              where: { id: payment.bookingId },
              data: { status: 'CANCELLED' }
            });
          });
        }
      }

      res.json({ 
        success: false,
        status: 'cancelled', 
        message: 'Payment was cancelled by user',
        data: {
          transactionId: tran_id,
          bookingId: value_a,
          userId: value_b,
          fromLocation: value_c,
          toLocation: value_d
        }
      });
    } catch (error) {
      logError(error as Error, req);
      res.status(500).json({ 
        success: false,
        message: 'Failed to process cancel callback', 
        error: (error as Error).message 
      });
    }
  };

  // Get payment history for a user
  getPaymentHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const payments = await this.sslCommerzService['prisma'].payment.findMany({
        where: { 
          booking: {
            userId: userId
          },
          paymentMethod: 'SSLCOMMERZ'
        },
        include: {
          booking: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              driver: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                },
                select: {
                  id: true,
                  truckType: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      });

      const total = await this.sslCommerzService['prisma'].payment.count({
        where: { 
          booking: {
            userId: userId
          },
          paymentMethod: 'SSLCOMMERZ'
        }
      });

      res.json({
        success: true,
        message: 'Payment history retrieved successfully',
        data: {
          payments,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string))
          }
        }
      });
    } catch (error) {
      logError(error as Error, req);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment history'
      });
    }
  };

  // Get payment details by transaction ID
  getPaymentDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tranId } = req.params;
      const userId = req.user?.userId;

      if (!tranId) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID is required'
        });
        return;
      }

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const payment = await this.sslCommerzService['prisma'].payment.findFirst({
        where: { 
          transactionId: tranId,
          booking: {
            userId: userId
          }
        },
        include: {
          booking: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              driver: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                },
                select: {
                  id: true,
                  truckType: true
                }
              }
            }
          }
        }
      });

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Payment details retrieved successfully',
        data: payment
      });
    } catch (error) {
      logError(error as Error, req);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment details'
      });
    }
  };
} 