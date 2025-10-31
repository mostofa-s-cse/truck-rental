import { Router } from 'express';
import { SSLCommerzController } from '../../controllers/SSLCommerzController';
import { SSLCommerzCallbackController } from '../../controllers/SSLCommerzCallbackController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();
const sslCommerzController = new SSLCommerzController();
const sslCommerzCallbackController = new SSLCommerzCallbackController();

// Payment initiation routes (require authentication)
router.post('/initiate', auth, authorize('USER'), sslCommerzController.initiatePayment);
router.post('/verify', auth, authorize('USER'), sslCommerzController.verifyPayment);
router.get('/status/:tranId', auth, authorize('USER'), sslCommerzController.getPaymentStatus);
router.post('/refund/:tranId', auth, authorize('USER'), sslCommerzController.refundPayment);
router.get('/history', auth, authorize('USER'), sslCommerzController.getPaymentHistory);
router.get('/details/:tranId', auth, authorize('USER'), sslCommerzController.getPaymentDetails);

// Simple payment initiation (for testing)
router.post('/initiate-simple', auth, authorize('USER'), sslCommerzController.initiatePaymentSimple);

// IPN handling (no authentication required as it's called by SSLCommerz)
router.post('/ipn', sslCommerzController.handleIPN);

// Payment callback routes (no authentication required as they're called by SSLCommerz)
router.post('/payment/success', sslCommerzCallbackController.handleSSLCommerzSuccess);
router.post('/payment/failure', sslCommerzCallbackController.handleSSLCommerzFailure);
router.post('/payment/cancel', sslCommerzCallbackController.handleSSLCommerzCancel);

// Alternative callback routes (GET method for browser redirects)
router.get('/payment/success', sslCommerzCallbackController.handleSSLCommerzSuccess);
router.get('/payment/failure', sslCommerzCallbackController.handleSSLCommerzFailure);
router.get('/payment/cancel', sslCommerzCallbackController.handleSSLCommerzCancel);

// Enhanced callback handlers
router.post('/callback/success', sslCommerzController.paymentSuccess);
router.post('/callback/failure', sslCommerzController.paymentFailure);
router.post('/callback/cancel', sslCommerzController.paymentCancel);

export default router; 