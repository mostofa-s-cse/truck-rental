import { Router } from 'express';
import { DashboardController } from '../../controllers/dashboardController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// User Dashboard Routes
router.get('/stats', auth, authorize('USER'), DashboardController.getUserDashboardStats);
router.get('/drivers/nearby', auth, authorize('USER'), DashboardController.searchDrivers);
router.post('/fare/calculate', auth, authorize('USER'), DashboardController.calculateFare);

// Driver Dashboard Routes
router.get('/driver/stats', auth, authorize('DRIVER'), DashboardController.getDriverDashboardStats);
router.put('/driver/availability', auth, authorize('DRIVER'), DashboardController.updateDriverAvailability);
router.put('/driver/bookings/:bookingId/accept', auth, authorize('DRIVER'), DashboardController.acceptBooking);
router.put('/driver/bookings/:bookingId/decline', auth, authorize('DRIVER'), DashboardController.declineBooking);

// Admin Dashboard Routes
router.get('/admin/stats', auth, authorize('ADMIN'), DashboardController.getAdminDashboardStats);
router.get('/admin/drivers/pending-verifications', auth, authorize('ADMIN'), DashboardController.getPendingDriverVerifications);
router.get('/admin/bookings/recent', auth, authorize('ADMIN'), DashboardController.getRecentBookings);
router.put('/admin/drivers/:driverId/verify', auth, authorize('ADMIN'), DashboardController.approveDriver);
router.put('/admin/drivers/:driverId/reject', auth, authorize('ADMIN'), DashboardController.rejectDriver);

export default router; 