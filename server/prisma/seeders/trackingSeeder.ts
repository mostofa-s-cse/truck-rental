import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTracking() {
  console.log('📍 Seeding tracking data...');
  
  const drivers = await prisma.driver.findMany();
  
  const trackingData = [
    {
      driverId: drivers[0].id,
      latitude: 23.7803,
      longitude: 90.4168,
      accuracy: 10.0,
      speed: 25.0,
      heading: 180.0,
      address: 'Gulshan-1, Dhaka'
    },
    {
      driverId: drivers[1].id,
      latitude: 23.8260,
      longitude: 90.3800,
      accuracy: 15.0,
      speed: 0.0,
      heading: 0.0,
      address: 'Mirpur-10, Dhaka'
    },
    {
      driverId: drivers[2].id,
      latitude: 23.8151,
      longitude: 90.4480,
      accuracy: 8.0,
      speed: 35.0,
      heading: 90.0,
      address: 'Bashundhara R/A, Dhaka'
    },
    {
      driverId: drivers[3].id,
      latitude: 23.7564,
      longitude: 90.3890,
      accuracy: 12.0,
      speed: 20.0,
      heading: 270.0,
      address: 'Farmgate, Dhaka'
    },
    {
      driverId: drivers[4].id,
      latitude: 23.7631,
      longitude: 90.4255,
      accuracy: 5.0,
      speed: 15.0,
      heading: 45.0,
      address: 'Rampura, Dhaka'
    }
  ];

  for (const tracking of trackingData) {
    await prisma.tracking.create({
      data: tracking
    });
  }
  
  console.log(`✅ Seeded ${trackingData.length} tracking records`);
} 