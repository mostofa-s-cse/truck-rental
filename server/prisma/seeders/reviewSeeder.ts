import { PrismaClient, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedReviews() {
  console.log('⭐ Seeding reviews...');
  
  const completedBookings = await prisma.booking.findMany({
    where: { status: BookingStatus.COMPLETED },
    include: { user: true, driver: true }
  });

  const reviews = [
    {
      userId: completedBookings[0].userId,
      driverId: completedBookings[0].driverId,
      bookingId: completedBookings[0].id,
      rating: 5,
      comment: 'Excellent service! Driver was very professional and punctual. Highly recommended!'
    },
    {
      userId: completedBookings[1].userId,
      driverId: completedBookings[1].driverId,
      bookingId: completedBookings[1].id,
      rating: 4,
      comment: 'Good service overall. Driver was friendly and the trip was smooth.'
    }
  ];

  for (const review of reviews) {
    await prisma.review.upsert({
      where: { bookingId: review.bookingId },
      update: review,
      create: review
    });
  }
  
  console.log(`✅ Seeded ${reviews.length} reviews`);
} 