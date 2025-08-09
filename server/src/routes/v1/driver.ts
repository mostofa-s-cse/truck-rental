import { Router } from 'express';
import { DriverController } from '../../controllers/driverController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Driver routes (requires driver role)
router.post('/profile', auth, authorize('DRIVER'), DriverController.createDriver);
router.put('/profile', auth, authorize('DRIVER'), DriverController.updateDriver);
router.get('/profile', auth, authorize('DRIVER'), DriverController.getDriverProfile);
router.put('/availability', auth, authorize('DRIVER'), DriverController.updateAvailability);
router.put('/location', auth, authorize('DRIVER'), DriverController.updateLocation);

// Public routes
router.get('/search', DriverController.searchDrivers);

// Contact driver (User only)
router.post('/contact/:driverId', auth, authorize('USER'), DriverController.contactDriver);

// Admin routes
router.put('/verify/:driverId', auth, authorize('ADMIN'), DriverController.verifyDriver);
router.get('/all', auth, authorize('ADMIN'), DriverController.getAllDrivers);

export default router; 