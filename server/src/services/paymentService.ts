import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import axios from 'axios';
import { logDatabase, logError } from '../utils/logger';

const prisma = new PrismaClient();

export interface SSLCommerzConfig {
  storeId: string;
  storePassword: string;
  isSandbox: boolean;
}

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerPostCode: string;
  customerCountry: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
}

// Payment status types based on schema
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_BANKING';

// Booking status types based on schema
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface SSLCommerzRequest {
  store_id: string;
  store_passwd: string;
  total_amount: number;
  currency: string;
  tran_id: string;
  product_category: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  multi_card_name: string;
  allowed_bin: string;
  emi_option: number;
  emi_max_inst_option: number;
  emi_selected_inst: number;
  emi_allow_only: number;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_add2: string;
  cus_city: string;
  cus_postcode: string;
  cus_country: string;
  cus_phone: string;
  cus_fax: string;
  ship_name: string;
  ship_add1: string;
  ship_add2: string;
  ship_city: string;
  ship_postcode: string;
  ship_country: string;
  product_name: string;
  product_profile: string;
  hours_till_departure: string;
  flight_type: string;
  pnr: string;
  journey_from_to: string;
  third_party_booking: string;
  hotel_name: string;
  length_of_stay: string;
  check_in_time: string;
  hotel_city: string;
  product_type: string;
  topup_number: string;
  country_topup: string;
  cart: string;
  product_amount: number;
  vat: number;
  discount_amount: number;
  convenience_fee: number;
  emi_instalment: number;
  emi_amount: number;
  emi_description: string;
  emi_issuer: string;
  min_sector_amount: number;
  current_sector_amount: number;
  allowed_issuer_country: string;
  order_id: string;
}

export interface SSLCommerzResponse {
  status: string;
  failedreason: string;
  sessionkey: string;
  gw: {
    visa: string;
    master: string;
    amex: string;
    othercards: string;
    internetbanking: string;
    mobilebanking: string;
  };
  redirectGatewayURL: string;
  directPaymentURL: {
    visa: string;
    master: string;
    amex: string;
    othercards: string;
    internetbanking: string;
    mobilebanking: string;
  };
}

export interface PaymentValidationResponse {
  status: string;
  tran_id: string;
  val_id: string;
  amount: number;
  store_amount: number;
  currency: string;
  bank_tran_id: string;
  card_type: string;
  card_no: string;
  card_issuer: string;
  card_brand: string;
  card_sub_brand: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
  store_id: string;
  merchant_tran_id: string;
  verify_sign: string;
  verify_key: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_add2: string;
  cus_city: string;
  cus_state: string;
  cus_postcode: string;
  cus_country: string;
  cus_phone: string;
  cus_fax: string;
  ship_name: string;
  ship_add1: string;
  ship_add2: string;
  ship_city: string;
  ship_state: string;
  ship_postcode: string;
  ship_country: string;
  value_a: string;
  value_b: string;
  value_c: string;
  value_d: string;
  risk_title: string;
  risk_level: string;
}

export class PaymentService {
  private static config: SSLCommerzConfig = {
    storeId: process.env.SSLCOMMERZ_STORE_ID || 'testbox',
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || 'qwerty',
    isSandbox: process.env.NODE_ENV !== 'production'
  };

  private static getBaseUrl(): string {
    return this.config.isSandbox 
      ? 'https://sandbox.sslcommerz.com'
      : 'https://securepay.sslcommerz.com';
  }

  static async createPaymentSession(paymentRequest: PaymentRequest): Promise<SSLCommerzResponse> {
    try {
      logDatabase('create', 'payment_session', { bookingId: paymentRequest.bookingId });

      // Check if booking exists
      const booking = await prisma.booking.findUnique({
        where: { id: paymentRequest.bookingId },
        include: { payment: true }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if payment already exists and is pending
      if (booking.payment && booking.payment.status === 'PENDING' as PaymentStatus) {
        throw new Error('Payment session already exists for this booking');
      }

      // Generate unique transaction ID
      const tranId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create SSLCommerz request payload
      const sslRequest: SSLCommerzRequest = {
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        total_amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        tran_id: tranId,
        product_category: 'transport',
        success_url: paymentRequest.successUrl,
        fail_url: paymentRequest.failUrl,
        cancel_url: paymentRequest.cancelUrl,
        ipn_url: paymentRequest.ipnUrl,
        multi_card_name: '',
        allowed_bin: '',
        emi_option: 0,
        emi_max_inst_option: 0,
        emi_selected_inst: 0,
        emi_allow_only: 0,
        cus_name: paymentRequest.customerName,
        cus_email: paymentRequest.customerEmail,
        cus_add1: paymentRequest.customerAddress || '',
        cus_add2: '',
        cus_city: paymentRequest.customerCity || '',
        cus_postcode: paymentRequest.customerPostCode || '',
        cus_country: paymentRequest.customerCountry || 'Bangladesh',
        cus_phone: paymentRequest.customerPhone,
        cus_fax: '',
        ship_name: paymentRequest.customerName,
        ship_add1: paymentRequest.customerAddress || '',
        ship_add2: '',
        ship_city: paymentRequest.customerCity || '',
        ship_postcode: paymentRequest.customerPostCode || '',
        ship_country: paymentRequest.customerCountry || 'Bangladesh',
        product_name: 'Truck Booking Service',
        product_profile: 'transport',
        hours_till_departure: '',
        flight_type: '',
        pnr: '',
        journey_from_to: '',
        third_party_booking: '',
        hotel_name: '',
        length_of_stay: '',
        check_in_time: '',
        hotel_city: '',
        product_type: '',
        topup_number: '',
        country_topup: '',
        cart: '',
        product_amount: 0,
        vat: 0,
        discount_amount: 0,
        convenience_fee: 0,
        emi_instalment: 0,
        emi_amount: 0,
        emi_description: '',
        emi_issuer: '',
        min_sector_amount: 0,
        current_sector_amount: 0,
        allowed_issuer_country: '',
        order_id: paymentRequest.bookingId
      };

      // Make request to SSLCommerz
      const formData = new URLSearchParams();
      Object.entries(sslRequest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });

      console.log('Sending request to SSLCommerz:', {
        url: `${this.getBaseUrl()}/gwprocess/v4/api.php`,
        storeId: this.config.storeId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        tranId
      });

      const response = await axios.post(
        `${this.getBaseUrl()}/gwprocess/v4/api.php`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      console.log('SSLCommerz response:', response.data);

      if (response.data.status === 'VALID') {
        try {
          // Update booking with transaction ID
          await prisma.booking.update({
            where: { id: paymentRequest.bookingId },
            data: {
              status: 'PENDING' as BookingStatus,
              payment: {
                upsert: {
                  create: {
                    amount: paymentRequest.amount,
                    paymentMethod: 'CARD' as PaymentMethod,
                    transactionId: tranId,
                    status: 'PENDING' as PaymentStatus
                  },
                                  update: {
                  amount: paymentRequest.amount,
                  paymentMethod: 'CARD' as PaymentMethod,
                  transactionId: tranId,
                  status: 'PENDING' as PaymentStatus,
                  updatedAt: new Date()
                }
                }
              }
            }
          });

          logDatabase('create_success', 'payment_session', { 
            bookingId: paymentRequest.bookingId, 
            tranId 
          });
        } catch (dbError) {
          console.error('Database update error:', dbError);
          logError(dbError, { 
            operation: 'update_booking_payment', 
            bookingId: paymentRequest.bookingId 
          });
          // Continue with payment session creation even if DB update fails
        }
      } else {
        console.error('SSLCommerz error:', response.data.failedreason);
      }

      return response.data;
    } catch (error) {
      console.error('Payment session creation error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.status === 401) {
          throw new Error('Invalid SSLCommerz credentials');
        } else if (error.response?.status === 400) {
          throw new Error(`SSLCommerz validation error: ${error.response.data?.failedreason || error.message}`);
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('SSLCommerz request timeout');
        } else {
          throw new Error(`SSLCommerz error: ${error.message}`);
        }
      }
      
      logError(error, { 
        operation: 'create_payment_session', 
        bookingId: paymentRequest.bookingId 
      });
      throw new Error('Failed to create payment session');
    }
  }

  static async validatePayment(tranId: string, amount: number, currency: string): Promise<PaymentValidationResponse> {
    try {
      logDatabase('validate', 'payment', { tranId });

      const validationRequest = {
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        tran_id: tranId,
        val_id: tranId
      };

      const formData = new URLSearchParams();
      Object.entries(validationRequest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });

      console.log('Sending validation request to SSLCommerz:', {
        url: `${this.getBaseUrl()}/validator/api/validationserverAPI.php`,
        tranId,
        amount,
        currency
      });

      const response = await axios.post(
        `${this.getBaseUrl()}/validator/api/validationserverAPI.php`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      console.log('SSLCommerz validation response:', response.data);
      const validationData = response.data;

      if (validationData.status === 'VALID') {
        try {
          // Update booking and payment status
          const booking = await prisma.booking.findFirst({
            where: {
              payment: {
                transactionId: tranId
              }
            },
            include: {
              payment: true
            }
          });

          if (booking) {
            await prisma.$transaction([
                          // Update payment status
            prisma.payment.update({
              where: { bookingId: booking.id },
              data: {
                status: 'COMPLETED' as PaymentStatus,
                updatedAt: new Date()
              }
            }),
              // Update booking status
              prisma.booking.update({
                where: { id: booking.id },
                              data: {
                status: 'CONFIRMED' as BookingStatus
              }
              })
            ]);

            logDatabase('validate_success', 'payment', { 
              bookingId: booking.id, 
              tranId 
            });
          } else {
            console.error('Booking not found for transaction:', tranId);
          }
        } catch (dbError) {
          console.error('Database update error during validation:', dbError);
          logError(dbError, { 
            operation: 'update_booking_validation', 
            tranId 
          });
        }
      } else {
        console.error('SSLCommerz validation failed:', validationData);
      }

      return validationData;
    } catch (error) {
      console.error('Payment validation error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios validation error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.status === 401) {
          throw new Error('Invalid SSLCommerz credentials for validation');
        } else if (error.response?.status === 400) {
          throw new Error(`SSLCommerz validation error: ${error.response.data?.failedreason || error.message}`);
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('SSLCommerz validation request timeout');
        } else {
          throw new Error(`SSLCommerz validation error: ${error.message}`);
        }
      }
      
      logError(error, { 
        operation: 'validate_payment', 
        tranId 
      });
      throw new Error('Failed to validate payment');
    }
  }

  static async processIPN(ipnData: any): Promise<void> {
    try {
      console.log('Processing IPN:', ipnData);
      logDatabase('process', 'ipn', { ipnData });

      const { tran_id, status, val_id, amount, currency } = ipnData;

      if (!tran_id) {
        console.error('Missing tran_id in IPN data');
        return;
      }

      if (status === 'VALID') {
        try {
          await this.validatePayment(tran_id, parseFloat(amount || '0'), currency || 'BDT');
        } catch (validationError) {
          console.error('Payment validation failed:', validationError);
          logError(validationError, { 
            operation: 'ipn_validation_failed', 
            tran_id 
          });
        }
      } else {
        try {
          // Update payment status to failed
          const booking = await prisma.booking.findFirst({
            where: {
              payment: {
                transactionId: tran_id
              }
            }
          });

          if (booking) {
            await prisma.payment.update({
              where: { bookingId: booking.id },
                          data: {
              status: 'FAILED' as PaymentStatus
            }
            });
            console.log('Payment marked as failed for booking:', booking.id);
          } else {
            console.error('Booking not found for failed transaction:', tran_id);
          }
        } catch (dbError) {
          console.error('Database update error for failed payment:', dbError);
          logError(dbError, { 
            operation: 'update_failed_payment', 
            tran_id 
          });
        }
      }

      logDatabase('process_success', 'ipn', { tran_id, status });
    } catch (error) {
      console.error('IPN processing error:', error);
      logError(error, { 
        operation: 'process_ipn', 
        ipnData 
      });
      // Don't throw error to prevent SSLCommerz retries
    }
  }

  static async getPaymentStatus(bookingId: string): Promise<any> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          payment: true,
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
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return booking;
    } catch (error) {
      logError(error, { 
        operation: 'get_payment_status', 
        bookingId 
      });
      throw new Error('Failed to get payment status');
    }
  }

  static async refundPayment(bookingId: string, reason: string): Promise<void> {
    try {
      logDatabase('refund', 'payment', { bookingId, reason });

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true }
      });

      if (!booking || !booking.payment) {
        throw new Error('Booking or payment not found');
      }

      // Update payment status to refunded
      await prisma.payment.update({
        where: { bookingId },
        data: {
          status: 'REFUNDED' as PaymentStatus,
          refundReason: reason,
          refundedAt: new Date()
        }
      });

      // Update booking status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED' as BookingStatus
        }
      });

      logDatabase('refund_success', 'payment', { bookingId });
    } catch (error) {
      logError(error, { 
        operation: 'refund_payment', 
        bookingId 
      });
      throw new Error('Failed to refund payment');
    }
  }
} 