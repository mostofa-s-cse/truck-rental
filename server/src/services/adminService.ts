import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminService {
  static async getDashboardStats() {
    const [
      totalUsers,
      totalDrivers,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
      averageRating,
      activeDrivers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'DRIVER' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { fare: true }
      }),
      prisma.review.aggregate({
        _avg: { rating: true }
      }),
      prisma.driver.count({ where: { isAvailable: true } })
    ]);

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get top drivers by rating
    const topDrivers = await prisma.driver.findMany({
      take: 5,
      where: {
        rating: { gt: 0 }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });

    return {
      stats: {
        totalUsers,
        totalDrivers,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue: totalRevenue._sum.fare || 0,
        averageRating: averageRating._avg.rating || 0,
        activeDrivers
      },
      recentBookings,
      topDrivers
    };
  }

  static async getBookingAnalytics(timeRange: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        id: true,
        status: true,
        fare: true,
        createdAt: true
      }
    });

    // Group by status
    const statusCounts = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate revenue
    const revenue = bookings
      .filter(booking => booking.status === 'COMPLETED')
      .reduce((sum, booking) => sum + booking.fare, 0);

    // Group by date for chart
    const dailyStats = bookings.reduce((acc, booking) => {
      const date = booking.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0 };
      }
      acc[date].count++;
      if (booking.status === 'COMPLETED') {
        acc[date].revenue += booking.fare;
      }
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return {
      totalBookings: bookings.length,
      statusCounts,
      revenue,
      dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        ...stats
      }))
    };
  }

  static async getDriverAnalytics() {
    const drivers = await prisma.driver.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            fare: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });

    const driverStats = drivers.map(driver => {
      const completedBookings = driver.bookings.filter(b => b.status === 'COMPLETED');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + b.fare, 0);
      const averageRating = driver.reviews.length > 0 
        ? driver.reviews.reduce((sum, r) => sum + r.rating, 0) / driver.reviews.length 
        : 0;

      return {
        id: driver.id,
        name: driver.user.name,
        email: driver.user.email,
        truckType: driver.truckType,
        isVerified: driver.isVerified,
        isAvailable: driver.isAvailable,
        totalTrips: driver.totalTrips,
        totalRevenue,
        averageRating,
        totalBookings: driver.bookings.length,
        completedBookings: completedBookings.length,
        joinDate: driver.user.createdAt
      };
    });

    return driverStats;
  }

  static async getSystemSettings() {
    const settings = await prisma.systemSetting.findMany();
    
    const settingsMap = settings.reduce((acc, setting) => {
      let value: any = setting.value;
      
      switch (setting.type) {
        case 'number':
          value = parseFloat(setting.value);
          break;
        case 'boolean':
          value = setting.value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(setting.value);
          } catch {
            value = setting.value;
          }
          break;
      }
      
      acc[setting.key] = value;
      return acc;
    }, {} as Record<string, any>);

    return settingsMap;
  }

  static async updateSystemSetting(key: string, value: any, type: string) {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value: stringValue, type },
      create: { key, value: stringValue, type }
    });

    return setting;
  }

  static async getPendingDriverVerifications() {
    const drivers = await prisma.driver.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return drivers;
  }

  static async getBookingReports(filters: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    driverId?: string;
    userId?: string;
  }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters.driverId) {
      where.driverId = filters.driverId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return bookings;
  }

  static async getRevenueReport(startDate: Date, endDate: Date) {
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        fare: true,
        createdAt: true,
        driver: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.fare, 0);
    
    // Group by driver
    const driverRevenue = bookings.reduce((acc, booking) => {
      const driverName = booking.driver.user.name;
      if (!acc[driverName]) {
        acc[driverName] = { revenue: 0, trips: 0 };
      }
      acc[driverName].revenue += booking.fare;
      acc[driverName].trips += 1;
      return acc;
    }, {} as Record<string, { revenue: number; trips: number }>);

    // Group by date
    const dailyRevenue = bookings.reduce((acc, booking) => {
      const date = booking.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { revenue: 0, trips: 0 };
      }
      acc[date].revenue += booking.fare;
      acc[date].trips += 1;
      return acc;
    }, {} as Record<string, { revenue: number; trips: number }>);

    return {
      totalRevenue,
      totalTrips: bookings.length,
      driverRevenue: Object.entries(driverRevenue).map(([driver, stats]) => ({
        driver,
        ...stats
      })),
      dailyRevenue: Object.entries(dailyRevenue).map(([date, stats]) => ({
        date,
        ...stats
      }))
    };
  }
} 