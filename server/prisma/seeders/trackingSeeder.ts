import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTracking() {
  console.log('📍 Seeding tracking data...');
  
  const drivers = await prisma.driver.findMany();
  
  const trackingData = [
    {
      driverId: drivers[0].id,
      latitude: 23.8103,
      longitude: 90.4125,
      accuracy: 10.0,
      speed: 25.0,
      heading: 180.0,
      address: 'Dhaka Central, Dhaka'
    },
    {
      driverId: drivers[1].id,
      latitude: 23.7937,
      longitude: 90.4066,
      accuracy: 15.0,
      speed: 0.0,
      heading: 0.0,
      address: 'Dhaka North, Dhaka'
    },
    {
      driverId: drivers[2].id,
      latitude: 22.3419,
      longitude: 91.8132,
      accuracy: 8.0,
      speed: 35.0,
      heading: 90.0,
      address: 'Chittagong Port, Chittagong'
    },
    {
      driverId: drivers[3].id,
      latitude: 24.8949,
      longitude: 91.8687,
      accuracy: 12.0,
      speed: 20.0,
      heading: 270.0,
      address: 'Sylhet City, Sylhet'
    },
    {
      driverId: drivers[4].id,
      latitude: 23.7099,
      longitude: 90.4071,
      accuracy: 5.0,
      speed: 15.0,
      heading: 45.0,
      address: 'Dhaka South, Dhaka'
    }
  ];

  for (const tracking of trackingData) {
    await prisma.tracking.create({
      data: tracking
    });
  }
  
  console.log(`✅ Seeded ${trackingData.length} tracking records`);
} 