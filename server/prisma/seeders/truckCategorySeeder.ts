import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTruckCategories() {
  console.log('🚛 Seeding truck categories...');
  
  const categories = [
    {
      name: 'Mini Truck',
      basePrice: 40.0,
      description: 'Small trucks suitable for light loads up to 1 ton. Perfect for small moves, furniture transport, and local deliveries.',
      features: ['Up to 1 ton capacity', 'Fuel efficient', 'Easy parking', 'Suitable for narrow roads'],
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop'
    },
    {
      name: 'Pickup',
      basePrice: 50.0,
      description: 'Pickup trucks for medium loads up to 2 tons. Ideal for construction materials, appliances, and medium-sized moves.',
      features: ['Up to 2 ton capacity', 'Versatile', 'Good for construction', 'Easy loading/unloading'],
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop'
    },
    {
      name: 'Lorry',
      basePrice: 70.0,
      description: 'Large trucks for heavy loads up to 5 tons. Suitable for commercial transport, large moves, and bulk deliveries.',
      features: ['Up to 5 ton capacity', 'Commercial grade', 'Long distance', 'Heavy duty'],
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop'
    },
    {
      name: 'Truck',
      basePrice: 90.0,
      description: 'Heavy-duty trucks for very heavy loads up to 10 tons. Perfect for industrial transport and large-scale operations.',
      features: ['Up to 10 ton capacity', 'Industrial grade', 'Maximum capacity', 'Professional service'],
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop'
    },
    {
      name: 'Refrigerated Truck',
      basePrice: 120.0,
      description: 'Temperature-controlled trucks for perishable goods. Ideal for food transport, pharmaceuticals, and cold storage items.',
      features: ['Temperature controlled', 'Perishable goods', 'Food safe', 'Climate controlled'],
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop'
    },
    {
      name: 'Flatbed Truck',
      basePrice: 85.0,
      description: 'Open flatbed trucks for oversized loads. Perfect for construction equipment, machinery, and large items.',
      features: ['Oversized loads', 'Construction equipment', 'Easy loading', 'Versatile'],
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop'
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