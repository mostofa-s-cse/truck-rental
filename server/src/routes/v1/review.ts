import { Router } from 'express';
import { ReviewController } from '../../controllers/reviewController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Create a review (User only)
router.post('/', auth, authorize('USER'), ReviewController.createReview);

// Create a review for a specific booking (User only)
router.post('/booking/:bookingId', auth, authorize('USER'), ReviewController.createReviewForBooking);

// Get review statistics (Admin only)
router.get('/stats', auth, authorize('ADMIN'), ReviewController.getReviewStats);

// Get all reviews (Admin only)
router.get('/', auth, authorize('ADMIN'), ReviewController.getAllReviews);

// Get driver reviews
router.get('/driver/:driverId', auth, ReviewController.getDriverReviews);

// Get user's reviews
router.get('/user/me', auth, ReviewController.getUserReviews);

// Get specific review
router.get('/:reviewId', auth, ReviewController.getReviewById);

// Update review (User only)
router.put('/:reviewId', auth, authorize('USER'), ReviewController.updateReview);

// Delete review (User only)
router.delete('/:reviewId', auth, authorize('USER'), ReviewController.deleteReview);

export default router; 