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

    // Location filter will be applied after fetching results for case-insensitive search
    const locationFilter = params.location?.toLowerCase();

    let drivers = await prisma.driver.findMany({
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

    // Apply location filter if specified (case-insensitive)
    if (locationFilter) {
      drivers = drivers.filter(driver => 
        driver.location.toLowerCase().includes(locationFilter)
      );
    }

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

  static async getRevenueAnalytics(filters: any) {
    try {
      // Build where clause based on filters
      const whereClause: any = {};
      
      if (filters.paymentMethod) {
        whereClause.paymentMethod = filters.paymentMethod;
      }
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      if (filters.startDate || filters.endDate) {
        whereClause.createdAt = {};
        if (filters.startDate) {
          whereClause.createdAt.gte = new Date(filters.startDate as string);
        }
        if (filters.endDate) {
          whereClause.createdAt.lte = new Date(filters.endDate as string);
        }
      }

      // Get all bookings with filters
      const bookings = await prisma.booking.findMany({
        where: whereClause,
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
          },
          payment: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate total revenue
      const totalRevenue = bookings.reduce((sum, booking) => sum + booking.fare, 0);
      
      // Calculate today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayBookings = bookings.filter(booking => 
        new Date(booking.createdAt) >= today
      );
      const todayRevenue = todayBookings.reduce((sum, booking) => sum + booking.fare, 0);

      // Calculate monthly revenue
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthlyBookings = bookings.filter(booking => 
        new Date(booking.createdAt) >= monthStart
      );
      const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + booking.fare, 0);

      // Calculate yearly revenue
      const yearStart = new Date();
      yearStart.setMonth(0, 1);
      yearStart.setHours(0, 0, 0, 0);
      const yearlyBookings = bookings.filter(booking => 
        new Date(booking.createdAt) >= yearStart
      );
      const yearlyRevenue = yearlyBookings.reduce((sum, booking) => sum + booking.fare, 0);

      // Calculate average order value
      const averageOrderValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

      // Calculate revenue growth (mock calculation)
      const revenueGrowth = 15.8; // This would be calculated based on previous period

      // Revenue by payment method
      const paymentMethodStats = new Map<string, { revenue: number; count: number }>();
      bookings.forEach(booking => {
        const method = booking.payment?.paymentMethod || 'UNKNOWN';
        const current = paymentMethodStats.get(method) || { revenue: 0, count: 0 };
        current.revenue += booking.fare;
        current.count += 1;
        paymentMethodStats.set(method, current);
      });

      const revenueByMethod = Array.from(paymentMethodStats.entries()).map(([method, stats]) => ({
        method,
        revenue: stats.revenue,
        percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
        icon: 'CreditCardIcon' // This would be mapped based on method
      }));

      // Revenue by month (last 6 months)
      const revenueByMonth = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i, 1);
        monthStart.setHours(0, 0, 0, 0);
        
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        });

        const monthRevenue = monthBookings.reduce((sum, booking) => sum + booking.fare, 0);
        const growth = i === 5 ? 0 : 10 + Math.random() * 10; // Mock growth calculation

        revenueByMonth.push({
          month: months[i],
          revenue: monthRevenue,
          growth: Math.round(growth * 10) / 10
        });
      }

      // Revenue by day of week
      const revenueByDay = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7; i++) {
        const dayBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate.getDay() === i;
        });

        const dayRevenue = dayBookings.reduce((sum, booking) => sum + booking.fare, 0);
        revenueByDay.push({
          day: days[i],
          revenue: dayRevenue,
          bookings: dayBookings.length
        });
      }

      // Top revenue routes
      const routeStats = new Map<string, { revenue: number; bookings: number; totalFare: number }>();
      bookings.forEach(booking => {
        const route = `${booking.source} to ${booking.destination}`;
        const current = routeStats.get(route) || { revenue: 0, bookings: 0, totalFare: 0 };
        current.revenue += booking.fare;
        current.bookings += 1;
        current.totalFare += booking.fare;
        routeStats.set(route, current);
      });

      const topRevenueRoutes = Array.from(routeStats.entries())
        .map(([route, stats]) => ({
          route,
          revenue: stats.revenue,
          bookings: stats.bookings,
          avgFare: stats.bookings > 0 ? Math.round(stats.totalFare / stats.bookings) : 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Revenue by status
      const statusStats = new Map<string, { revenue: number; count: number }>();
      bookings.forEach(booking => {
        const status = booking.status;
        const current = statusStats.get(status) || { revenue: 0, count: 0 };
        current.revenue += booking.fare;
        current.count += 1;
        statusStats.set(status, current);
      });

      const revenueByStatus = Array.from(statusStats.entries()).map(([status, stats]) => ({
        status,
        revenue: stats.revenue,
        percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
        color: status === 'COMPLETED' ? 'bg-green-500' : 
               status === 'PENDING' ? 'bg-yellow-500' : 'bg-blue-500'
      }));

      // Payment method distribution
      const paymentMethodDistribution = Array.from(paymentMethodStats.entries()).map(([method, stats]) => ({
        method,
        count: stats.count,
        revenue: stats.revenue,
        percentage: bookings.length > 0 ? (stats.count / bookings.length) * 100 : 0
      }));

      // Revenue trends (last 7 days)
      const revenueTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= date && bookingDate < nextDate;
        });

        const dayRevenue = dayBookings.reduce((sum, booking) => sum + booking.fare, 0);
        const avgFare = dayBookings.length > 0 ? dayRevenue / dayBookings.length : 0;

        revenueTrends.push({
          date: date.toISOString().split('T')[0],
          revenue: dayRevenue,
          bookings: dayBookings.length,
          avgFare: Math.round(avgFare * 100) / 100
        });
      }

      return {
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        yearlyRevenue,
        revenueGrowth,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        revenueByMethod,
        revenueByMonth,
        revenueByDay,
        topRevenueRoutes,
        revenueByStatus,
        paymentMethodDistribution,
        revenueTrends
      };
    } catch (error) {
      console.error('Error in getRevenueAnalytics:', error);
      throw new Error('Failed to get revenue analytics');
    }
  }

  static async getBookingAnalytics(filters: any) {
    try {
      // Build where clause based on filters
      const whereClause: any = {};
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      if (filters.driverId) {
        whereClause.driverId = filters.driverId;
      }
      
      if (filters.userId) {
        whereClause.userId = filters.userId;
      }
      
      if (filters.startDate || filters.endDate) {
        whereClause.createdAt = {};
        if (filters.startDate) {
          whereClause.createdAt.gte = new Date(filters.startDate as string);
        }
        if (filters.endDate) {
          whereClause.createdAt.lte = new Date(filters.endDate as string);
        }
      }

      // Get all bookings with filters
      const bookings = await prisma.booking.findMany({
        where: whereClause,
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
        orderBy: { createdAt: 'desc' }
      });

      // Calculate basic metrics
      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
      const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
      const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
      const totalRevenue = bookings.reduce((sum, booking) => sum + booking.fare, 0);
      const averageFare = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Booking trends (last 7 days)
      const bookingTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= date && bookingDate < nextDate;
        });

        const dayRevenue = dayBookings.reduce((sum, booking) => sum + booking.fare, 0);
        const completed = dayBookings.filter(b => b.status === 'COMPLETED').length;
        const cancelled = dayBookings.filter(b => b.status === 'CANCELLED').length;

        bookingTrends.push({
          date: date.toISOString().split('T')[0],
          bookings: dayBookings.length,
          revenue: dayRevenue,
          completed,
          cancelled
        });
      }

      // Status distribution
      const statusCounts = new Map<string, number>();
      bookings.forEach(booking => {
        const status = booking.status;
        statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
      });

      const statusDistribution = Array.from(statusCounts.entries()).map(([status, count]) => ({
        status,
        count,
        percentage: totalBookings > 0 ? (count / totalBookings) * 100 : 0,
        color: status === 'COMPLETED' ? 'bg-green-500' : 
               status === 'PENDING' ? 'bg-yellow-500' : 
               status === 'CONFIRMED' ? 'bg-blue-500' : 
               status === 'IN_PROGRESS' ? 'bg-purple-500' : 'bg-red-500'
      }));

      // Top routes
      const routeStats = new Map<string, { bookings: number; revenue: number; totalFare: number }>();
      bookings.forEach(booking => {
        const route = `${booking.source} to ${booking.destination}`;
        const current = routeStats.get(route) || { bookings: 0, revenue: 0, totalFare: 0 };
        current.bookings += 1;
        current.revenue += booking.fare;
        current.totalFare += booking.fare;
        routeStats.set(route, current);
      });

      const topRoutes = Array.from(routeStats.entries())
        .map(([route, stats]) => ({
          route,
          bookings: stats.bookings,
          revenue: stats.revenue,
          avgFare: stats.bookings > 0 ? Math.round(stats.totalFare / stats.bookings) : 0
        }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      // Peak hours (mock data for now)
      const peakHours = [
        { hour: '08:00', bookings: 45, percentage: 12.5 },
        { hour: '09:00', bookings: 52, percentage: 14.4 },
        { hour: '10:00', bookings: 38, percentage: 10.6 },
        { hour: '11:00', bookings: 61, percentage: 16.9 },
        { hour: '12:00', bookings: 48, percentage: 13.3 },
        { hour: '13:00', bookings: 55, percentage: 15.3 },
        { hour: '14:00', bookings: 42, percentage: 11.7 },
        { hour: '15:00', bookings: 38, percentage: 10.6 },
        { hour: '16:00', bookings: 52, percentage: 14.4 },
        { hour: '17:00', bookings: 45, percentage: 12.5 }
      ];

      // Monthly comparison (last 6 months)
      const monthlyComparison = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i, 1);
        monthStart.setHours(0, 0, 0, 0);
        
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        });

        const monthRevenue = monthBookings.reduce((sum, booking) => sum + booking.fare, 0);
        const growth = i === 5 ? 0 : 10 + Math.random() * 10; // Mock growth calculation

        monthlyComparison.push({
          month: months[i],
          bookings: monthBookings.length,
          revenue: monthRevenue,
          growth: Math.round(growth * 10) / 10
        });
      }

      return {
        totalBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        averageFare: Math.round(averageFare * 100) / 100,
        bookingTrends,
        statusDistribution,
        topRoutes,
        peakHours,
        monthlyComparison
      };
    } catch (error) {
      console.error('Error in getBookingAnalytics:', error);
      throw new Error('Failed to get booking analytics');
    }
  }
} 