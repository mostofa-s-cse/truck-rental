import { Router } from 'express';
import { MessageController } from '../../controllers/messageController';
import { auth } from '../../middleware/auth';

const router = Router();

// Send a message
router.post('/', auth, MessageController.sendMessage);

// Get user conversations
router.get('/conversations', auth, MessageController.getUserConversations);

// Get unread message count
router.get('/unread-count', auth, MessageController.getUnreadCount);

// Search messages
router.get('/search', auth, MessageController.searchMessages);

// Get conversation between two users
router.get('/conversation/:userId2', auth, MessageController.getConversation);

// Mark message as read
router.patch('/:messageId/read', auth, MessageController.markAsRead);

// Mark conversation as read
router.patch('/conversation/:userId2/read', auth, MessageController.markConversationAsRead);

// Delete message
router.delete('/:messageId', auth, MessageController.deleteMessage);

export default router; 