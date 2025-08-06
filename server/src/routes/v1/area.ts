import { Router } from 'express';
import { AreaController } from '../../controllers/areaController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/dropdown', AreaController.getAreasForDropdown);
router.get('/states', AreaController.getStates);
router.get('/cities/:state', AreaController.getCitiesByState);
router.get('/grouped', AreaController.getAreasGrouped);

// Protected routes (authentication required)
router.get('/', auth, AreaController.getAllAreas);
router.get('/:id', auth, AreaController.getAreaById);

// Admin only routes
router.post('/', auth, authorize('ADMIN'), AreaController.createArea);
router.put('/:id', auth, authorize('ADMIN'), AreaController.updateArea);
router.delete('/:id', auth, authorize('ADMIN'), AreaController.deleteArea);

export default router; 