import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedAreas() {
  console.log('📍 Seeding areas...');
  
  const areas = [
    // Dhaka Division
    { name: 'Dhaka Central', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Dhaka North', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Dhaka South', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Gulshan', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Banani', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Dhanmondi', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Mirpur', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Uttara', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Mohammadpur', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Lalbagh', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Old Dhaka', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Tongi', city: 'Gazipur', state: 'Dhaka', isActive: true },
    { name: 'Gazipur City', city: 'Gazipur', state: 'Dhaka', isActive: true },
    { name: 'Narayanganj', city: 'Narayanganj', state: 'Dhaka', isActive: true },
    { name: 'Savar', city: 'Dhaka', state: 'Dhaka', isActive: true },
    
    // Chittagong Division
    { name: 'Chittagong Port', city: 'Chittagong', state: 'Chittagong', isActive: true },
    { name: 'Chittagong City', city: 'Chittagong', state: 'Chittagong', isActive: true },
    { name: 'Agrabad', city: 'Chittagong', state: 'Chittagong', isActive: true },
    { name: 'Nasirabad', city: 'Chittagong', state: 'Chittagong', isActive: true },
    { name: 'Halishahar', city: 'Chittagong', state: 'Chittagong', isActive: true },
    { name: 'Patenga', city: 'Chittagong', state: 'Chittagong', isActive: true },
    { name: 'Cox\'s Bazar', city: 'Cox\'s Bazar', state: 'Chittagong', isActive: true },
    { name: 'Comilla', city: 'Comilla', state: 'Chittagong', isActive: true },
    { name: 'Feni', city: 'Feni', state: 'Chittagong', isActive: true },
    { name: 'Chandpur', city: 'Chandpur', state: 'Chittagong', isActive: true },
    
    // Sylhet Division
    { name: 'Sylhet City', city: 'Sylhet', state: 'Sylhet', isActive: true },
    { name: 'Sylhet Airport', city: 'Sylhet', state: 'Sylhet', isActive: true },
    { name: 'Zindabazar', city: 'Sylhet', state: 'Sylhet', isActive: true },
    { name: 'Sunamganj', city: 'Sunamganj', state: 'Sylhet', isActive: true },
    { name: 'Habiganj', city: 'Habiganj', state: 'Sylhet', isActive: true },
    { name: 'Moulvibazar', city: 'Moulvibazar', state: 'Sylhet', isActive: true },
    
    // Rajshahi Division
    { name: 'Rajshahi City', city: 'Rajshahi', state: 'Rajshahi', isActive: true },
    { name: 'Rajshahi University', city: 'Rajshahi', state: 'Rajshahi', isActive: true },
    { name: 'Bogra', city: 'Bogra', state: 'Rajshahi', isActive: true },
    { name: 'Pabna', city: 'Pabna', state: 'Rajshahi', isActive: true },
    { name: 'Sirajganj', city: 'Sirajganj', state: 'Rajshahi', isActive: true },
    { name: 'Natore', city: 'Natore', state: 'Rajshahi', isActive: true },
    { name: 'Naogaon', city: 'Naogaon', state: 'Rajshahi', isActive: true },
    { name: 'Chapainawabganj', city: 'Chapainawabganj', state: 'Rajshahi', isActive: true },
    
    // Khulna Division
    { name: 'Khulna City', city: 'Khulna', state: 'Khulna', isActive: true },
    { name: 'Khulna Port', city: 'Khulna', state: 'Khulna', isActive: true },
    { name: 'Jessore', city: 'Jessore', state: 'Khulna', isActive: true },
    { name: 'Satkhira', city: 'Satkhira', state: 'Khulna', isActive: true },
    { name: 'Bagerhat', city: 'Bagerhat', state: 'Khulna', isActive: true },
    { name: 'Kushtia', city: 'Kushtia', state: 'Khulna', isActive: true },
    { name: 'Magura', city: 'Magura', state: 'Khulna', isActive: true },
    { name: 'Jhenaidah', city: 'Jhenaidah', state: 'Khulna', isActive: true },
    { name: 'Narail', city: 'Narail', state: 'Khulna', isActive: true },
    { name: 'Chuadanga', city: 'Chuadanga', state: 'Khulna', isActive: true },
    { name: 'Meherpur', city: 'Meherpur', state: 'Khulna', isActive: true },
    
    // Barisal Division
    { name: 'Barisal City', city: 'Barisal', state: 'Barisal', isActive: true },
    { name: 'Barisal Port', city: 'Barisal', state: 'Barisal', isActive: true },
    { name: 'Pirojpur', city: 'Pirojpur', state: 'Barisal', isActive: true },
    { name: 'Patuakhali', city: 'Patuakhali', state: 'Barisal', isActive: true },
    { name: 'Bhola', city: 'Bhola', state: 'Barisal', isActive: true },
    { name: 'Barguna', city: 'Barguna', state: 'Barisal', isActive: true },
    { name: 'Jhalokati', city: 'Jhalokati', state: 'Barisal', isActive: true },
    
    // Rangpur Division
    { name: 'Rangpur City', city: 'Rangpur', state: 'Rangpur', isActive: true },
    { name: 'Dinajpur', city: 'Dinajpur', state: 'Rangpur', isActive: true },
    { name: 'Kurigram', city: 'Kurigram', state: 'Rangpur', isActive: true },
    { name: 'Gaibandha', city: 'Gaibandha', state: 'Rangpur', isActive: true },
    { name: 'Nilphamari', city: 'Nilphamari', state: 'Rangpur', isActive: true },
    { name: 'Panchagarh', city: 'Panchagarh', state: 'Rangpur', isActive: true },
    { name: 'Thakurgaon', city: 'Thakurgaon', state: 'Rangpur', isActive: true },
    { name: 'Lalmonirhat', city: 'Lalmonirhat', state: 'Rangpur', isActive: true },
    
    // Mymensingh Division
    { name: 'Mymensingh City', city: 'Mymensingh', state: 'Mymensingh', isActive: true },
    { name: 'Jamalpur', city: 'Jamalpur', state: 'Mymensingh', isActive: true },
    { name: 'Netrokona', city: 'Netrokona', state: 'Mymensingh', isActive: true },
    { name: 'Sherpur', city: 'Sherpur', state: 'Mymensingh', isActive: true },
    
    // Major Industrial Areas
    { name: 'Tongi Industrial Area', city: 'Gazipur', state: 'Dhaka', isActive: true },
    { name: 'Savar Industrial Area', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Narayanganj Industrial Area', city: 'Narayanganj', state: 'Dhaka', isActive: true },
    { name: 'Chittagong Export Processing Zone', city: 'Chittagong', state: 'Chittagong', isActive: true },
    { name: 'Sylhet Industrial Area', city: 'Sylhet', state: 'Sylhet', isActive: true },
    
    // Airports and Ports
    { name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', state: 'Dhaka', isActive: true },
    { name: 'Shah Amanat International Airport', city: 'Chittagong', state: 'Chittagong', isActive: true },
    { name: 'Osmani International Airport', city: 'Sylhet', state: 'Sylhet', isActive: true },
    { name: 'Chittagong Port', city: 'Chittagong', state: 'Chittagong', isActive: true },
    { name: 'Mongla Port', city: 'Bagerhat', state: 'Khulna', isActive: true },
    { name: 'Patuakhali Port', city: 'Patuakhali', state: 'Barisal', isActive: true }
  ];

  for (const area of areas) {
    await prisma.area.upsert({
      where: { name: area.name },
      update: {
        city: area.city,
        state: area.state,
        isActive: area.isActive
      },
      create: area
    });
  }
  
  console.log(`✅ Seeded ${areas.length} areas`);
} 