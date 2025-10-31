import { PrismaClient, UserRole, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedBookings() {
  console.log('📋 Seeding bookings...');
  
  const users = await prisma.user.findMany({
    where: { role: UserRole.USER }
  });
  
  const drivers = await prisma.driver.findMany();
  
  const routes = [
    { source: 'Gulshan-1, Dhaka', destination: 'Mirpur-10, Dhaka', sourceLat: 23.7803, sourceLng: 90.4168, destLat: 23.8260, destLng: 90.3800, distance: 10.5, fare: 525.0 },
    { source: 'Banani, Dhaka', destination: 'Uttara, Dhaka', sourceLat: 23.7936, sourceLng: 90.4068, destLat: 23.8747, destLng: 90.4006, distance: 15.0, fare: 750.0 },
    { source: 'Dhanmondi, Dhaka', destination: 'Shahbagh, Dhaka', sourceLat: 23.7465, sourceLng: 90.3760, destLat: 23.7372, destLng: 90.3949, distance: 5.0, fare: 250.0 },
    { source: 'Mohammadpur, Dhaka', destination: 'Farmgate, Dhaka', sourceLat: 23.7586, sourceLng: 90.3580, destLat: 23.7564, destLng: 90.3890, distance: 4.2, fare: 210.0 },
    { source: 'Bashundhara R/A, Dhaka', destination: 'Baridhara DOHS, Dhaka', sourceLat: 23.8151, sourceLng: 90.4480, destLat: 23.8085, destLng: 90.4218, distance: 6.8, fare: 340.0 },
    { source: 'Khilgaon, Dhaka', destination: 'Rampura, Dhaka', sourceLat: 23.7460, sourceLng: 90.4479, destLat: 23.7631, destLng: 90.4255, distance: 3.9, fare: 195.0 },
    { source: 'Gabtali, Dhaka', destination: 'Mirpur-1, Dhaka', sourceLat: 23.7743, sourceLng: 90.3448, destLat: 23.8046, destLng: 90.3650, distance: 6.5, fare: 325.0 },
    { source: 'Khilkhet, Dhaka', destination: 'Gulshan-2, Dhaka', sourceLat: 23.8284, sourceLng: 90.4259, destLat: 23.7916, destLng: 90.4145, distance: 7.2, fare: 360.0 },
  ];

  const bookings = [
    {
      userId: users[0].id,
      driverId: drivers[0].id,
      source: routes[0].source,
      destination: routes[0].destination,
      sourceLat: routes[0].sourceLat,
      sourceLng: routes[0].sourceLng,
      destLat: routes[0].destLat,
      destLng: routes[0].destLng,
      distance: routes[0].distance,
      fare: routes[0].fare,
      status: BookingStatus.COMPLETED,
      pickupTime: new Date('2024-01-15T10:00:00Z'),
      completedAt: new Date('2024-01-15T11:30:00Z')
    },
    {
      userId: users[1].id,
      driverId: drivers[1].id,
      source: routes[1].source,
      destination: routes[1].destination,
      sourceLat: routes[1].sourceLat,
      sourceLng: routes[1].sourceLng,
      destLat: routes[1].destLat,
      destLng: routes[1].destLng,
      distance: routes[1].distance,
      fare: routes[1].fare,
      status: BookingStatus.IN_PROGRESS,
      pickupTime: new Date('2024-01-16T09:00:00Z')
    },
    {
      userId: users[2].id,
      driverId: drivers[2].id,
      source: routes[2].source,
      destination: routes[2].destination,
      sourceLat: routes[2].sourceLat,
      sourceLng: routes[2].sourceLng,
      destLat: routes[2].destLat,
      destLng: routes[2].destLng,
      distance: routes[2].distance,
      fare: routes[2].fare,
      status: BookingStatus.CONFIRMED,
      pickupTime: new Date('2024-01-17T14:00:00Z')
    },
    {
      userId: users[3].id,
      driverId: drivers[3].id,
      source: routes[3].source,
      destination: routes[3].destination,
      sourceLat: routes[3].sourceLat,
      sourceLng: routes[3].sourceLng,
      destLat: routes[3].destLat,
      destLng: routes[3].destLng,
      distance: routes[3].distance,
      fare: routes[3].fare,
      status: BookingStatus.PENDING
    },
    {
      userId: users[4].id,
      driverId: drivers[4].id,
      source: routes[4].source,
      destination: routes[4].destination,
      sourceLat: routes[4].sourceLat,
      sourceLng: routes[4].sourceLng,
      destLat: routes[4].destLat,
      destLng: routes[4].destLng,
      distance: routes[4].distance,
      fare: routes[4].fare,
      status: BookingStatus.CANCELLED
    },
    {
      userId: users[0].id,
      driverId: drivers[5].id,
      source: routes[5].source,
      destination: routes[5].destination,
      sourceLat: routes[5].sourceLat,
      sourceLng: routes[5].sourceLng,
      destLat: routes[5].destLat,
      destLng: routes[5].destLng,
      distance: routes[5].distance,
      fare: routes[5].fare,
      status: BookingStatus.COMPLETED,
      pickupTime: new Date('2024-01-18T08:00:00Z'),
      completedAt: new Date('2024-01-18T09:15:00Z')
    },
    {
      userId: users[1].id,
      driverId: drivers[6].id,
      source: routes[6].source,
      destination: routes[6].destination,
      sourceLat: routes[6].sourceLat,
      sourceLng: routes[6].sourceLng,
      destLat: routes[6].destLat,
      destLng: routes[6].destLng,
      distance: routes[6].distance,
      fare: routes[6].fare,
      status: BookingStatus.IN_PROGRESS,
      pickupTime: new Date('2024-01-19T11:00:00Z')
    },
    {
      userId: users[2].id,
      driverId: drivers[7].id,
      source: routes[7].source,
      destination: routes[7].destination,
      sourceLat: routes[7].sourceLat,
      sourceLng: routes[7].sourceLng,
      destLat: routes[7].destLat,
      destLng: routes[7].destLng,
      distance: routes[7].distance,
      fare: routes[7].fare,
      status: BookingStatus.PENDING
    }
  ];

  for (const booking of bookings) {
    await prisma.booking.create({
      data: booking
    });
  }
  
  console.log(`✅ Seeded ${bookings.length} bookings`);
} 