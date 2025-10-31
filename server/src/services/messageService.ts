import { PrismaClient } from '@prisma/client';
import { logDatabase } from '../utils/logger';

const prisma = new PrismaClient();

export class MessageService {
  static async sendMessage(messageData: {
    senderId: string;
    receiverId: string;
    content: string;
  }) {
    const { senderId, receiverId, content } = messageData;

    logDatabase('insert', 'messages', { senderId, receiverId });

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      throw new Error('Receiver not found');
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    return message;
  }

  static async getConversation(userId1: string, userId2: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    logDatabase('select', 'messages', { userId1, userId2, page, limit, operation: 'conversation' });

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            {
              AND: [
                { senderId: userId1 },
                { receiverId: userId2 }
              ]
            },
            {
              AND: [
                { senderId: userId2 },
                { receiverId: userId1 }
              ]
            }
          ]
        },
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.message.count({
        where: {
          OR: [
            {
              AND: [
                { senderId: userId1 },
                { receiverId: userId2 }
              ]
            },
            {
              AND: [
                { senderId: userId2 },
                { receiverId: userId1 }
              ]
            }
          ]
        }
      })
    ]);

    return {
      messages: messages.reverse(), // Show oldest first
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getUserConversations(userId: string) {
    logDatabase('select', 'messages', { userId, operation: 'user_conversations' });

    // Get all unique conversations for the user
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group conversations by the other user
    const conversationMap = new Map();

    conversations.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = message.senderId === userId ? message.receiver : message.sender;

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          user: otherUser,
          lastMessage: message,
          unreadCount: 0
        });
      }
    });

    // Count unread messages
    const unreadMessages = await prisma.message.findMany({
      where: {
        receiverId: userId,
        isRead: false
      }
    });

    unreadMessages.forEach(message => {
      const conversation = conversationMap.get(message.senderId);
      if (conversation) {
        conversation.unreadCount++;
      }
    });

    return Array.from(conversationMap.values());
  }

  static async markAsRead(messageId: string, userId: string) {
    logDatabase('update', 'messages', { messageId, userId, action: 'mark_read' });

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new Error('Unauthorized to mark this message as read');
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    return updatedMessage;
  }

  static async markConversationAsRead(userId1: string, userId2: string) {
    logDatabase('update', 'messages', { userId1, userId2, action: 'mark_conversation_read' });

    await prisma.message.updateMany({
      where: {
        senderId: userId2,
        receiverId: userId1,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return { message: 'Conversation marked as read' };
  }

  static async getUnreadCount(userId: string) {
    logDatabase('select', 'messages', { userId, operation: 'unread_count' });

    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });

    return count;
  }

  static async deleteMessage(messageId: string, userId: string) {
    logDatabase('delete', 'messages', { messageId, userId });

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    return { message: 'Message deleted successfully' };
  }

  static async searchMessages(userId: string, query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    logDatabase('select', 'messages', { userId, query, page, limit, operation: 'search' });

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            {
              AND: [
                { senderId: userId },
                { content: { contains: query } }
              ]
            },
            {
              AND: [
                { receiverId: userId },
                { content: { contains: query } }
              ]
            }
          ]
        },
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.message.count({
        where: {
          OR: [
            {
              AND: [
                { senderId: userId },
                { content: { contains: query } }
              ]
            },
            {
              AND: [
                { receiverId: userId },
                { content: { contains: query } }
              ]
            }
          ]
        }
      })
    ]);

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
} 