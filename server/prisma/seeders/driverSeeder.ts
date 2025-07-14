import { PrismaClient, UserRole, TruckType, TruckQuality } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDrivers() {
  console.log('🚚 Seeding drivers...');
  
  const driverUsers = await prisma.user.findMany({
    where: { role: UserRole.DRIVER }
  });

  const locations = [
    { name: 'Dhaka Central, Dhaka', lat: 23.8103, lng: 90.4125 },
    { name: 'Dhaka North, Dhaka', lat: 23.7937, lng: 90.4066 },
    { name: 'Dhaka South, Dhaka', lat: 23.7099, lng: 90.4071 },
    { name: 'Gulshan, Dhaka', lat: 23.7937, lng: 90.4066 },
    { name: 'Banani, Dhaka', lat: 23.7937, lng: 90.4066 },
    { name: 'Dhanmondi, Dhaka', lat: 23.7465, lng: 90.3760 },
    { name: 'Mirpur, Dhaka', lat: 23.8103, lng: 90.3654 },
    { name: 'Uttara, Dhaka', lat: 23.8709, lng: 90.3835 },
    { name: 'Chittagong Port, Chittagong', lat: 22.3419, lng: 91.8132 },
    { name: 'Chittagong City, Chittagong', lat: 22.3419, lng: 91.8132 },
    { name: 'Sylhet City, Sylhet', lat: 24.8949, lng: 91.8687 },
    { name: 'Rajshahi City, Rajshahi', lat: 24.3745, lng: 88.6042 },
    { name: 'Khulna City, Khulna', lat: 22.8456, lng: 89.5403 },
    { name: 'Barisal City, Barisal', lat: 22.7010, lng: 90.3535 },
    { name: 'Rangpur City, Rangpur', lat: 25.7439, lng: 89.2752 }
  ];

  const drivers = [
    {
      userId: driverUsers[0].id,
      truckType: TruckType.MINI_TRUCK,
      capacity: 1.0,
      quality: TruckQuality.EXCELLENT,
      license: 'DL-123456789',
      registration: 'DHK-123456',
      documents: ['license.pdf', 'registration.pdf', 'insurance.pdf', 'fitness.pdf'],
      location: locations[0].name,
      latitude: locations[0].lat,
      longitude: locations[0].lng,
      isAvailable: true,
      isVerified: true,
      rating: 4.8,
      totalTrips: 45
    },
    {
      userId: driverUsers[1].id,
      truckType: TruckType.PICKUP,
      capacity: 2.0,
      quality: TruckQuality.GOOD,
      license: 'DL-987654321',
      registration: 'DHK-654321',
      documents: ['license.pdf', 'registration.pdf', 'insurance.pdf'],
      location: locations[1].name,
      latitude: locations[1].lat,
      longitude: locations[1].lng,
      isAvailable: true,
      isVerified: true,
      rating: 4.5,
      totalTrips: 32
    },
    {
      userId: driverUsers[2].id,
      truckType: TruckType.LORRY,
      capacity: 5.0,
      quality: TruckQuality.EXCELLENT,
      license: 'DL-456789123',
      registration: 'CTG-789123',
      documents: ['license.pdf', 'registration.pdf', 'insurance.pdf', 'fitness.pdf', 'route-permit.pdf'],
      location: locations[8].name,
      latitude: locations[8].lat,
      longitude: locations[8].lng,
      isAvailable: false,
      isVerified: true,
      rating: 4.9,
      totalTrips: 78
    },
    {
      userId: driverUsers[3].id,
      truckType: TruckType.TRUCK,
      capacity: 8.0,
      quality: TruckQuality.GOOD,
      license: 'DL-789123456',
      registration: 'SYL-456789',
      documents: ['license.pdf', 'registration.pdf'],
      location: locations[10].name,
      latitude: locations[10].lat,
      longitude: locations[10].lng,
      isAvailable: true,
      isVerified: false,
      rating: 4.2,
      totalTrips: 15
    },
    {
      userId: driverUsers[4].id,
      truckType: TruckType.PICKUP,
      capacity: 2.5,
      quality: TruckQuality.AVERAGE,
      license: 'DL-321654987',
      registration: 'DHK-987654',
      documents: ['license.pdf', 'registration.pdf'],
      location: locations[2].name,
      latitude: locations[2].lat,
      longitude: locations[2].lng,
      isAvailable: true,
      isVerified: true,
      rating: 4.0,
      totalTrips: 28
    },
    {
      userId: driverUsers[5].id,
      truckType: TruckType.MINI_TRUCK,
      capacity: 1.5,
      quality: TruckQuality.GOOD,
      license: 'DL-147258369',
      registration: 'DHK-147258',
      documents: ['license.pdf', 'registration.pdf', 'insurance.pdf'],
      location: locations[3].name,
      latitude: locations[3].lat,
      longitude: locations[3].lng,
      isAvailable: true,
      isVerified: true,
      rating: 4.6,
      totalTrips: 52
    },
    {
      userId: driverUsers[6].id,
      truckType: TruckType.LORRY,
      capacity: 4.0,
      quality: TruckQuality.EXCELLENT,
      license: 'DL-963852741',
      registration: 'CTG-963852',
      documents: ['license.pdf', 'registration.pdf', 'insurance.pdf', 'fitness.pdf'],
      location: locations[9].name,
      latitude: locations[9].lat,
      longitude: locations[9].lng,
      isAvailable: true,
      isVerified: true,
      rating: 4.7,
      totalTrips: 65
    },
    {
      userId: driverUsers[7].id,
      truckType: TruckType.TRUCK,
      capacity: 10.0,
      quality: TruckQuality.EXCELLENT,
      license: 'DL-852963741',
      registration: 'RAJ-852963',
      documents: ['license.pdf', 'registration.pdf', 'insurance.pdf', 'fitness.pdf', 'route-permit.pdf'],
      location: locations[11].name,
      latitude: locations[11].lat,
      longitude: locations[11].lng,
      isAvailable: false,
      isVerified: true,
      rating: 4.9,
      totalTrips: 89
    },
    {
      userId: driverUsers[8].id,
      truckType: TruckType.PICKUP,
      capacity: 2.0,
      quality: TruckQuality.AVERAGE,
      license: 'DL-741852963',
      registration: 'KHU-741852',
      documents: ['license.pdf', 'registration.pdf'],
      location: locations[12].name,
      latitude: locations[12].lat,
      longitude: locations[12].lng,
      isAvailable: true,
      isVerified: false,
      rating: 3.8,
      totalTrips: 12
    },
    {
      userId: driverUsers[9].id,
      truckType: TruckType.MINI_TRUCK,
      capacity: 1.0,
      quality: TruckQuality.GOOD,
      license: 'DL-369258147',
      registration: 'BAR-369258',
      documents: ['license.pdf', 'registration.pdf', 'insurance.pdf'],
      location: locations[13].name,
      latitude: locations[13].lat,
      longitude: locations[13].lng,
      isAvailable: true,
      isVerified: true,
      rating: 4.3,
      totalTrips: 38
    }
  ];

  for (const driver of drivers) {
    await prisma.driver.upsert({
      where: { userId: driver.userId },
      update: {
        truckType: driver.truckType,
        capacity: driver.capacity,
        quality: driver.quality,
        license: driver.license,
        registration: driver.registration,
        documents: driver.documents,
        location: driver.location,
        latitude: driver.latitude,
        longitude: driver.longitude,
        isAvailable: driver.isAvailable,
        isVerified: driver.isVerified,
        rating: driver.rating,
        totalTrips: driver.totalTrips
      },
      create: driver
    });
  }
  
  console.log(`✅ Seeded ${drivers.length} drivers`);
} 