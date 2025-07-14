import { Router } from 'express';
import { AreaController } from '../../controllers/areaController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Get all areas (Public)
router.get('/', AreaController.getAllAreas);

// Get area statistics (Admin only)
router.get('/stats', auth, authorize('ADMIN'), AreaController.getAreaStats);

// Search areas (Public)
router.get('/search', AreaController.searchAreas);

// Get areas by city (Public)
router.get('/city/:city', AreaController.getAreasByCity);

// Get areas by state (Public)
router.get('/state/:state', AreaController.getAreasByState);

// Get specific area by ID (Public)
router.get('/:id', AreaController.getAreaById);

// Create area (Admin only)
router.post('/', auth, authorize('ADMIN'), AreaController.createArea);

// Update area (Admin only)
router.put('/:id', auth, authorize('ADMIN'), AreaController.updateArea);

// Delete area (Admin only)
router.delete('/:id', auth, authorize('ADMIN'), AreaController.deleteArea);

// Deactivate area (Admin only)
router.patch('/:id/deactivate', auth, authorize('ADMIN'), AreaController.deactivateArea);

// Activate area (Admin only)
router.patch('/:id/activate', auth, authorize('ADMIN'), AreaController.activateArea);

export default router; 