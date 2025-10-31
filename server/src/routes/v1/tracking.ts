import { Router } from 'express';
import { TrackingController } from '../../controllers/trackingController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Update location (Driver only)
router.post('/location', auth, authorize('DRIVER'), TrackingController.updateLocation);

// Get current location (Public - for tracking)
router.get('/location/:driverId', TrackingController.getCurrentLocation);

// Get tracking history (Driver only)
router.get('/history/:driverId', auth, authorize('DRIVER'), TrackingController.getTrackingHistory);

// Get active drivers in area (Public - for finding nearby drivers)
router.get('/drivers/nearby', TrackingController.getActiveDriversInArea);

// Get driver route (User and Driver)
router.get('/route/:driverId/:bookingId', auth, TrackingController.getDriverRoute);

// Get tracking statistics (Driver only)
router.get('/stats/:driverId', auth, authorize('DRIVER'), TrackingController.getTrackingStats);

export default router; 