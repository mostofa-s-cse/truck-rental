import { PrismaClient, BookingStatus } from '@prisma/client';
import { AppError } from '../types';
import { getSSLCUrl } from '../utils/sslcommerz';

// Try to import SSLCommerz, but don't fail if it's not available
let SSLCommerzPayment: any = null;
try {
  SSLCommerzPayment = require('sslcommerz-lts').default || require('sslcommerz-lts');
} catch (error) {
  console.warn('SSLCommerz package not available, payment service will be disabled');
}

export interface SSLCommerzPaymentData {
  bookingId: string;
  userId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerPostCode: string;
  customerCountry: string;
}

export interface IPaymentPayload {
  amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_name: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
}

export interface IIPNPayload {
  status: string;
  tran_id: string;
  val_id: string;
  amount: number;
  card_type: string;
  store_amount: number;
  bank_tran_id: string;
}

export class SSLCommerzService {
  private prisma: PrismaClient;
  private sslCommerz: any = null;
  private storeId: string;
  private storePassword: string;
  private sandboxMode: boolean;

  constructor() {
    this.prisma = new PrismaClient();
    this.storeId = process.env['SSLCOMMERZ_STORE_ID'] || '';
    this.storePassword = process.env['SSLCOMMERZ_STORE_PASSWORD'] || '';
    this.sandboxMode = process.env['SSLCOMMERZ_SANDBOX_MODE'] === 'true';
    
    // Initialize SSLCommerz synchronously to avoid blocking
    try {
      this.initializeSSLCommerzSync();
    } catch (error) {
      console.error('SSLCommerz initialization failed, service will be disabled:', error);
      this.sslCommerz = null;
    }
  }

  private initializeSSLCommerzSync(): void {
    try {
      console.log('Initializing SSLCommerz Service...');
      console.log('SSLCommerz Config:', {
        storeId: this.storeId,
        storePassword: this.storePassword ? 'SET' : 'NOT_SET',
        sandboxMode: this.sandboxMode
      });

      // Only initialize if we have the required credentials
      if (!this.storeId || !this.storePassword) {
        console.warn('SSLCommerz credentials not found, service will be disabled');
        this.sslCommerz = null;
        return;
      }

      // Check if SSLCommerzPayment is available
      if (!SSLCommerzPayment || typeof SSLCommerzPayment !== 'function') {
        console.error('SSLCommerzPayment is not available');
        this.sslCommerz = null;
        return;
      }

      this.sslCommerz = new SSLCommerzPayment(
        this.storeId,
        this.storePassword,
        !this.sandboxMode // isLive parameter (true for live, false for sandbox)
      );
      
      console.log('SSLCommerz Service Initialized Successfully');
    } catch (error) {
      console.error('Failed to initialize SSLCommerz service:', error);
      this.sslCommerz = null;
    }
  }

  // Create payment session using the official package
  async createPaymentSession(paymentData: SSLCommerzPaymentData): Promise<{ sessionId: string; gatewayUrl: string }> {
    try {
      // Validate required fields
      if (!this.storeId || !this.storePassword) {
        throw new AppError('SSLCommerz configuration is missing', 500);
      }

      if (!this.sslCommerz) {
        throw new AppError('SSLCommerz service is not initialized', 500);
      }

      // Get booking details
      const booking = await this.prisma.booking.findUnique({
        where: { id: paymentData.bookingId },
        include: {
          user: true,
          driver: true
        }
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      // Generate unique transaction ID
      const tranId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('=== SSLCOMMERZ SERVICE DEBUG ===');
      console.log('Payment data received:', paymentData);
      console.log('Amount to be sent:', paymentData.amount);
      
      // Get callback URLs using shared utility
      const successUrl = getSSLCUrl('success');
      const failUrl = getSSLCUrl('fail');
      const cancelUrl = getSSLCUrl('cancel');
      const ipnUrl = getSSLCUrl('ipn');
      
      console.log('Callback URLs:', {
        success_url: successUrl,
        fail_url: failUrl,
        cancel_url: cancelUrl,
        ipn_url: ipnUrl
      });
      
      // Prepare payment data for SSLCommerz
      const postData = {
        total_amount: paymentData.amount,
        currency: 'BDT',
        tran_id: tranId,
        product_category: 'transport',
        product_name: `Truck Booking - ${booking.source} to ${booking.destination}`,
        product_profile: 'transport',
        shipping_method: 'Truck', // Physical shipping for truck bookings
        cus_name: paymentData.customerName,
        cus_email: paymentData.customerEmail,
        cus_add1: paymentData.customerAddress,
        cus_city: paymentData.customerCity,
        cus_postcode: paymentData.customerPostCode,
        cus_country: paymentData.customerCountry,
        cus_phone: paymentData.customerPhone,
        ship_name: paymentData.customerName,
        ship_add1: paymentData.customerAddress,
        ship_city: paymentData.customerCity,
        ship_postcode: paymentData.customerPostCode,
        ship_country: paymentData.customerCountry,
        success_url: successUrl,
        fail_url: failUrl,
        cancel_url: cancelUrl,
        ipn_url: ipnUrl,
        multi_card_name: '',
        num_of_item: '1',
        product_amount: paymentData.amount,
        vat: '0',
        discount_amount: '0',
        convenience_fee: '0',
        value_a: paymentData.bookingId, // Store booking ID
        value_b: paymentData.userId,    // Store user ID
        value_c: booking.source,
        value_d: booking.destination,
        // Additional required fields
        cus_add2: '',
        cus_state: '',
        cus_fax: '',
        ship_add2: '',
        ship_state: '',
        ship_phone: paymentData.customerPhone
      };

      console.log('SSLCommerz Request Data:', {
        storeId: this.storeId,
        storePassword: this.storePassword ? '***' : 'NOT_SET',
        sandboxMode: this.sandboxMode,
        postData: { ...postData, store_passwd: '***' }
      });

      // Use the official package to initiate payment
      const result = await this.sslCommerz.init(postData as any);

      console.log('SSLCommerz Response:', result);

      if (result.status === 'SUCCESS' || result.status === 'VALID') {
        // Update payment record with transaction ID
        await this.prisma.payment.updateMany({
          where: { bookingId: paymentData.bookingId },
          data: { 
            transactionId: tranId,
            paymentMethod: 'SSLCOMMERZ'
          }
        });

        // Check for different possible response formats
        const gatewayUrl = result.gatewayPageURL || result.GatewayPageURL || result.redirectGatewayURL || result.redirect_url;
        const sessionId = result.sessionkey || result.sessionKey || result.SessionKey || tranId;

        if (!gatewayUrl) {
          console.error('SSLCommerz Response missing gateway URL:', result);
          throw new AppError('Payment gateway URL not received from SSLCommerz', 500);
        }

        return {
          sessionId: sessionId,
          gatewayUrl: gatewayUrl
        };
      } else {
        console.error('SSLCommerz Error Response:', result);
        throw new AppError(result.failedreason || result.error || 'Failed to create payment session', 400);
      }
    } catch (error) {
      console.error('SSLCommerz Error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create payment session', 500);
    }
  }

  // Verify payment using the official package
  async verifyPayment(tranId: string): Promise<any> {
    try {
      if (!this.sslCommerz) {
        throw new AppError('SSLCommerz service is not initialized', 500);
      }

      // For verification, we need to use the transaction query method
      const result = await this.sslCommerz.transactionQueryByTransactionId({ tran_id: tranId });
      return result;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw new AppError('Failed to verify payment', 500);
    }
  }

  // Process IPN (Instant Payment Notification)
  async processIPN(data: any): Promise<void> {
    try {
      const { tran_id, status, amount, value_a } = data;
      
      if (!tran_id || !value_a) {
        throw new AppError('Invalid IPN data', 400);
      }

      const bookingId = value_a;

      // Find payment record
      const payment = await this.prisma.payment.findFirst({
        where: { 
          bookingId,
          transactionId: tran_id
        },
        include: { booking: true }
      });

      if (!payment) {
        throw new AppError('Payment record not found', 404);
      }

      // Verify payment amount
      if (parseFloat(amount || '0') !== parseFloat(payment.amount.toString())) {
        throw new AppError('Payment amount mismatch', 400);
      }

      // Update payment status based on SSLCommerz response
      let paymentStatus: string = 'PENDING';
      let bookingStatus: BookingStatus = BookingStatus.PENDING;

      if (status === 'VALID') {
        paymentStatus = 'COMPLETED';
        bookingStatus = BookingStatus.CONFIRMED;
      } else if (status === 'FAILED') {
        paymentStatus = 'FAILED';
        bookingStatus = BookingStatus.CANCELLED;
      }

      // Update payment and booking status
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: paymentStatus
          }
        });

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: bookingStatus }
        });
      });

    } catch (error) {
      console.error('IPN processing error:', error);
      throw new AppError('Failed to process IPN', 500);
    }
  }

  // Get payment status using the official package
  async getPaymentStatus(tranId: string): Promise<any> {
    try {
      if (!this.sslCommerz) {
        throw new AppError('SSLCommerz service is not initialized', 500);
      }

      const result = await this.sslCommerz.transactionQueryByTransactionId({ tran_id: tranId });
      return result;
    } catch (error) {
      console.error('Get payment status error:', error);
      throw new AppError('Failed to get payment status', 500);
    }
  }

  // Refund payment (if supported)
  async refundPayment(tranId: string, amount: number, refundRemark: string = 'Customer requested refund'): Promise<any> {
    try {
      if (!this.sslCommerz) {
        throw new AppError('SSLCommerz service is not initialized', 500);
      }

      // For refund, we need bank_tran_id and refe_id from the original transaction
      // This would typically come from the payment record
      const payment = await this.prisma.payment.findFirst({
        where: { transactionId: tranId }
      });

      if (!payment) {
        throw new AppError('Payment not found for refund', 404);
      }

      // Note: This is a simplified implementation
      // In a real scenario, you would need the bank_tran_id and refe_id from the original transaction
      const result = await this.sslCommerz.initiateRefund({
        refund_amount: amount,
        refund_remarks: refundRemark,
        bank_tran_id: tranId, // This should be the actual bank transaction ID
        refe_id: tranId // This should be the actual reference ID
      });
      
      return result;
    } catch (error) {
      console.error('Refund error:', error);
      throw new AppError('Failed to process refund', 500);
    }
  }

  // Additional methods based on your examples
  async initiateSSLCommerzPayment(paymentData: IPaymentPayload): Promise<any> {
    try {
      if (!this.sslCommerz) {
        throw new AppError('SSLCommerz service is not initialized', 500);
      }

      const tranId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const postData = {
        total_amount: paymentData.amount,
        currency: paymentData.currency,
        tran_id: tranId,
        product_category: 'transport',
        product_name: paymentData.product_name,
        product_profile: 'transport',
        shipping_method: 'Truck',
        cus_name: paymentData.customer_name,
        cus_email: paymentData.customer_email,
        cus_phone: paymentData.customer_phone,
        success_url: paymentData.success_url,
        fail_url: paymentData.fail_url,
        cancel_url: paymentData.cancel_url,
        ipn_url: process.env['SSLCOMMERZ_IPN_URL'] || '',
        multi_card_name: '',
        num_of_item: '1',
        product_amount: paymentData.amount,
        vat: '0',
        discount_amount: '0',
        convenience_fee: '0'
      };

      const result = await this.sslCommerz.init(postData as any);
      return result;
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw new AppError('Failed to initiate payment', 500);
    }
  }

  async handleIPN(ipnData: IIPNPayload): Promise<void> {
    try {
      const { tran_id, status, amount } = ipnData;
      
      if (!tran_id) {
        throw new AppError('Invalid IPN data', 400);
      }

      const payment = await this.prisma.payment.findFirst({
        where: { transactionId: tran_id },
        include: { booking: true }
      });

      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      if (parseFloat(amount.toString()) !== parseFloat(payment.amount.toString())) {
        throw new AppError('Amount mismatch', 400);
      }

      const paymentStatus = status === 'VALID' ? 'COMPLETED' : 
                           status === 'FAILED' ? 'FAILED' : 
                           'PENDING';
      
      const bookingStatus = status === 'VALID' ? BookingStatus.CONFIRMED : 
                           status === 'FAILED' ? BookingStatus.CANCELLED : 
                           BookingStatus.PENDING;

      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: paymentStatus
          }
        }),
        this.prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: bookingStatus }
        })
      ]);
    } catch (error) {
      console.error('IPN handling error:', error);
      throw new AppError('Failed to handle IPN', 500);
    }
  }

  async handleSuccess(transactionData: any): Promise<any> {
    try {
      const { tran_id } = transactionData;
      
      if (!tran_id) {
        throw new AppError('Transaction ID is required', 400);
      }

      const result = await this.verifyPayment(tran_id);
      return {
        status: 'success',
        message: 'Payment processed successfully',
        data: result
      };
    } catch (error) {
      console.error('Success handling error:', error);
      throw new AppError('Failed to handle success callback', 500);
    }
  }
} 