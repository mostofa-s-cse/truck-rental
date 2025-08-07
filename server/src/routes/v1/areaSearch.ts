import { Router } from 'express';
import { AreaSearchController } from '../../controllers/areaSearchController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// ===== PUBLIC ROUTES =====

// Search areas dynamically (Public)
router.post('/search', AreaSearchController.searchAreas);

// Get areas for dropdown (Public)
router.get('/dropdown', AreaSearchController.getAreasForDropdown);

// Get popular areas (Public)
router.get('/popular', AreaSearchController.getPopularAreas);

// Get nearby areas based on coordinates (Public)
router.get('/nearby', AreaSearchController.getNearbyAreas);

// Get areas grouped by state and city (Public)
router.get('/grouped', AreaSearchController.getAreasGrouped);

// Get cities by state (Public)
router.get('/cities/:state', AreaSearchController.getCitiesByState);

// Get all states (Public)
router.get('/states', AreaSearchController.getStates);

// ===== PROTECTED ROUTES =====

// Get all areas with filters (Admin only)
router.get('/admin', auth, authorize('ADMIN'), AreaSearchController.getAllAreas);

// Get area by ID (Admin only)
router.get('/admin/:id', auth, authorize('ADMIN'), AreaSearchController.getAreaById);

// Create new area (Admin only)
router.post('/admin', auth, authorize('ADMIN'), AreaSearchController.createArea);

// Update area (Admin only)
router.put('/admin/:id', auth, authorize('ADMIN'), AreaSearchController.updateArea);

// Delete area (Admin only)
router.delete('/admin/:id', auth, authorize('ADMIN'), AreaSearchController.deleteArea);

// Get area search analytics (Admin only)
router.get('/admin/analytics', auth, authorize('ADMIN'), AreaSearchController.getAnalytics);

export default router; 