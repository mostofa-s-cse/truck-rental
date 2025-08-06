import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const areaSeeder = async () => {
  console.log('🌍 Seeding areas...');

  const areas = [
    // Central Dhaka Areas
    { name: 'Gulshan-1', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Gulshan-2', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Banani', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Baridhara', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Uttara', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Dhanmondi', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Mohammadpur', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Mirpur-1', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Mirpur-2', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Mirpur-6', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Mirpur-10', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Mirpur-11', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Mirpur-12', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Pallabi', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Kafrul', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Sher-e-Bangla Nagar', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Tejgaon', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Tejgaon Industrial Area', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Rampura', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Badda', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Hatirjheel', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Bashundhara', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Niketan', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Nikunja-1', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Nikunja-2', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Khilkhet', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Airport', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Kakrail', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Shantinagar', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Malibagh', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Moghbazar', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Ramna', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Shahbagh', city: 'Dhaka', state: 'Dhaka' },
    { name: 'New Market', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Dhanmondi-27', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Dhanmondi-32', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Kalabagan', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Sukrabad', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Adabor', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Shyamoli', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Agargaon', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Taltola', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Kolabagan', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Wari', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Gandaria', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Jigatola', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Hazaribagh', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Kamrangirchar', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Lalbagh', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Chawkbazar', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Kotwali', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Sutrapur', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Demra', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Sabujbagh', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Shahjahanpur', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Uttarkhan', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Dakshinkhan', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Vatiara', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Tongi', city: 'Gazipur', state: 'Dhaka' },
    { name: 'Gazipur', city: 'Gazipur', state: 'Dhaka' },
    { name: 'Savar', city: 'Savar', state: 'Dhaka' },
    { name: 'Narayanganj', city: 'Narayanganj', state: 'Dhaka' },
    { name: 'Keraniganj', city: 'Keraniganj', state: 'Dhaka' },
    { name: 'Dohar', city: 'Dohar', state: 'Dhaka' },
    { name: 'Nawabganj', city: 'Nawabganj', state: 'Dhaka' },
    { name: 'Dhamrai', city: 'Dhamrai', state: 'Dhaka' },
    { name: 'Munshiganj', city: 'Munshiganj', state: 'Dhaka' },
    { name: 'Manikganj', city: 'Manikganj', state: 'Dhaka' },
    { name: 'Tangail', city: 'Tangail', state: 'Dhaka' },
    { name: 'Narsingdi', city: 'Narsingdi', state: 'Dhaka' },
    { name: 'Kishoreganj', city: 'Kishoreganj', state: 'Dhaka' },
    { name: 'Gopalganj', city: 'Gopalganj', state: 'Dhaka' },
    { name: 'Madaripur', city: 'Madaripur', state: 'Dhaka' },
    { name: 'Shariatpur', city: 'Shariatpur', state: 'Dhaka' },
    { name: 'Rajbari', city: 'Rajbari', state: 'Dhaka' },
    { name: 'Faridpur', city: 'Faridpur', state: 'Dhaka' },
  ];

  try {
    // Clear existing areas
    await prisma.area.deleteMany({});

    // Insert new areas
    const createdAreas = await prisma.area.createMany({
      data: areas,
      skipDuplicates: true
    });

    console.log(`✅ Created ${createdAreas.count} areas successfully`);
    return createdAreas;
  } catch (error) {
    console.error('❌ Error seeding areas:', error);
    throw error;
  }
}; 