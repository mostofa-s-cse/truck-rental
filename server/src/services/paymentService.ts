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

  static async getAllPayments(page = 1, limit = 10, status?: string, search?: string) {
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    let where: any = {};
    
    if (status) {
      where.status = status;
    }

    // For search, we'll fetch all payments and filter them in the application
    // This ensures we can search across all fields including nested relations
    const [allPayments, total] = await Promise.all([
      prisma.payment?.findMany({
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

    // Apply search filtering if search term is provided
    let filteredPayments = allPayments;
    let finalTotal = total;
    
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      
      filteredPayments = allPayments.filter(payment => {
        // Check payment ID
        const paymentId = payment.id.toLowerCase();
        
        // Check booking ID
        const bookingId = payment.bookingId.toLowerCase();
        
        // Check transaction ID
        const transactionId = payment.transactionId?.toLowerCase() || '';
        
        // Check user name and email
        const userName = payment.booking.user.name.toLowerCase();
        const userEmail = payment.booking.user.email.toLowerCase();
        
        // Check driver name and email (if driver exists)
        const driverName = payment.booking.driver?.user.name.toLowerCase() || '';
        const driverEmail = payment.booking.driver?.user.email.toLowerCase() || '';
        
        return paymentId.includes(searchTerm) || 
               bookingId.includes(searchTerm) || 
               transactionId.includes(searchTerm) ||
               userName.includes(searchTerm) || 
               userEmail.includes(searchTerm) || 
               driverName.includes(searchTerm) || 
               driverEmail.includes(searchTerm);
      });
      
      finalTotal = filteredPayments.length;
    }

    // Apply pagination to filtered results
    const paginatedPayments = filteredPayments.slice(skip, skip + limit);

    return {
      payments: paginatedPayments,
      total: finalTotal,
      page,
      limit,
      totalPages: Math.ceil(finalTotal / limit)
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