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
    },
    // Additional 10 categories
    {
      name: 'Pickup – 0.75T, 8ft',
      truckType: 'PICKUP',
      capacity: 0.75,
      length: 8.0,
      baseFare: 900,
      insideDhakaRate: 35,
      outsideDhakaRate: 25,
      description: 'Light pickup ideal for small household items'
    },
    {
      name: 'Pickup – 3T, 14ft',
      truckType: 'PICKUP',
      capacity: 3.0,
      length: 14.0,
      baseFare: 2200,
      insideDhakaRate: 55,
      outsideDhakaRate: 45,
      description: 'Large pickup for heavy local transport'
    },
    {
      name: 'Mini Truck – 0.8T, 7ft',
      truckType: 'MINI_TRUCK',
      capacity: 0.8,
      length: 7.0,
      baseFare: 850,
      insideDhakaRate: 35,
      outsideDhakaRate: 25,
      description: 'Compact mini truck for quick city deliveries'
    },
    {
      name: 'Mini Truck – 1.2T, 8ft',
      truckType: 'MINI_TRUCK',
      capacity: 1.2,
      length: 8.0,
      baseFare: 1100,
      insideDhakaRate: 40,
      outsideDhakaRate: 30,
      description: 'Mini truck with extra capacity for bulkier items'
    },
    {
      name: 'Lorry – 5T, 16ft',
      truckType: 'LORRY',
      capacity: 5.0,
      length: 16.0,
      baseFare: 3200,
      insideDhakaRate: 120,
      outsideDhakaRate: 50,
      description: 'Lorry for medium-heavy cargo across the city'
    },
    {
      name: 'Lorry – 7T, 18ft',
      truckType: 'LORRY',
      capacity: 7.0,
      length: 18.0,
      baseFare: 3800,
      insideDhakaRate: 150,
      outsideDhakaRate: 55,
      description: 'High-capacity lorry for industrial goods'
    },
    {
      name: 'Truck – 12T, 22ft',
      truckType: 'TRUCK',
      capacity: 12.0,
      length: 22.0,
      baseFare: 6000,
      insideDhakaRate: 220,
      outsideDhakaRate: 65,
      description: 'Heavy-duty truck for large consignments'
    },
    {
      name: 'Truck – 15T, 24ft',
      truckType: 'TRUCK',
      capacity: 15.0,
      length: 24.0,
      baseFare: 7000,
      insideDhakaRate: 240,
      outsideDhakaRate: 70,
      description: 'Extra heavy-duty truck for maximum payloads'
    },
    {
      name: 'Truck (Covered) – 2T, 12ft',
      truckType: 'TRUCK',
      capacity: 2.0,
      length: 12.0,
      baseFare: 2100,
      insideDhakaRate: 60,
      outsideDhakaRate: 45,
      description: 'Covered truck for weather-sensitive goods'
    },
    {
      name: 'Truck (Refrigerated) – 2T, 12ft',
      truckType: 'TRUCK',
      capacity: 2.0,
      length: 12.0,
      baseFare: 2600,
      insideDhakaRate: 70,
      outsideDhakaRate: 50,
      description: 'Refrigerated truck for perishable items'
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