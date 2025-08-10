import { Router } from 'express';
import { UserController } from '../../controllers/userController';
import { auth, authorize } from '../../middleware/auth';
import { createMulterUpload } from '../../utils/upload';

const router = Router();

// Multer setup for avatar uploads (local storage)
const upload = createMulterUpload('avatars');

// Get all users (Admin only)
router.get('/', auth, authorize('ADMIN'), UserController.getAllUsers);

// Get user statistics (Admin only)
router.get('/stats', auth, authorize('ADMIN'), UserController.getUserStats);

// Search users (Admin only)
router.get('/search', auth, authorize('ADMIN'), UserController.searchUsers);

// Get current user profile
router.get('/me', auth, UserController.getCurrentUser);

// Update current user profile
router.put('/me', auth, UserController.updateCurrentUser);

// Upload current user avatar
router.post('/me/avatar', auth, upload.single('avatar'), UserController.uploadAvatar);

// Get specific user by ID (Admin only)
router.get('/:userId', auth, authorize('ADMIN'), UserController.getUserById);

// Update specific user (Admin only)
router.put('/:userId', auth, authorize('ADMIN'), UserController.updateUser);

// Deactivate user (Admin only)
router.patch('/:userId/deactivate', auth, authorize('ADMIN'), UserController.deactivateUser);

// Activate user (Admin only)
router.patch('/:userId/activate', auth, authorize('ADMIN'), UserController.activateUser);

export default router; 