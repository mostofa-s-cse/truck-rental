import { Router } from 'express';
import { PaymentController } from '../../controllers/paymentController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Create payment
router.post('/', auth, PaymentController.createPayment);

// Get all payments (Admin only)
router.get('/', auth, authorize('ADMIN'), PaymentController.getAllPayments);

// Get payment statistics (Admin only)
router.get('/stats', auth, authorize('ADMIN'), PaymentController.getPaymentStats);

// Get user's payment history
router.get('/history', auth, PaymentController.getPaymentHistory);

// Get payment by booking ID
router.get('/booking/:bookingId', auth, PaymentController.getPaymentByBookingId);

// Get specific payment
router.get('/:paymentId', auth, PaymentController.getPaymentById);

// Update payment status
router.patch('/:paymentId/status', auth, PaymentController.updatePaymentStatus);

// Process refund (Admin only)
router.post('/:paymentId/refund', auth, authorize('ADMIN'), PaymentController.processRefund);

export default router; 