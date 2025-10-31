import { Router } from 'express';
import { EmergencyAlertController } from '../../controllers/emergencyAlertController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Create emergency alert (User only)
router.post('/', auth, authorize('USER'), EmergencyAlertController.createEmergencyAlert);

// Get all emergency alerts (Admin only)
router.get('/', auth, authorize('ADMIN'), EmergencyAlertController.getEmergencyAlerts);

// Get emergency alert by ID (Admin only)
router.get('/:alertId', auth, authorize('ADMIN'), EmergencyAlertController.getEmergencyAlertById);

// Update emergency alert status (Admin only)
router.patch('/:alertId/status', auth, authorize('ADMIN'), EmergencyAlertController.updateEmergencyAlertStatus);

// Get user's emergency alerts (User only)
router.get('/user/alerts', auth, authorize('USER'), EmergencyAlertController.getUserEmergencyAlerts);

// Get emergency alert statistics (Admin only)
router.get('/stats/overview', auth, authorize('ADMIN'), EmergencyAlertController.getEmergencyAlertStats);

// Get active emergency alerts (Admin only)
router.get('/active/alerts', auth, authorize('ADMIN'), EmergencyAlertController.getActiveEmergencyAlerts);

export default router; 