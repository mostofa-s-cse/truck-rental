import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTruckCategories() {
  console.log('🚛 Seeding truck categories...');
  
  const categories = [
    {
      name: 'MINI_TRUCK',
      basePrice: 40.0,
      description: 'Small trucks suitable for light loads up to 1 ton. Perfect for small moves, furniture transport, and local deliveries.'
    },
    {
      name: 'PICKUP',
      basePrice: 50.0,
      description: 'Pickup trucks for medium loads up to 2 tons. Ideal for construction materials, appliances, and medium-sized moves.'
    },
    {
      name: 'LORRY',
      basePrice: 70.0,
      description: 'Large trucks for heavy loads up to 5 tons. Suitable for commercial transport, large moves, and bulk deliveries.'
    },
    {
      name: 'TRUCK',
      basePrice: 90.0,
      description: 'Heavy-duty trucks for very heavy loads up to 10 tons. Perfect for industrial transport and large-scale operations.'
    }
  ];

  for (const category of categories) {
    await prisma.truckCategory.upsert({
      where: { name: category.name },
      update: {
        basePrice: category.basePrice,
        description: category.description
      },
      create: {
        name: category.name,
        basePrice: category.basePrice,
        description: category.description
      }
    });
  }
  
  console.log(`✅ Seeded ${categories.length} truck categories`);
} 