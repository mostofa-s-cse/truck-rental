import { Router } from 'express';
import { ContactController } from '../../controllers/contactController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Public routes
router.post('/', ContactController.createContactMessage);

// Admin routes
router.get('/', auth, authorize('ADMIN'), ContactController.getAllContactMessages);
router.get('/stats', auth, authorize('ADMIN'), ContactController.getContactMessageStats);
router.get('/:id', auth, authorize('ADMIN'), ContactController.getContactMessageById);
router.put('/:id/read', auth, authorize('ADMIN'), ContactController.markAsRead);
router.put('/:id/unread', auth, authorize('ADMIN'), ContactController.markAsUnread);
router.delete('/:id', auth, authorize('ADMIN'), ContactController.deleteContactMessage);

export default router;

