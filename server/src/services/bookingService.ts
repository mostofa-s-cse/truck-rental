import { PrismaClient, BookingStatus } from '@prisma/client';
import { CreateBookingRequest, UpdateBookingRequest } from '../types';

const prisma = new PrismaClient();

export class BookingService {
  static async createBooking(userId: string, bookingData: CreateBookingRequest) {
    const { driverId, ...rest } = bookingData;

    // Check if driver exists and is available
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    });

    if (!driver) {
      throw new Error('Driver not found');
    }

    if (!driver.isAvailable) {
      throw new Error('Driver is not available');
    }

    if (!driver.isVerified) {
      throw new Error('Driver is not verified');
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        driverId,
        ...rest
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        driver: {
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
        }
      }
    });

    return booking;
  }

  static async updateBooking(bookingId: string, updateData: UpdateBookingRequest) {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        driver: {
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
        }
      }
    });

    // If booking is completed, update driver's total trips
    if (updateData.status === BookingStatus.COMPLETED) {
      await prisma.driver.update({
        where: { id: booking.driverId },
        data: {
          totalTrips: {
            increment: 1
          }
        }
      });
    }

    return booking;
  }

  static async getBooking(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        driver: {
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
        },
        review: {
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
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  static async getUserBookings(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId },
        skip,
        take: limit,
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
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.booking.count({
        where: { userId }
      })
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getDriverBookings(driverId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { driverId },
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
          review: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.booking.count({
        where: { driverId }
      })
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getAllBookings(page = 1, limit = 10, status?: BookingStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
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
          },
          driver: {
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
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.booking.count({ where })
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async cancelBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('Unauthorized to cancel this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new Error('Cannot cancel booking that is not pending');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        driver: {
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
        }
      }
    });

    return updatedBooking;
  }
} 