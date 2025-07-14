import { Router } from 'express';
import { TruckCategoryController } from '../../controllers/truckCategoryController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Get all truck categories (Public)
router.get('/', TruckCategoryController.getAllTruckCategories);

// Get truck category statistics (Admin only)
router.get('/stats', auth, authorize('ADMIN'), TruckCategoryController.getTruckCategoryStats);

// Search truck categories (Public)
router.get('/search', TruckCategoryController.searchTruckCategories);

// Get specific truck category by ID (Public)
router.get('/:id', TruckCategoryController.getTruckCategoryById);

// Create truck category (Admin only)
router.post('/', auth, authorize('ADMIN'), TruckCategoryController.createTruckCategory);

// Update truck category (Admin only)
router.put('/:id', auth, authorize('ADMIN'), TruckCategoryController.updateTruckCategory);

// Delete truck category (Admin only)
router.delete('/:id', auth, authorize('ADMIN'), TruckCategoryController.deleteTruckCategory);

// Deactivate truck category (Admin only)
router.patch('/:id/deactivate', auth, authorize('ADMIN'), TruckCategoryController.deactivateTruckCategory);

// Activate truck category (Admin only)
router.patch('/:id/activate', auth, authorize('ADMIN'), TruckCategoryController.activateTruckCategory);

export default router; 