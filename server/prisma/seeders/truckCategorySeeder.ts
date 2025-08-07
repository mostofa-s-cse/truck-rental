import { PrismaClient, TruckType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTruckCategories() {
  console.log('🚛 Seeding truck categories...');
  
  const categories = [
    {
      name: 'Pickup – 1T, 7ft',
      truckType: 'PICKUP',
      capacity: 1.0,
      length: 7.0,
      baseFare: 1000,
      insideDhakaRate: 40,
      outsideDhakaRate: 30,
      description: 'Small pickup truck suitable for local deliveries and small moves'
    },
    {
      name: 'Pickup – 1.5T, 9ft',
      truckType: 'PICKUP',
      capacity: 1.5,
      length: 9.0,
      baseFare: 1500,
      insideDhakaRate: 40,
      outsideDhakaRate: 35,
      description: 'Medium pickup truck for construction materials and appliances'
    },
    {
      name: 'Pickup – 2-3T, 12ft',
      truckType: 'PICKUP',
      capacity: 2.5,
      length: 12.0,
      baseFare: 2000,
      insideDhakaRate: 50,
      outsideDhakaRate: 40,
      description: 'Large pickup truck for commercial transport'
    },
    {
      name: 'Truck – 4-5T, 14ft',
      truckType: 'TRUCK',
      capacity: 4.5,
      length: 14.0,
      baseFare: 3000,
      insideDhakaRate: 100,
      outsideDhakaRate: 45,
      description: 'Medium truck for heavy commercial transport'
    },
    {
      name: 'Truck – 6-7T, 17ft',
      truckType: 'TRUCK',
      capacity: 6.5,
      length: 17.0,
      baseFare: 4000,
      insideDhakaRate: 200,
      outsideDhakaRate: 55,
      description: 'Large truck for industrial transport'
    },
    {
      name: 'Truck – 8-10T, 20ft',
      truckType: 'TRUCK',
      capacity: 9.0,
      length: 20.0,
      baseFare: 5000,
      insideDhakaRate: 200,
      outsideDhakaRate: 60,
      description: 'Heavy-duty truck for maximum capacity transport'
    },
    {
      name: 'Mini Truck – 0.5T, 6ft',
      truckType: 'MINI_TRUCK',
      capacity: 0.5,
      length: 6.0,
      baseFare: 800,
      insideDhakaRate: 35,
      outsideDhakaRate: 25,
      description: 'Very small truck for light deliveries'
    },
    {
      name: 'Lorry – 3-4T, 13ft',
      truckType: 'LORRY',
      capacity: 3.5,
      length: 13.0,
      baseFare: 2500,
      insideDhakaRate: 80,
      outsideDhakaRate: 40,
      description: 'Standard lorry for medium to heavy loads'
    }
  ];

  for (const category of categories) {
    await prisma.truckCategory.upsert({
      where: { name: category.name },
      update: {
        truckType: category.truckType as TruckType,
        capacity: category.capacity,
        length: category.length,
        baseFare: category.baseFare,
        insideDhakaRate: category.insideDhakaRate,
        outsideDhakaRate: category.outsideDhakaRate,
        description: category.description
      },
      create: {
        name: category.name,
        truckType: category.truckType as TruckType,
        capacity: category.capacity,
        length: category.length,
        baseFare: category.baseFare,
        insideDhakaRate: category.insideDhakaRate,
        outsideDhakaRate: category.outsideDhakaRate,
        description: category.description
      }
    });
  }
  
  console.log(`✅ Seeded ${categories.length} truck categories`);
} 