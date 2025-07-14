import { Request, Response } from 'express';
import { MessageService } from '../services/messageService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class MessageController {
  static async sendMessage(req: Request, res: Response) {
    try {
      const senderId = (req as any).user.userId;
      const messageData = {
        ...req.body,
        senderId
      };
      
      logDatabase('insert', 'messages', { senderId, receiverId: messageData.receiverId, messageType: messageData.type });
      
      const result = await MessageService.sendMessage(messageData);

      logDatabase('insert_success', 'messages', { messageId: result.id, senderId, receiverId: messageData.receiverId });

      const response: ApiResponse = {
        success: true,
        message: 'Message sent successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error: any) {
      const senderId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'send_message', 
        senderId,
        messageData: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to send message',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getConversation(req: Request, res: Response) {
    try {
      const userId1 = (req as any).user.userId;
      const { userId2 } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      logDatabase('select', 'messages', { userId1, userId2, page, limit, operation: 'get_conversation' });
      
      const result = await MessageService.getConversation(userId1, userId2, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Conversation retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId1 = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_conversation', 
        userId1,
        userId2: req.params.userId2,
        page: req.query.page,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get conversation',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getUserConversations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      logDatabase('select', 'messages', { userId, operation: 'get_user_conversations' });
      
      const result = await MessageService.getUserConversations(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User conversations retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_user_conversations', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get user conversations',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = (req as any).user.userId;
      
      logDatabase('update', 'messages', { messageId, userId, action: 'mark_as_read' });
      
      const result = await MessageService.markAsRead(messageId, userId);

      logDatabase('update_success', 'messages', { messageId, userId, action: 'marked_as_read' });

      const response: ApiResponse = {
        success: true,
        message: 'Message marked as read',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'mark_as_read', 
        messageId: req.params.messageId,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to mark message as read',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async markConversationAsRead(req: Request, res: Response) {
    try {
      const userId1 = (req as any).user.userId;
      const { userId2 } = req.params;
      
      logDatabase('update', 'messages', { userId1, userId2, action: 'mark_conversation_as_read' });
      
      const result = await MessageService.markConversationAsRead(userId1, userId2);

      logDatabase('update_success', 'messages', { userId1, userId2, action: 'conversation_marked_as_read' });

      const response: ApiResponse = {
        success: true,
        message: 'Conversation marked as read',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId1 = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'mark_conversation_as_read', 
        userId1,
        userId2: req.params.userId2
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to mark conversation as read',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      logDatabase('select', 'messages', { userId, operation: 'get_unread_count' });
      
      const result = await MessageService.getUnreadCount(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Unread count retrieved successfully',
        data: { unreadCount: result }
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'get_unread_count', 
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get unread count',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async deleteMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = (req as any).user.userId;
      
      logDatabase('delete', 'messages', { messageId, userId });
      
      const result = await MessageService.deleteMessage(messageId, userId);

      logDatabase('delete_success', 'messages', { messageId, userId });

      const response: ApiResponse = {
        success: true,
        message: 'Message deleted successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'delete_message', 
        messageId: req.params.messageId,
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete message',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async searchMessages(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!query) {
        throw new Error('Search query is required');
      }

      logDatabase('select', 'messages', { userId, query, page, limit, operation: 'search_messages' });
      
      const result = await MessageService.searchMessages(userId, query, page, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Messages search completed successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'search_messages', 
        userId,
        query: req.query.q,
        page: req.query.page,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to search messages',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 