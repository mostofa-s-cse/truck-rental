import { PrismaClient, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPayments() {
  console.log('💳 Seeding payments...');
  
  const completedBookings = await prisma.booking.findMany({
    where: { status: BookingStatus.COMPLETED }
  });

  const payments = [
    {
      bookingId: completedBookings[0].id,
      amount: completedBookings[0].fare,
      paymentMethod: 'CASH',
      transactionId: 'TXN-001',
      status: 'COMPLETED'
    },
    {
      bookingId: completedBookings[1].id,
      amount: completedBookings[1].fare,
      paymentMethod: 'CARD',
      transactionId: 'TXN-002',
      status: 'COMPLETED'
    }
  ];

  for (const payment of payments) {
    await prisma.payment.upsert({
      where: { bookingId: payment.bookingId },
      update: payment,
      create: payment
    });
  }
  
  console.log(`✅ Seeded ${payments.length} payments`);
} 