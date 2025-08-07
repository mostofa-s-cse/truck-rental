import { PrismaClient, BookingStatus } from '@prisma/client';
import { CreateBookingRequest, UpdateBookingRequest } from '../types';

const prisma = new PrismaClient();

export class BookingService {
  static async createBooking(userId: string, bookingData: CreateBookingRequest) {
    const { driverId, ...rest } = bookingData;

    console.log('BookingService - Creating booking:', {
      userId,
      driverId,
      bookingData: rest
    });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      console.error('BookingService - User not found:', userId);
      throw new Error(`User not found with ID: ${userId}`);
    }

    console.log('BookingService - User found:', user);

    // Check if driver exists and is available
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    });

    if (!driver) {
      console.error('BookingService - Driver not found:', driverId);
      throw new Error('Driver not found');
    }

    console.log('BookingService - Driver found:', driver);

    if (!driver.isAvailable) {
      throw new Error('Driver is not available');
    }

    if (!driver.isVerified) {
      throw new Error('Driver is not verified');
    }

    // Create booking with payment record
    const booking = await prisma.booking.create({
      data: {
        userId,
        driverId,
        ...rest,
        payment: {
          create: {
            amount: rest.fare,
            paymentMethod: 'PENDING',
            status: 'PENDING'
          }
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
        payment: true
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

  static async getAllBookings(page = 1, limit = 10, status?: BookingStatus, search?: string) {
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    let where: any = {};
    
    if (status) {
      where.status = status;
    }

    // For search, we'll fetch all bookings and filter them in the application
    // This ensures we can search across all fields including nested relations
    const [allBookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
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

    // Apply search filtering if search term is provided
    let filteredBookings = allBookings;
    let finalTotal = total;
    
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      
      filteredBookings = allBookings.filter(booking => {
        // Check booking ID
        const bookingId = booking.id.toLowerCase();
        
        // Check user name and email
        const userName = booking.user.name.toLowerCase();
        const userEmail = booking.user.email.toLowerCase();
        
        // Check driver name and email (if driver exists)
        const driverName = booking.driver?.user.name.toLowerCase() || '';
        const driverEmail = booking.driver?.user.email.toLowerCase() || '';
        
        // Check source and destination
        const source = booking.source.toLowerCase();
        const destination = booking.destination.toLowerCase();
        
        return bookingId.includes(searchTerm) || 
               userName.includes(searchTerm) || 
               userEmail.includes(searchTerm) || 
               driverName.includes(searchTerm) || 
               driverEmail.includes(searchTerm) ||
               source.includes(searchTerm) || 
               destination.includes(searchTerm);
      });
      
      finalTotal = filteredBookings.length;
    }

    // Apply pagination to filtered results
    const paginatedBookings = filteredBookings.slice(skip, skip + limit);

    return {
      bookings: paginatedBookings,
      total: finalTotal,
      page,
      limit,
      totalPages: Math.ceil(finalTotal / limit)
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