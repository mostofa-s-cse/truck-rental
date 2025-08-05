import { PrismaClient } from '@prisma/client';
import { CreateDriverRequest, SearchDriversRequest } from '../types';

const prisma = new PrismaClient();

export class DriverService {
  static async createDriver(userId: string, driverData: CreateDriverRequest) {
    // Check if user already has a driver profile
    const existingDriver = await prisma.driver.findUnique({
      where: { userId }
    });

    if (existingDriver) {
      throw new Error('Driver profile already exists for this user');
    }

    // Create driver profile
    const driver = await prisma.driver.create({
      data: {
        userId,
        ...driverData
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        }
      }
    });

    return driver;
  }

  static async updateDriver(userId: string, driverData: Partial<CreateDriverRequest>) {
    const driver = await prisma.driver.update({
      where: { userId },
      data: driverData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        }
      }
    });

    return driver;
  }

  static async getDriverProfile(userId: string) {
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
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
          },
          take: 5
        }
      }
    });

    if (!driver) {
      throw new Error('Driver profile not found');
    }

    return driver;
  }

  static async searchDrivers(searchParams: SearchDriversRequest) {
    const {
      truckType,
      capacity,
      location,
      latitude,
      longitude,
      radius = 10
    } = searchParams;

    const where: any = {
      isAvailable: true,
      isVerified: true
    };

    if (truckType) {
      where.truckType = truckType;
    }

    if (capacity) {
      where.capacity = {
        gte: capacity
      };
    }

    if (location) {
      where.location = {
        contains: location
      };
    }

    // If coordinates are provided, filter by distance
    if (latitude && longitude) {
      // This is a simplified distance calculation
      // In production, you might want to use a more sophisticated geospatial query
      where.AND = [
        {
          latitude: {
            gte: latitude - (radius / 111), // Rough conversion to degrees
            lte: latitude + (radius / 111)
          }
        },
        {
          longitude: {
            gte: longitude - (radius / (111 * Math.cos(latitude * Math.PI / 180))),
            lte: longitude + (radius / (111 * Math.cos(latitude * Math.PI / 180)))
          }
        }
      ];
    }

    const drivers = await prisma.driver.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });

    return drivers;
  }

  static async updateAvailability(userId: string, isAvailable: boolean) {
    const driver = await prisma.driver.update({
      where: { userId },
      data: { isAvailable },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        }
      }
    });

    return driver;
  }

  static async updateLocation(userId: string, location: string, latitude?: number, longitude?: number) {
    const driver = await prisma.driver.update({
      where: { userId },
      data: {
        location,
        latitude,
        longitude
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        }
      }
    });

    return driver;
  }

  static async verifyDriver(driverId: string, isVerified: boolean) {
    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: { isVerified },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        }
      }
    });

    return driver;
  }

  static async getAllDrivers(page = 1, limit = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    
    let where: any = {};
    let countWhere: any = {};
    
    // Handle search
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { location: { contains: search } }
      ];
      countWhere.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { location: { contains: search } }
      ];
    }
    
    // Handle status filter
    if (status === 'verified') {
      where.isVerified = true;
      countWhere.isVerified = true;
    } else if (status === 'pending') {
      where.isVerified = false;
      countWhere.isVerified = false;
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true
            }
          },
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.driver.count({ where: countWhere })
    ]);

    // Transform the data to match the expected format
    const transformedDrivers = drivers.map(driver => ({
      ...driver,
      totalBookings: driver._count.bookings,
      completedBookings: 0, // This would need to be calculated from bookings if needed
      totalRevenue: 0 // This would need to be calculated from bookings if needed
    }));

    return {
      drivers: transformedDrivers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
} 