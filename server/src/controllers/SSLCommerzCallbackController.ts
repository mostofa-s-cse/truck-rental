import { Request, Response } from 'express';
import { SSLCommerzService } from '../services/SSLCommerzService';
import { logError } from '../utils/logger';

export class SSLCommerzCallbackController {
  private sslCommerzService: SSLCommerzService;

  constructor() {
    this.sslCommerzService = new SSLCommerzService();
  }

  // Handle SSLCommerz success callback
  handleSSLCommerzSuccess = async (req: Request, res: Response) => {
    try {
      console.log('=== SSLCOMMERZ SUCCESS CALLBACK ===');
      console.log('Request body:', req.body);
      console.log('Request query:', req.query);
      console.log('Request headers:', req.headers);

      const { tran_id, status, val_id, amount, store_amount, currency, bank_tran_id, card_type, card_issuer, card_brand, value_a, value_b, value_c, value_d } = req.body;

      // Log all parameters
      console.log('Payment Success Parameters:', {
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
        console.error('No transaction ID found in success callback');
        return this.redirectToFrontend(req, res, '/payment/fail?error=no_transaction_id');
      }

      // Check if the payment status from SSLCommerz callback is valid
      console.log('Checking payment status from callback:', status);
      console.log('Full status value:', JSON.stringify(status));
      console.log('Amount received from SSLCommerz:', amount);
      console.log('Amount type:', typeof amount);
      
      if (status === 'VALID' || status === 'SUCCESS') {
        console.log('Payment status is valid, updating to completed');
        // Update payment and booking status
        await this.updatePaymentStatus(tran_id, 'COMPLETED', value_a);
        // URL encode the parameters to handle special characters
        const encodedTranId = encodeURIComponent(tran_id);
        const encodedAmount = encodeURIComponent(amount || '0');
        const encodedValId = encodeURIComponent(val_id || '');
        
        return this.redirectToFrontend(req, res, `/payment/success?tran_id=${encodedTranId}&status=VALID&amount=${encodedAmount}&val_id=${encodedValId}`);
      } else {
        console.warn('Payment status from callback is not valid:', status);
        console.warn('Available status values:', ['VALID', 'SUCCESS', 'FAILED', 'CANCELLED']);
        await this.updatePaymentStatus(tran_id, 'FAILED', value_a);
        return this.redirectToFrontend(req, res, `/payment/fail?tran_id=${tran_id}&error=invalid_status&status=${status}`);
      }

    } catch (error) {
      logError(error as Error, req);
      console.error('SSLCommerz success handler error:', error);
      return this.redirectToFrontend(req, res, '/payment/fail?error=server_error');
    }
  };

  // Handle SSLCommerz failure callback
  handleSSLCommerzFailure = async (req: Request, res: Response) => {
    try {
      console.log('=== SSLCOMMERZ FAILURE CALLBACK ===');
      console.log('Request body:', req.body);
      console.log('Request query:', req.query);

      const { tran_id, status, error, errorReason, failedreason, value_a } = req.body;

      console.log('Payment Failure Parameters:', {
        tran_id,
        status,
        error,
        errorReason,
        failedreason,
        value_a // booking_id
      });

      if (tran_id) {
        await this.updatePaymentStatus(tran_id, 'FAILED', value_a);
      }

      const errorMsg = error || errorReason || failedreason || 'Payment failed';
      return this.redirectToFrontend(req, res, `/payment/fail?tran_id=${tran_id || 'unknown'}&error=${encodeURIComponent(errorMsg)}`);

    } catch (error) {
      logError(error as Error, req);
      console.error('SSLCommerz failure handler error:', error);
      return this.redirectToFrontend(req, res, '/payment/fail?error=server_error');
    }
  };

  // Handle SSLCommerz cancel callback
  handleSSLCommerzCancel = async (req: Request, res: Response) => {
    try {
      console.log('=== SSLCOMMERZ CANCEL CALLBACK ===');
      console.log('Request body:', req.body);
      console.log('Request query:', req.query);

      const { tran_id, status, value_a } = req.body;

      console.log('Payment Cancel Parameters:', {
        tran_id,
        status,
        value_a // booking_id
      });

      if (tran_id) {
        await this.updatePaymentStatus(tran_id, 'CANCELLED', value_a);
      }

      return this.redirectToFrontend(req, res, `/payment/cancel?tran_id=${tran_id || 'unknown'}`);

    } catch (error) {
      logError(error as Error, req);
      console.error('SSLCommerz cancel handler error:', error);
      return this.redirectToFrontend(req, res, '/payment/cancel?error=server_error');
    }
  };

  // Helper method to properly construct redirect URLs
  private redirectToFrontend(_req: Request, res: Response, path: string) {
    try {
      // Get the frontend base URL from environment variables
      const frontendBaseUrl = process.env['CLIENT_URL'] || 'http://localhost:3000';
      
      // Construct the full frontend URL
      const redirectUrl = `${frontendBaseUrl}${path}`;
      
      console.log('Redirecting to frontend:', redirectUrl);
      console.log('Frontend base URL:', frontendBaseUrl);
      console.log('Path with query params:', path);
      
      return res.redirect(redirectUrl);
    } catch (urlError) {
      console.error('Error constructing redirect URL:', urlError);
      // Fallback to simple redirect
      const fallbackUrl = `http://localhost:3000${path}`;
      console.log('Using fallback URL:', fallbackUrl);
      return res.redirect(fallbackUrl);
    }
  }

  // Helper method to update payment status
  private async updatePaymentStatus(tranId: string, status: string, bookingId?: string) {
    try {
      if (!tranId) return;

      console.log(`Looking for payment with transaction ID: ${tranId}`);
      
      // First try to find by transaction ID
      let payment = await this.sslCommerzService['prisma'].payment.findFirst({
        where: { transactionId: tranId },
        include: { booking: true }
      });

      // If not found by transaction ID, try to find by booking ID
      if (!payment && bookingId) {
        console.log(`Payment not found by transaction ID, trying booking ID: ${bookingId}`);
        payment = await this.sslCommerzService['prisma'].payment.findFirst({
          where: { bookingId: bookingId },
          include: { booking: true }
        });
      }

      // If still not found, try to find any payment with similar transaction ID
      if (!payment) {
        console.log(`Payment not found by booking ID, searching for similar transaction ID`);
        const allPayments = await this.sslCommerzService['prisma'].payment.findMany({
          where: { 
            transactionId: { contains: tranId.substring(0, 10) }
          },
          include: { booking: true }
        });
        console.log(`Found ${allPayments.length} payments with similar transaction ID:`, allPayments.map(p => ({ id: p.id, transactionId: p.transactionId, bookingId: p.bookingId })));
        
        if (allPayments.length > 0) {
          payment = allPayments[0] || null; // Use the first one
        }
      }

      if (payment) {
        console.log(`Found payment record:`, {
          id: payment.id,
          transactionId: payment.transactionId,
          bookingId: payment.bookingId,
          currentStatus: payment.status
        });
        
        await this.sslCommerzService['prisma'].$transaction(async (tx) => {
          // Update the payment status
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: status === 'COMPLETED' ? 'COMPLETED' : 'FAILED'
            }
          });

          // Update the primary booking (the one linked to the payment)
          await tx.booking.update({
            where: { id: payment.bookingId },
            data: { 
              status: status === 'COMPLETED' ? 'CONFIRMED' : 'CANCELLED'
            }
          });

          // Find and update ALL related bookings that were created together
          // These bookings will have the same userId, driverId, and similar creation time
          const primaryBooking = await tx.booking.findUnique({
            where: { id: payment.bookingId },
            select: { userId: true, driverId: true, createdAt: true }
          });

          if (primaryBooking) {
            console.log(`Looking for related bookings for user ${primaryBooking.userId}, driver ${primaryBooking.driverId}`);
            
            // Find all bookings created within 5 minutes of the primary booking
            // with the same user and driver
            const relatedBookings = await tx.booking.findMany({
              where: {
                userId: primaryBooking.userId,
                driverId: primaryBooking.driverId,
                createdAt: {
                  gte: new Date(primaryBooking.createdAt.getTime() - 5 * 60 * 1000), // 5 minutes before
                  lte: new Date(primaryBooking.createdAt.getTime() + 5 * 60 * 1000)  // 5 minutes after
                },
                status: 'PENDING' // Only update pending bookings
              }
            });

            console.log(`Found ${relatedBookings.length} related bookings to update`);

            // Update all related bookings
            if (relatedBookings.length > 0) {
              await tx.booking.updateMany({
                where: {
                  id: { in: relatedBookings.map(b => b.id) }
                },
                data: { 
                  status: status === 'COMPLETED' ? 'CONFIRMED' : 'CANCELLED'
                }
              });

              console.log(`Updated ${relatedBookings.length} related bookings to status: ${status === 'COMPLETED' ? 'CONFIRMED' : 'CANCELLED'}`);
            }
          }
        });

        console.log(`Payment ${tranId} status updated to: ${status}`);
      } else {
        console.warn(`Payment record not found for transaction: ${tranId}`);
        console.warn(`Booking ID provided: ${bookingId}`);
        
        // List all recent payments for debugging
        const recentPayments = await this.sslCommerzService['prisma'].payment.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { booking: true }
        });
        console.warn(`Recent payments:`, recentPayments.map(p => ({ id: p.id, transactionId: p.transactionId, bookingId: p.bookingId, status: p.status })));
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }
} 