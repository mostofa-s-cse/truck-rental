import { Router } from 'express';
import { DashboardController } from '../../controllers/dashboardController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Get user dashboard stats (User only)
router.get('/stats', auth, authorize('USER'), DashboardController.getUserDashboardStats);

// Get driver dashboard stats (Driver only)
router.get('/driver/stats', auth, authorize('DRIVER'), DashboardController.getDriverDashboardStats);

export default router; 