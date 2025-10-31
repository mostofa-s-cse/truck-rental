import { Router } from 'express';
import { SystemSettingController } from '../../controllers/systemSettingController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Get all system settings (Admin only)
router.get('/', auth, authorize('ADMIN'), SystemSettingController.getAllSystemSettings);

// Get system setting statistics (Admin only)
router.get('/stats', auth, authorize('ADMIN'), SystemSettingController.getSystemSettingStats);

// Search system settings (Admin only)
router.get('/search', auth, authorize('ADMIN'), SystemSettingController.searchSystemSettings);

// Get system settings by type (Admin only)
router.get('/type/:type', auth, authorize('ADMIN'), SystemSettingController.getSystemSettingsByType);

// Get specific system setting by key (Admin only)
router.get('/:key', auth, authorize('ADMIN'), SystemSettingController.getSystemSettingByKey);

// Create system setting (Admin only)
router.post('/', auth, authorize('ADMIN'), SystemSettingController.createSystemSetting);

// Update system setting (Admin only)
router.put('/:key', auth, authorize('ADMIN'), SystemSettingController.updateSystemSetting);

// Delete system setting (Admin only)
router.delete('/:key', auth, authorize('ADMIN'), SystemSettingController.deleteSystemSetting);

// Get multiple system settings (Admin only)
router.post('/multiple', auth, authorize('ADMIN'), SystemSettingController.getMultipleSystemSettings);

// Bulk update system settings (Admin only)
router.put('/bulk/update', auth, authorize('ADMIN'), SystemSettingController.bulkUpdateSystemSettings);

export default router; 