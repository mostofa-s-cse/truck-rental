import { PrismaClient, BookingStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardService {
  static async getUserDashboardStats(userId: string) {
    // Get user's bookings
    const userBookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        driver: {
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
        },
        review: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate statistics
    const totalBookings = userBookings.length;
    const totalSpent = userBookings.reduce((sum, booking) => sum + booking.fare, 0);
    const completedBookings = userBookings.filter(booking => booking.status === BookingStatus.COMPLETED);
    const averageRating = completedBookings.length > 0 
      ? completedBookings.reduce((sum, booking) => {
          const review = booking.review;
          return sum + (review ? review.rating : 0);
        }, 0) / completedBookings.length
      : 0;

    // Get unique drivers (favorite drivers)
    const uniqueDrivers = new Set(userBookings.map(booking => booking.driverId));
    const favoriteDrivers = uniqueDrivers.size;

    // Get recent bookings (last 5)
    const recentBookings = userBookings.slice(0, 5);

    // Get nearby drivers (mock data for now)
    const nearbyDrivers = await prisma.driver.findMany({
      where: {
        isAvailable: true,
        isVerified: true
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
      },
      take: 5,
      orderBy: { rating: 'desc' }
    });

    // Generate spending data (last 6 months)
    const spendingData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    for (let i = 0; i < 6; i++) {
      const monthBookings = userBookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        const currentDate = new Date();
        const monthDiff = (currentDate.getFullYear() - bookingDate.getFullYear()) * 12 + 
                         (currentDate.getMonth() - bookingDate.getMonth());
        return monthDiff === i;
      });
      const monthAmount = monthBookings.reduce((sum, booking) => sum + booking.fare, 0);
      spendingData.push({ month: months[i], amount: monthAmount });
    }

    // Booking status data
    const bookingStatusData = [
      { status: 'Completed', count: userBookings.filter(b => b.status === BookingStatus.COMPLETED).length },
      { status: 'Active', count: userBookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length },
      { status: 'Upcoming', count: userBookings.filter(b => b.status === BookingStatus.CONFIRMED).length },
      { status: 'Cancelled', count: userBookings.filter(b => b.status === BookingStatus.CANCELLED).length }
    ];

    return {
      totalBookings,
      totalSpent,
      favoriteDrivers,
      averageRating,
      recentBookings,
      nearbyDrivers,
      spendingData,
      bookingStatusData
    };
  }

  static async getDriverDashboardStats(userId: string) {
    // Get driver profile
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
        }
      }
    });

    if (!driver) {
      throw new Error('Driver profile not found');
    }

    // Get driver's bookings
    const driverBookings = await prisma.booking.findMany({
      where: { driverId: driver.id },
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate statistics
    const totalTrips = driverBookings.filter(b => b.status === BookingStatus.COMPLETED).length;
    const totalEarnings = driverBookings.reduce((sum, booking) => sum + booking.fare, 0);
    
    // Calculate completion rate
    const totalBookings = driverBookings.length;
    const completionRate = totalBookings > 0 ? (totalTrips / totalBookings) * 100 : 0;

    // Get reviews for average rating
    const reviews = await prisma.review.findMany({
      where: { driverId: driver.id }
    });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : driver.rating;

    // Mock response time (in a real app, this would track actual response times)
    const responseTime = '2.3 min';

    // Get recent bookings (last 5)
    const recentBookings = driverBookings.slice(0, 5);

    // Calculate earnings breakdown
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEarnings = driverBookings
      .filter(booking => new Date(booking.createdAt) >= today)
      .reduce((sum, booking) => sum + booking.fare, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisWeekEarnings = driverBookings
      .filter(booking => new Date(booking.createdAt) >= thisWeek)
      .reduce((sum, booking) => sum + booking.fare, 0);

    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    const thisMonthEarnings = driverBookings
      .filter(booking => new Date(booking.createdAt) >= thisMonth)
      .reduce((sum, booking) => sum + booking.fare, 0);

    return {
      totalTrips,
      averageRating,
      completionRate,
      responseTime,
      recentBookings,
      earnings: {
        today: todayEarnings,
        thisWeek: thisWeekEarnings,
        thisMonth: thisMonthEarnings,
        totalEarnings
      }
    };
  }

  // Admin Dashboard Methods
  static async getAdminDashboardStats() {
    // Get total counts
    const totalUsers = await prisma.user.count({
      where: { role: UserRole.USER }
    });

    const totalDrivers = await prisma.user.count({
      where: { role: UserRole.DRIVER }
    });

    const totalBookings = await prisma.booking.count();

    // Calculate total revenue
    const allBookings = await prisma.booking.findMany({
      where: { status: BookingStatus.COMPLETED }
    });
    const totalRevenue = allBookings.reduce((sum, booking) => sum + booking.fare, 0);

    // Get pending verifications
    const pendingVerifications = await prisma.driver.count({
      where: { isVerified: false }
    });

    // Get active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
        }
      }
    });

    return {
      totalUsers,
      totalDrivers,
      totalBookings,
      totalRevenue,
      pendingVerifications,
      activeBookings
    };
  }

  static async getPendingDriverVerifications() {
    const pendingDrivers = await prisma.driver.findMany({
      where: { isVerified: false },
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
      orderBy: { createdAt: 'asc' }
    });

    return pendingDrivers.map(driver => ({
      id: driver.id,
      name: driver.user.name,
      email: driver.user.email,
      truckType: driver.truckType,
      submittedAt: driver.createdAt
    }));
  }

  static async getRecentBookings(limit: number = 10) {
    const recentBookings = await prisma.booking.findMany({
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
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return recentBookings.map(booking => ({
      id: booking.id,
      user: booking.user.name,
      driver: booking.driver.user.name,
      source: booking.source,
      destination: booking.destination,
      fare: booking.fare,
      status: booking.status,
      date: booking.createdAt,
      pickupTime: booking.pickupTime
    }));
  }

  static async approveDriver(driverId: string) {
    return await prisma.driver.update({
      where: { id: driverId },
      data: { isVerified: true }
    });
  }

  static async rejectDriver(driverId: string) {
    return await prisma.driver.update({
      where: { id: driverId },
      data: { isVerified: false }
    });
  }

  // Driver-specific methods
  static async updateDriverAvailability(driverId: string, isAvailable: boolean) {
    return await prisma.driver.update({
      where: { id: driverId },
      data: { isAvailable }
    });
  }

  static async acceptBooking(bookingId: string) {
    return await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED }
    });
  }

  static async declineBooking(bookingId: string) {
    return await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED }
    });
  }

  // User-specific methods
  static async searchDrivers(params: {
    location?: string;
    truckType?: string;
    capacity?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }) {
    const whereClause: any = {
      isAvailable: true,
      isVerified: true
    };

    if (params.truckType) {
      whereClause.truckType = params.truckType;
    }

    if (params.capacity) {
      whereClause.capacity = {
        gte: params.capacity
      };
    }

    if (params.location) {
      whereClause.location = {
        contains: params.location,
        mode: 'insensitive'
      };
    }

    const drivers = await prisma.driver.findMany({
      where: whereClause,
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
      },
      orderBy: { rating: 'desc' }
    });

    return drivers.map(driver => ({
      id: driver.id,
      name: driver.user.name,
      truckType: driver.truckType,
      capacity: driver.capacity,
      rating: driver.rating,
      distance: 5, // Mock distance calculation
      isAvailable: driver.isAvailable,
      location: driver.location
    }));
  }

  static async calculateFare(params: {
    source: string;
    destination: string;
    truckType: string;
  }) {
    // Mock fare calculation
    const baseRate = 2.5; // per km
    const distance = 15; // Mock distance calculation
    
    let multiplier = 1;
    switch (params.truckType) {
      case 'MINI_TRUCK':
        multiplier = 1;
        break;
      case 'PICKUP':
        multiplier = 1.2;
        break;
      case 'LORRY':
        multiplier = 1.5;
        break;
      case 'TRUCK':
        multiplier = 2;
        break;
    }

    const fare = baseRate * distance * multiplier;

    return {
      fare: Math.round(fare * 100) / 100,
      distance
    };
  }
} 