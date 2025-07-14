import { PrismaClient } from '@prisma/client';
import { logDatabase } from '../utils/logger';

const prisma = new PrismaClient();

export interface EmergencyAlertRequest {
  userId: string;
  type: 'SAFETY' | 'ACCIDENT' | 'BREAKDOWN' | 'THEFT' | 'OTHER';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  contactNumber?: string;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  type: string;
  location: any;
  description: string;
  severity: string;
  status: string; // PENDING, ACKNOWLEDGED, RESOLVED, CLOSED
  contactNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

export class EmergencyAlertService {
  static async createEmergencyAlert(data: EmergencyAlertRequest): Promise<EmergencyAlert> {
    logDatabase('insert', 'emergency_alerts', { 
      userId: data.userId, 
      type: data.type, 
      severity: data.severity 
    });

    const alert = await prisma.emergencyAlert.create({
      data: {
        userId: data.userId,
        type: data.type,
        location: data.location,
        description: data.description,
        severity: data.severity,
        contactNumber: data.contactNumber,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    logDatabase('insert_success', 'emergency_alerts', { alertId: alert.id });

    // TODO: Send real-time notification to admins
    await this.notifyAdmins(alert);

    return alert;
  }

  static async getEmergencyAlerts(page = 1, limit = 10, status?: string, severity?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (severity) where.severity = severity;

    logDatabase('select', 'emergency_alerts', { page, limit, status, severity });

    const [alerts, total] = await Promise.all([
      prisma.emergencyAlert.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.emergencyAlert.count({ where })
    ]);

    return {
      alerts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getEmergencyAlertById(alertId: string): Promise<EmergencyAlert> {
    logDatabase('select', 'emergency_alerts', { alertId });

    const alert = await prisma.emergencyAlert.findUnique({
      where: { id: alertId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!alert) {
      throw new Error('Emergency alert not found');
    }

    return alert;
  }

  static async updateEmergencyAlertStatus(alertId: string, status: string, adminId: string): Promise<EmergencyAlert> {
    logDatabase('update', 'emergency_alerts', { alertId, status, adminId });

    const alert = await prisma.emergencyAlert.update({
      where: { id: alertId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    logDatabase('update_success', 'emergency_alerts', { alertId, status });

    // TODO: Send notification to user about status update
    await this.notifyUser(alert, status);

    return alert;
  }

  static async getUserEmergencyAlerts(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    logDatabase('select', 'emergency_alerts', { userId, page, limit, operation: 'user_alerts' });

    const [alerts, total] = await Promise.all([
      prisma.emergencyAlert.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.emergencyAlert.count({ where: { userId } })
    ]);

    return {
      alerts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getEmergencyAlertStats() {
    logDatabase('select', 'emergency_alerts', { operation: 'stats' });

    const [totalAlerts, pendingAlerts, criticalAlerts, alertsByType] = await Promise.all([
      prisma.emergencyAlert.count(),
      prisma.emergencyAlert.count({ where: { status: 'PENDING' } }),
      prisma.emergencyAlert.count({ where: { severity: 'CRITICAL' } }),
      prisma.emergencyAlert.groupBy({
        by: ['type'],
        _count: { type: true }
      })
    ]);

    return {
      totalAlerts,
      pendingAlerts,
      criticalAlerts,
      alertsByType: alertsByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  private static async notifyAdmins(alert: EmergencyAlert): Promise<void> {
    // TODO: Implement real-time notification to admins
    // This could use WebSocket, push notifications, or email
    logDatabase('notification', 'emergency_alerts', { 
      alertId: alert.id, 
      operation: 'notify_admins',
      severity: alert.severity 
    });
  }

  private static async notifyUser(alert: EmergencyAlert, status: string): Promise<void> {
    // TODO: Implement notification to user about status update
    logDatabase('notification', 'emergency_alerts', { 
      alertId: alert.id, 
      userId: alert.userId,
      operation: 'notify_user',
      status 
    });
  }

  static async getActiveEmergencyAlerts(): Promise<EmergencyAlert[]> {
    logDatabase('select', 'emergency_alerts', { operation: 'active_alerts' });

    return await prisma.emergencyAlert.findMany({
      where: {
        status: {
          in: ['PENDING', 'ACKNOWLEDGED']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
} 