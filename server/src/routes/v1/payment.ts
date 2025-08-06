import { Router } from 'express';
import { PaymentController } from '../../controllers/paymentController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Create payment session (requires authentication)
router.post('/session', auth, authorize('USER'), PaymentController.createPaymentSession);

// Validate payment (requires authentication)
router.post('/validate', auth, authorize('USER'), PaymentController.validatePayment);

// Get payment status (requires authentication)
router.get('/status/:bookingId', auth, authorize('USER'), PaymentController.getPaymentStatus);

// Refund payment (requires authentication)
router.post('/refund/:bookingId', auth, authorize('USER'), PaymentController.refundPayment);

// SSLCommerz callback URLs (public - no authentication required)
router.get('/success', PaymentController.paymentSuccess);
router.get('/fail', PaymentController.paymentFail);
router.get('/cancel', PaymentController.paymentCancel);

// IPN (Instant Payment Notification) - public endpoint
router.post('/ipn', PaymentController.processIPN);

export default router; 