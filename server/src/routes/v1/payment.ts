import { Router } from 'express';
import { PaymentController } from '../../controllers/paymentController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

// User payment routes (require USER authentication)
router.get('/user/history', auth, authorize('USER'), paymentController.getUserPaymentHistory);

// Admin payment management routes (require ADMIN authentication)
router.get('/', auth, authorize('ADMIN'), paymentController.getAllPayments);
router.get('/stats', auth, authorize('ADMIN'), paymentController.getPaymentStats);
router.get('/:id', auth, authorize('ADMIN'), paymentController.getPaymentById);
router.put('/:id/status', auth, authorize('ADMIN'), paymentController.updatePaymentStatus);
router.post('/', auth, authorize('ADMIN'), paymentController.createPayment);
router.delete('/:id', auth, authorize('ADMIN'), paymentController.deletePayment);

export default router; 