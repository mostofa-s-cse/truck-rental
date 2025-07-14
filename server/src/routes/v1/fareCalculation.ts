import { Router } from 'express';
import { FareCalculationController } from '../../controllers/fareCalculationController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Calculate fare (Public - no auth required for fare calculation)
router.post('/calculate', FareCalculationController.calculateFare);

// Get fare history (User only)
router.get('/history', auth, authorize('USER'), FareCalculationController.getFareHistory);

// Get fare analytics (Admin only)
router.get('/analytics', auth, authorize('ADMIN'), FareCalculationController.getFareAnalytics);

export default router; 