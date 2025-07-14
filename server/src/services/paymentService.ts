import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PaymentData {
  bookingId: string;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_BANKING';
  transactionId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}

export class PaymentService {
  static async createPayment(paymentData: PaymentData) {
    const { bookingId, amount, paymentMethod, transactionId, status } = paymentData;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if payment already exists for this booking
    const existingPayment = await prisma.payment?.findFirst({
      where: { bookingId }
    });

    if (existingPayment) {
      throw new Error('Payment already exists for this booking');
    }

    // Create payment record
    const payment = await prisma.payment?.create({
      data: {
        bookingId,
        amount,
        paymentMethod,
        transactionId,
        status
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
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return payment;
  }

  static async updatePaymentStatus(paymentId: string, status: string, transactionId?: string) {
    const payment = await prisma.payment?.update({
      where: { id: paymentId },
      data: {
        status,
        transactionId,
        updatedAt: new Date()
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
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return payment;
  }

  static async getPaymentByBookingId(bookingId: string) {
    const payment = await prisma.payment?.findFirst({
      where: { bookingId },
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
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return payment;
  }

  static async getPaymentById(paymentId: string) {
    const payment = await prisma.payment?.findUnique({
      where: { id: paymentId },
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
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  static async getAllPayments(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [payments, total] = await Promise.all([
      prisma.payment?.findMany({
        where,
        skip,
        take: limit,
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
                      name: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.payment?.count({ where })
    ]);

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getPaymentStats() {
    const [totalPayments, totalAmount, completedPayments, pendingPayments] = await Promise.all([
      prisma.payment?.count(),
      prisma.payment?.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.payment?.count({ where: { status: 'COMPLETED' } }),
      prisma.payment?.count({ where: { status: 'PENDING' } })
    ]);

    return {
      totalPayments,
      totalAmount: totalAmount?._sum.amount || 0,
      completedPayments,
      pendingPayments,
      failedPayments: totalPayments - completedPayments - pendingPayments
    };
  }

  static async processRefund(paymentId: string, reason: string) {
    const payment = await prisma.payment?.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new Error('Only completed payments can be refunded');
    }

    // Update payment status to refunded
    const updatedPayment = await prisma.payment?.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        refundReason: reason,
        refundedAt: new Date()
      }
    });

    return updatedPayment;
  }

  static async getPaymentHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment?.findMany({
        where: {
          booking: {
            userId
          }
        },
        skip,
        take: limit,
        include: {
          booking: {
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
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.payment?.count({
        where: {
          booking: {
            userId
          }
        }
      })
    ]);

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
} 