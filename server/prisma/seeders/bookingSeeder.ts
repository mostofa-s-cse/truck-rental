import { PrismaClient, UserRole, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedBookings() {
  console.log('📋 Seeding bookings...');
  
  const users = await prisma.user.findMany({
    where: { role: UserRole.USER }
  });
  
  const drivers = await prisma.driver.findMany();
  
  const routes = [
    {
      source: 'Dhaka Central, Dhaka',
      destination: 'Dhaka South, Dhaka',
      sourceLat: 23.8103,
      sourceLng: 90.4125,
      destLat: 23.7099,
      destLng: 90.4071,
      distance: 12.5,
      fare: 625.0
    },
    {
      source: 'Dhaka North, Dhaka',
      destination: 'Chittagong City, Chittagong',
      sourceLat: 23.7937,
      sourceLng: 90.4066,
      destLat: 22.3419,
      destLng: 91.8132,
      distance: 250.0,
      fare: 12500.0
    },
    {
      source: 'Chittagong Port, Chittagong',
      destination: 'Khulna City, Khulna',
      sourceLat: 22.3419,
      sourceLng: 91.8132,
      destLat: 22.8456,
      destLng: 89.5403,
      distance: 180.0,
      fare: 9000.0
    },
    {
      source: 'Sylhet City, Sylhet',
      destination: 'Barisal City, Barisal',
      sourceLat: 24.8949,
      sourceLng: 91.8687,
      destLat: 22.7010,
      destLng: 90.3535,
      distance: 320.0,
      fare: 16000.0
    },
    {
      source: 'Rajshahi City, Rajshahi',
      destination: 'Rangpur City, Rangpur',
      sourceLat: 24.3745,
      sourceLng: 88.6042,
      destLat: 25.7439,
      destLng: 89.2752,
      distance: 150.0,
      fare: 7500.0
    },
    {
      source: 'Gulshan, Dhaka',
      destination: 'Mirpur, Dhaka',
      sourceLat: 23.7937,
      sourceLng: 90.4066,
      destLat: 23.8103,
      destLng: 90.3654,
      distance: 8.0,
      fare: 400.0
    },
    {
      source: 'Banani, Dhaka',
      destination: 'Uttara, Dhaka',
      sourceLat: 23.7937,
      sourceLng: 90.4066,
      destLat: 23.8709,
      destLng: 90.3835,
      distance: 15.0,
      fare: 750.0
    },
    {
      source: 'Dhanmondi, Dhaka',
      destination: 'Savar, Dhaka',
      sourceLat: 23.7465,
      sourceLng: 90.3760,
      destLat: 23.8500,
      destLng: 90.2600,
      distance: 25.0,
      fare: 1250.0
    }
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