import { PrismaClient, BookingStatus } from '@prisma/client';

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
        review: true // <-- Fix: include review relation
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

    // Calculate today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = driverBookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= today;
    });
    const todayEarnings = todayBookings.reduce((sum, booking) => sum + booking.fare, 0);

    // Get active bookings
    const activeBookings = driverBookings.filter(booking => 
      booking.status === BookingStatus.IN_PROGRESS || booking.status === BookingStatus.CONFIRMED
    ).length;

    // Get rating from reviews
    const reviews = await prisma.review.findMany({
      where: { driverId: driver.id }
    });
    const rating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : driver.rating;

    // Mock online hours (in a real app, this would track actual online time)
    const onlineHours = 8.5;

    // Get recent bookings (last 5)
    const recentBookings = driverBookings.slice(0, 5);

    // Generate earnings data (last 7 days)
    const earningsData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const dayBookings = driverBookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        const currentDate = new Date();
        const dayDiff = Math.floor((currentDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
        return dayDiff === i;
      });
      const dayAmount = dayBookings.reduce((sum, booking) => sum + booking.fare, 0);
      earningsData.push({ day: days[i], amount: dayAmount });
    }

    // Generate rating data
    const ratingData = [
      { rating: 5, count: reviews.filter(r => r.rating === 5).length },
      { rating: 4, count: reviews.filter(r => r.rating === 4).length },
      { rating: 3, count: reviews.filter(r => r.rating === 3).length },
      { rating: 2, count: reviews.filter(r => r.rating === 2).length },
      { rating: 1, count: reviews.filter(r => r.rating === 1).length }
    ];

    return {
      todayEarnings,
      activeBookings,
      rating,
      onlineHours,
      recentBookings,
      earningsData,
      ratingData
    };
  }
} 