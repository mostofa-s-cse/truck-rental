import { Router } from 'express';
import { BookingController } from '../../controllers/bookingController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Create a new booking (User only)
router.post('/', auth, authorize('USER'), BookingController.createBooking);

// Get all bookings (Admin only)
router.get('/', auth, authorize('ADMIN'), BookingController.getAllBookings);

// Get user's bookings (User only)
router.get('/user/me', auth, authorize('USER'), BookingController.getUserBookings);

// Get driver's bookings (Driver only)
router.get('/driver/me', auth, authorize('DRIVER'), BookingController.getDriverBookings);

// Get a specific booking
router.get('/:bookingId', auth, BookingController.getBooking);

// Update booking
router.put('/:bookingId', auth, BookingController.updateBooking);

// Cancel booking
router.delete('/:bookingId', auth, BookingController.cancelBooking);

export default router; 