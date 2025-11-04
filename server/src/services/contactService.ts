import { PrismaClient } from '@prisma/client';
import { logDatabase, logError } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateContactMessageRequest {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export class ContactService {
  /**
   * Create a new contact message
   */
  static async createContactMessage(data: CreateContactMessageRequest) {
    try {
      logDatabase('insert', 'contact_messages', { email: data.email });

      const contactMessage = await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message
        }
      });

      logDatabase('insert_success', 'contact_messages', { id: contactMessage.id });

      return contactMessage;
    } catch (error) {
      logError(error, { 
        operation: 'create_contact_message', 
        email: data.email 
      });
      throw error;
    }
  }

  /**
   * Get all contact messages (Admin only)
   */
  static async getAllContactMessages(
    page: number = 1,
    limit: number = 20,
    isRead?: boolean
  ) {
    try {
      const skip = (page - 1) * limit;

      logDatabase('select', 'contact_messages', { page, limit, isRead });

      const where = isRead !== undefined ? { isRead } : {};

      const [messages, total] = await Promise.all([
        prisma.contactMessage.findMany({
          where,
          orderBy: [
            { isRead: 'asc' },  // Unread messages first
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.contactMessage.count({ where })
      ]);

      return {
        messages,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logError(error, { 
        operation: 'get_all_contact_messages', 
        page, 
        limit 
      });
      throw error;
    }
  }

  /**
   * Get a single contact message by ID (Admin only)
   */
  static async getContactMessageById(id: string) {
    try {
      logDatabase('select', 'contact_messages', { id });

      const message = await prisma.contactMessage.findUnique({
        where: { id }
      });

      if (!message) {
        throw new Error('Contact message not found');
      }

      return message;
    } catch (error) {
      logError(error, { 
        operation: 'get_contact_message_by_id', 
        id 
      });
      throw error;
    }
  }

  /**
   * Mark a contact message as read (Admin only)
   */
  static async markAsRead(id: string) {
    try {
      logDatabase('update', 'contact_messages', { id, operation: 'mark_as_read' });

      const message = await prisma.contactMessage.update({
        where: { id },
        data: { isRead: true }
      });

      logDatabase('update_success', 'contact_messages', { id });

      return message;
    } catch (error) {
      logError(error, { 
        operation: 'mark_contact_message_as_read', 
        id 
      });
      throw error;
    }
  }

  /**
   * Mark a contact message as unread (Admin only)
   */
  static async markAsUnread(id: string) {
    try {
      logDatabase('update', 'contact_messages', { id, operation: 'mark_as_unread' });

      const message = await prisma.contactMessage.update({
        where: { id },
        data: { isRead: false }
      });

      logDatabase('update_success', 'contact_messages', { id });

      return message;
    } catch (error) {
      logError(error, { 
        operation: 'mark_contact_message_as_unread', 
        id 
      });
      throw error;
    }
  }

  /**
   * Delete a contact message (Admin only)
   */
  static async deleteContactMessage(id: string) {
    try {
      logDatabase('delete', 'contact_messages', { id });

      await prisma.contactMessage.delete({
        where: { id }
      });

      logDatabase('delete_success', 'contact_messages', { id });

      return { success: true, message: 'Contact message deleted successfully' };
    } catch (error) {
      logError(error, { 
        operation: 'delete_contact_message', 
        id 
      });
      throw error;
    }
  }

  /**
   * Get contact message statistics (Admin only)
   */
  static async getContactMessageStats() {
    try {
      logDatabase('select', 'contact_messages', { operation: 'get_stats' });

      const [total, unread, read] = await Promise.all([
        prisma.contactMessage.count(),
        prisma.contactMessage.count({ where: { isRead: false } }),
        prisma.contactMessage.count({ where: { isRead: true } })
      ]);

      // Get recent messages (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recent = await prisma.contactMessage.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      });

      return {
        total,
        unread,
        read,
        recent
      };
    } catch (error) {
      logError(error, { operation: 'get_contact_message_stats' });
      throw error;
    }
  }
}

