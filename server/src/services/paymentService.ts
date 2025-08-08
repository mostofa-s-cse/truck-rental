
import { PrismaClient } from '@prisma/client';
import { PaymentCreateInput, PaginationParams } from '../types';
const prisma = new PrismaClient();
import { AppError } from '../types';

type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export class PaymentService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Get all payments (admin)
  async getAllPayments(pagination: PaginationParams & { 
    status?: PaymentStatus; 
    search?: string; 
    method?: string; 
    dateFrom?: string; 
    dateTo?: string; 
  }) {
    const { page = 1, limit = 10, status, search, method, dateFrom, dateTo } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (method) {
      where.paymentMethod = method;
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        {
          booking: {
            user: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        },
        {
          bookingId: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          transactionId: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          booking: {
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
                      name: true
                    }
                  }
                },
                select: {
                  id: true,
                  truckType: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.payment.count({ where })
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get user payment history
  async getUserPaymentHistory(userId: string, pagination: PaginationParams & { 
    status?: PaymentStatus; 
    search?: string; 
  }) {
    const { page = 1, limit = 10, status, search } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      booking: {
        userId: userId
      }
    };
    
    if (status) {
      where.status = status;
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        {
          booking: {
            source: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          booking: {
            destination: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          booking: {
            driver: {
              user: {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          }
        },
        {
          transactionId: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          booking: {
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
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.payment.count({ where })
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get payment statistics (admin)
  async getPaymentStats() {
    const [
      totalPayments,
      totalAmount,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      methodStats
    ] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.aggregate({
        _sum: { amount: true }
      }),
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.count({ where: { status: 'FAILED' } }),
      this.prisma.payment.count({ where: { status: 'REFUNDED' } }),
      this.prisma.payment.groupBy({
        by: ['paymentMethod'],
        _count: { paymentMethod: true },
        _sum: { amount: true }
      })
    ]);

    const monthlyStats = await this.prisma.payment.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      _sum: { amount: true },
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    return {
      totalPayments,
      totalAmount: totalAmount._sum.amount || 0,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      methodStats,
      monthlyStats
    };
  }

  // Get payment by ID (admin)
  async getPaymentById(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
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
                    name: true
                  }
                }
              },
              select: {
                id: true,
                truckType: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return payment;
  }

  // Update payment status (admin)
  async updatePaymentStatus(id: string, status: PaymentStatus) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { booking: true }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    const updatedPayment = await this.prisma.$transaction(async (tx) => {
      const result = await tx.payment.update({
        where: { id },
        data: { status },
        include: {
          booking: {
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
                      name: true
                    }
                  }
                },
                select: {
                  id: true,
                  truckType: true
                }
              }
            }
          }
        }
      });

      // Update booking status based on payment status
      if (status === 'COMPLETED') {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' }
        });
      } else if (status === 'REFUNDED') {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CANCELLED' }
        });
      }

      return result;
    });

    return updatedPayment;
  }

  // Create payment (admin)
  async createPayment(paymentData: PaymentCreateInput) {
    // Check if booking exists
    const booking = await this.prisma.booking.findUnique({
      where: { id: paymentData.bookingId }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check if payment already exists for this booking
    const existingPayment = await this.prisma.payment.findFirst({
      where: { bookingId: paymentData.bookingId }
    });

    if (existingPayment) {
      throw new AppError('Payment already exists for this booking', 400);
    }

    const payment = await this.prisma.payment.create({
      data: {
        ...paymentData,
        status: paymentData.status || 'PENDING'
      },
      include: {
        booking: {
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
                    name: true
                  }
                }
              },
              select: {
                id: true,
                truckType: true
              }
            }
          }
        }
      }
    });

    return payment;
  }

  // Delete payment (admin)
  async deletePayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Check if payment is completed (should not be deleted)
    if (payment.status === 'COMPLETED') {
      throw new AppError('Cannot delete completed payment', 400);
    }

    await this.prisma.payment.delete({
      where: { id }
    });

    return {
      message: 'Payment deleted successfully'
    };
  }
} 