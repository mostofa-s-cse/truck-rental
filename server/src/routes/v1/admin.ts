import { Router } from 'express';
import { AdminController } from '../../controllers/adminController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// All admin routes require ADMIN role
router.use(auth, authorize('ADMIN'));

// Dashboard statistics
router.get('/dashboard', AdminController.getDashboardStats);

// Booking analytics
router.get('/analytics/bookings', AdminController.getBookingAnalytics);

// Driver analytics
router.get('/analytics/drivers', AdminController.getDriverAnalytics);

// System settings
router.get('/settings', AdminController.getSystemSettings);
router.put('/settings', AdminController.updateSystemSetting);

// Pending driver verifications
router.get('/drivers/pending-verifications', AdminController.getPendingDriverVerifications);

// Booking reports
router.get('/reports/bookings', AdminController.getBookingReports);

// Revenue reports
router.get('/reports/revenue', AdminController.getRevenueReport);

export default router; 