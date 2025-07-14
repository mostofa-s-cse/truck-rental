import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReviewService {
  static async createReview(reviewData: {
    userId: string;
    driverId: string;
    bookingId: string;
    rating: number;
    comment?: string;
  }) {
    const { userId, driverId, bookingId, rating, comment } = reviewData;

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('Unauthorized to review this booking');
    }

    if (booking.status !== 'COMPLETED') {
      throw new Error('Can only review completed bookings');
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId }
    });

    if (existingReview) {
      throw new Error('Review already exists for this booking');
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        driverId,
        bookingId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
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
    });

    // Update driver's average rating
    await this.updateDriverRating(driverId);

    return review;
  }

  static async updateDriverRating(driverId: string) {
    const reviews = await prisma.review.findMany({
      where: { driverId },
      select: { rating: true }
    });

    if (reviews.length > 0) {
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      await prisma.driver.update({
        where: { id: driverId },
        data: { rating: averageRating }
      });
    }
  }

  static async getDriverReviews(driverId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { driverId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          booking: {
            select: {
              id: true,
              source: true,
              destination: true,
              fare: true,
              completedAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.review.count({
        where: { driverId }
      })
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getUserReviews(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
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
                  avatar: true
                }
              }
            }
          },
          booking: {
            select: {
              id: true,
              source: true,
              destination: true,
              fare: true,
              completedAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.review.count({
        where: { userId }
      })
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getAllReviews(page = 1, limit = 10, rating?: number) {
    const skip = (page - 1) * limit;
    const where = rating ? { rating } : {};

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
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
          },
          booking: {
            select: {
              id: true,
              source: true,
              destination: true,
              fare: true,
              completedAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.review.count({ where })
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getReviewById(reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
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
        },
        booking: {
          select: {
            id: true,
            source: true,
            destination: true,
            fare: true,
            completedAt: true
          }
        }
      }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    return review;
  }

  static async updateReview(reviewId: string, userId: string, updateData: { rating?: number; comment?: string }) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId !== userId) {
      throw new Error('Unauthorized to update this review');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
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
    });

    // Update driver's average rating
    await this.updateDriverRating(review.driverId);

    return updatedReview;
  }

  static async deleteReview(reviewId: string, userId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId !== userId) {
      throw new Error('Unauthorized to delete this review');
    }

    await prisma.review.delete({
      where: { id: reviewId }
    });

    // Update driver's average rating
    await this.updateDriverRating(review.driverId);

    return { message: 'Review deleted successfully' };
  }

  static async getReviewStats() {
    const [totalReviews, averageRating, ratingDistribution] = await Promise.all([
      prisma.review.count(),
      prisma.review.aggregate({
        _avg: {
          rating: true
        }
      }),
      prisma.review.groupBy({
        by: ['rating'],
        _count: {
          rating: true
        }
      })
    ]);

    return {
      totalReviews,
      averageRating: averageRating._avg.rating || 0,
      ratingDistribution
    };
  }
} 