import { Router } from 'express';
import { FareCalculationController } from '../../controllers/fareCalculationController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Get truck categories (Public)
router.get('/categories', FareCalculationController.getTruckCategories);

// Calculate fare (Public - no auth required for fare calculation)
router.post('/calculate', FareCalculationController.calculateFare);

// Get route details for map display (Public)
router.post('/route', FareCalculationController.getRouteDetails);

// Get fare history (User only)
router.get('/history', auth, authorize('USER'), FareCalculationController.getFareHistory);

// Get fare analytics (Admin only)
router.get('/analytics', auth, authorize('ADMIN'), FareCalculationController.getFareAnalytics);

export default router; 