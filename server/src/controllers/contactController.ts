import { Request, Response } from 'express';
import { ContactService, CreateContactMessageRequest } from '../services/contactService';
import { ApiResponse } from '../types';
import { logError, logDatabase } from '../utils/logger';

export class ContactController {
  /**
   * Create a new contact message (Public)
   */
  static async createContactMessage(req: Request, res: Response) {
    try {
      const contactData: CreateContactMessageRequest = req.body;

      // Validate required fields
      if (!contactData.name || !contactData.email || !contactData.message) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and message are required fields'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactData.email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      logDatabase('insert', 'contact_messages', { email: contactData.email });

      const result = await ContactService.createContactMessage(contactData);

      const response: ApiResponse = {
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
        data: result
      };

      res.status(201).json(response);
    } catch (error: any) {
      logError(error, {
        operation: 'create_contact_message',
        data: req.body
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to send contact message',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  /**
   * Get all contact messages (Admin only)
   */
  static async getAllContactMessages(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const isReadParam = req.query.isRead as string;
      
      // Parse isRead parameter
      let isRead: boolean | undefined;
      if (isReadParam === 'true') isRead = true;
      else if (isReadParam === 'false') isRead = false;

      const userId = (req as any).user?.userId || 'anonymous';

      logDatabase('select', 'contact_messages', { page, limit, isRead, requestedBy: userId });

      const result = await ContactService.getAllContactMessages(page, limit, isRead);

      const response: ApiResponse = {
        success: true,
        message: 'Contact messages retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';

      logError(error, {
        operation: 'get_all_contact_messages',
        userId,
        page: req.query.page,
        limit: req.query.limit
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve contact messages',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  /**
   * Get a single contact message by ID (Admin only)
   */
  static async getContactMessageById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';

      logDatabase('select', 'contact_messages', { id, requestedBy: userId });

      const result = await ContactService.getContactMessageById(id);

      const response: ApiResponse = {
        success: true,
        message: 'Contact message retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';

      logError(error, {
        operation: 'get_contact_message_by_id',
        userId,
        id: req.params.id
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve contact message',
        error: error.message
      };

      res.status(404).json(response);
    }
  }

  /**
   * Mark a contact message as read (Admin only)
   */
  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';

      logDatabase('update', 'contact_messages', { id, operation: 'mark_as_read', requestedBy: userId });

      const result = await ContactService.markAsRead(id);

      const response: ApiResponse = {
        success: true,
        message: 'Contact message marked as read',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';

      logError(error, {
        operation: 'mark_contact_message_as_read',
        userId,
        id: req.params.id
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to mark contact message as read',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  /**
   * Mark a contact message as unread (Admin only)
   */
  static async markAsUnread(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';

      logDatabase('update', 'contact_messages', { id, operation: 'mark_as_unread', requestedBy: userId });

      const result = await ContactService.markAsUnread(id);

      const response: ApiResponse = {
        success: true,
        message: 'Contact message marked as unread',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';

      logError(error, {
        operation: 'mark_contact_message_as_unread',
        userId,
        id: req.params.id
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to mark contact message as unread',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  /**
   * Delete a contact message (Admin only)
   */
  static async deleteContactMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId || 'anonymous';

      logDatabase('delete', 'contact_messages', { id, requestedBy: userId });

      const result = await ContactService.deleteContactMessage(id);

      const response: ApiResponse = {
        success: true,
        message: 'Contact message deleted successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';

      logError(error, {
        operation: 'delete_contact_message',
        userId,
        id: req.params.id
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete contact message',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  /**
   * Get contact message statistics (Admin only)
   */
  static async getContactMessageStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || 'anonymous';

      logDatabase('select', 'contact_messages', { operation: 'get_stats', requestedBy: userId });

      const result = await ContactService.getContactMessageStats();

      const response: ApiResponse = {
        success: true,
        message: 'Contact message statistics retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'anonymous';

      logError(error, {
        operation: 'get_contact_message_stats',
        userId
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve contact message statistics',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
}

