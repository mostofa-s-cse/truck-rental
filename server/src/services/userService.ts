import { PrismaClient, UserRole } from '@prisma/client';
import { logDatabase } from '../utils/logger';

const prisma = new PrismaClient();

export class UserService {
  static async getAllUsers(page = 1, limit = 10, role?: UserRole) {
    const skip = (page - 1) * limit;
    const where = role ? { role } : {};

    logDatabase('select', 'users', { page, limit, role });

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          driverProfile: {
            select: {
              id: true,
              truckType: true,
              isVerified: true,
              rating: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getUserById(userId: string) {
    logDatabase('select', 'users', { userId });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        driverProfile: {
          include: {
            reviews: {
              include: {
                user: {
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
            }
          }
        },
        bookings: {
          include: {
            driver: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  static async updateUser(userId: string, updateData: any) {
    logDatabase('update', 'users', { userId, updateFields: Object.keys(updateData) });

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  static async deactivateUser(userId: string) {
    logDatabase('update', 'users', { userId, action: 'deactivate' });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true
      }
    });

    return user;
  }

  static async activateUser(userId: string) {
    logDatabase('update', 'users', { userId, action: 'activate' });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true
      }
    });

    return user;
  }

  static async getUserStats() {
    logDatabase('select', 'users', { operation: 'stats' });

    const [totalUsers, totalDrivers, totalAdmins, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.DRIVER } }),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
      prisma.user.count({ where: { isActive: true } })
    ]);

    return {
      totalUsers,
      totalDrivers,
      totalAdmins,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers
    };
  }

  static async searchUsers(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    logDatabase('select', 'users', { query, page, limit, operation: 'search' });

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
            { phone: { contains: query } }
          ]
        },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({
        where: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
            { phone: { contains: query } }
          ]
        }
      })
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
} 