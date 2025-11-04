import { Router } from 'express';
import { DriverController } from '../../controllers/driverController';
import { auth, authorize } from '../../middleware/auth';
import { createMulterUpload } from '../../utils/upload';

const router = Router();

// Multer setup for uploads (local storage)
const avatarUpload = createMulterUpload('avatars');
const truckUpload = createMulterUpload('trucks');

// Driver routes (requires driver role)
router.post('/profile', auth, authorize('DRIVER'), DriverController.createDriver);
router.put('/profile', auth, authorize('DRIVER'), DriverController.updateDriver);
router.get('/profile', auth, authorize('DRIVER'), DriverController.getDriverProfile);
router.put('/availability', auth, authorize('DRIVER'), DriverController.updateAvailability);
router.put('/location', auth, authorize('DRIVER'), DriverController.updateLocation);
router.post('/profile/avatar', auth, authorize('DRIVER'), avatarUpload.single('avatar'), DriverController.uploadAvatar);
router.post('/profile/truck-image', auth, authorize('DRIVER'), truckUpload.single('truckImage'), DriverController.uploadTruckImage);
router.post('/profile/truck-images', auth, authorize('DRIVER'), truckUpload.array('truckImages', 4), DriverController.uploadTruckImages);

// Public routes
router.get('/search', DriverController.searchDrivers);

// Contact driver (User only)
router.post('/contact/:driverId', auth, authorize('USER'), DriverController.contactDriver);

// Admin routes
router.put('/verify/:driverId', auth, authorize('ADMIN'), DriverController.verifyDriver);
router.get('/all', auth, authorize('ADMIN'), DriverController.getAllDrivers);

export default router; 