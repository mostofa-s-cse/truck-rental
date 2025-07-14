import { PrismaClient, UserRole, TruckType, TruckQuality, BookingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await clearDatabase();

  // Seed data in order of dependencies
  await seedSystemSettings();
  await seedTruckCategories();
  await seedAreas();
  await seedUsers();
  await seedDrivers();
  await seedBookings();
  await seedReviews();
  await seedMessages();
  await seedPayments();
  await seedTracking();
  await seedEmergencyAlerts();

  console.log('✅ Database seeding completed successfully!');
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  const tables = [
    'emergency_alerts',
    'tracking',
    'payments',
    'reviews',
    'messages',
    'bookings',
    'drivers',
    'users',
    'areas',
    'truck_categories',
    'system_settings'
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM ${table}`);
  }
}

async function seedSystemSettings() {
  console.log('⚙️ Seeding system settings...');
  
  const settings = [
    {
      key: 'base_fare_per_km',
      value: '50',
      type: 'number'
    },
    {
      key: 'minimum_fare',
      value: '100',
      type: 'number'
    },
    {
      key: 'max_distance_km',
      value: '500',
      type: 'number'
    },
    {
      key: 'driver_commission_percentage',
      value: '80',
      type: 'number'
    },
    {
      key: 'app_version',
      value: '1.0.0',
      type: 'string'
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean'
    },
    {
      key: 'support_email',
      value: 'support@truckbook.com',
      type: 'string'
    },
    {
      key: 'support_phone',
      value: '+880-1234-567890',
      type: 'string'
    }
  ];

  for (const setting of settings) {
    await prisma.systemSetting.create({
      data: setting
    });
  }
}

async function seedTruckCategories() {
  console.log('🚛 Seeding truck categories...');
  
  const categories = [
    {
      name: 'Mini Truck',
      basePrice: 40.0,
      description: 'Small trucks suitable for light loads up to 1 ton'
    },
    {
      name: 'Pickup',
      basePrice: 50.0,
      description: 'Pickup trucks for medium loads up to 2 tons'
    },
    {
      name: 'Lorry',
      basePrice: 70.0,
      description: 'Large trucks for heavy loads up to 5 tons'
    },
    {
      name: 'Truck',
      basePrice: 90.0,
      description: 'Heavy-duty trucks for very heavy loads up to 10 tons'
    }
  ];

  for (const category of categories) {
    await prisma.truckCategory.create({
      data: category
    });
  }
}

async function seedAreas() {
  console.log('📍 Seeding areas...');
  
  const areas = [
    { name: 'Dhaka Central', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Dhaka North', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Dhaka South', city: 'Dhaka', state: 'Dhaka' },
    { name: 'Chittagong Port', city: 'Chittagong', state: 'Chittagong' },
    { name: 'Chittagong City', city: 'Chittagong', state: 'Chittagong' },
    { name: 'Sylhet City', city: 'Sylhet', state: 'Sylhet' },
    { name: 'Rajshahi City', city: 'Rajshahi', state: 'Rajshahi' },
    { name: 'Khulna City', city: 'Khulna', state: 'Khulna' },
    { name: 'Barisal City', city: 'Barisal', state: 'Barisal' },
    { name: 'Rangpur City', city: 'Rangpur', state: 'Rangpur' }
  ];

  for (const area of areas) {
    await prisma.area.create({
      data: area
    });
  }
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = [
    // Admin users
    {
      email: 'admin@truckbook.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '+880-1111-111111',
      role: UserRole.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      email: 'admin2@truckbook.com',
      password: hashedPassword,
      name: 'System Admin',
      phone: '+880-1111-111112',
      role: UserRole.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    
    // Driver users
    {
      email: 'driver1@truckbook.com',
      password: hashedPassword,
      name: 'Ahmed Khan',
      phone: '+880-2222-222221',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    {
      email: 'driver2@truckbook.com',
      password: hashedPassword,
      name: 'Mohammed Ali',
      phone: '+880-2222-222222',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      email: 'driver3@truckbook.com',
      password: hashedPassword,
      name: 'Rahim Uddin',
      phone: '+880-2222-222223',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      email: 'driver4@truckbook.com',
      password: hashedPassword,
      name: 'Karim Hassan',
      phone: '+880-2222-222224',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    {
      email: 'driver5@truckbook.com',
      password: hashedPassword,
      name: 'Salam Mia',
      phone: '+880-2222-222225',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    
    // Regular users
    {
      email: 'user1@example.com',
      password: hashedPassword,
      name: 'Fatima Begum',
      phone: '+880-3333-333331',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      email: 'user2@example.com',
      password: hashedPassword,
      name: 'Aisha Rahman',
      phone: '+880-3333-333332',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      email: 'user3@example.com',
      password: hashedPassword,
      name: 'Zara Ahmed',
      phone: '+880-3333-333333',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    },
    {
      email: 'user4@example.com',
      password: hashedPassword,
      name: 'Nadia Islam',
      phone: '+880-3333-333334',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
    },
    {
      email: 'user5@example.com',
      password: hashedPassword,
      name: 'Sadia Khan',
      phone: '+880-3333-333335',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face'
    }
  ];

  for (const user of users) {
    await prisma.user.create({
      data: user
    });
  }
}

async function seedDrivers() {
  console.log('🚚 Seeding drivers...');
  
  const driverUsers = await prisma.user.findMany({
    where: { role: UserRole.DRIVER }
  });

  const truckTypes = [TruckType.MINI_TRUCK, TruckType.PICKUP, TruckType.LORRY, TruckType.TRUCK];
  const qualities = [TruckQuality.EXCELLENT, TruckQuality.GOOD, TruckQuality.AVERAGE];
  const locations = [
    'Dhaka Central, Dhaka',
    'Dhaka North, Dhaka', 
    'Dhaka South, Dhaka',
    'Chittagong Port, Chittagong',
    'Sylhet City, Sylhet'
  ];

  const drivers = [
    {
      userId: driverUsers[0].id,
      truckType: TruckType.MINI_TRUCK,
      capacity: 1.0,
      quality: TruckQuality.EXCELLENT,
      license: 'DL-123456789',
      registration: 'DHK-123456',
      documents: ['license.pdf', 'registration.pdf', 'insurance.pdf'],
      location: locations[0],
      latitude: 23.8103,
      longitude: 90.4125,
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
      documents: ['license.pdf', 'registration.pdf'],
      location: locations[1],
      latitude: 23.7937,
      longitude: 90.4066,
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
      documents: ['license.pdf', 'registration.pdf', 'insurance.pdf', 'fitness.pdf'],
      location: locations[3],
      latitude: 22.3419,
      longitude: 91.8132,
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
      location: locations[4],
      latitude: 24.8949,
      longitude: 91.8687,
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
      documents: ['license.pdf'],
      location: locations[2],
      latitude: 23.7099,
      longitude: 90.4071,
      isAvailable: true,
      isVerified: true,
      rating: 4.0,
      totalTrips: 28
    }
  ];

  for (const driver of drivers) {
    await prisma.driver.create({
      data: driver
    });
  }
}

async function seedBookings() {
  console.log('📋 Seeding bookings...');
  
  const users = await prisma.user.findMany({
    where: { role: UserRole.USER }
  });
  
  const drivers = await prisma.driver.findMany();
  
  const sources = [
    'Dhaka Central, Dhaka',
    'Dhaka North, Dhaka',
    'Chittagong Port, Chittagong',
    'Sylhet City, Sylhet',
    'Rajshahi City, Rajshahi'
  ];
  
  const destinations = [
    'Dhaka South, Dhaka',
    'Chittagong City, Chittagong',
    'Khulna City, Khulna',
    'Barisal City, Barisal',
    'Rangpur City, Rangpur'
  ];

  const statuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED, BookingStatus.CANCELLED];

  const bookings = [
    {
      userId: users[0].id,
      driverId: drivers[0].id,
      source: sources[0],
      destination: destinations[0],
      sourceLat: 23.8103,
      sourceLng: 90.4125,
      destLat: 23.7099,
      destLng: 90.4071,
      distance: 12.5,
      fare: 625.0,
      status: BookingStatus.COMPLETED,
      pickupTime: new Date('2024-01-15T10:00:00Z'),
      completedAt: new Date('2024-01-15T11:30:00Z')
    },
    {
      userId: users[1].id,
      driverId: drivers[1].id,
      source: sources[1],
      destination: destinations[1],
      sourceLat: 23.7937,
      sourceLng: 90.4066,
      destLat: 22.3419,
      destLng: 91.8132,
      distance: 250.0,
      fare: 12500.0,
      status: BookingStatus.IN_PROGRESS,
      pickupTime: new Date('2024-01-16T09:00:00Z')
    },
    {
      userId: users[2].id,
      driverId: drivers[2].id,
      source: sources[2],
      destination: destinations[2],
      sourceLat: 22.3419,
      sourceLng: 91.8132,
      destLat: 22.8456,
      destLng: 89.5403,
      distance: 180.0,
      fare: 12600.0,
      status: BookingStatus.CONFIRMED,
      pickupTime: new Date('2024-01-17T14:00:00Z')
    },
    {
      userId: users[3].id,
      driverId: drivers[3].id,
      source: sources[3],
      destination: destinations[3],
      sourceLat: 24.8949,
      sourceLng: 91.8687,
      destLat: 22.7010,
      destLng: 90.3535,
      distance: 320.0,
      fare: 28800.0,
      status: BookingStatus.PENDING
    },
    {
      userId: users[4].id,
      driverId: drivers[4].id,
      source: sources[4],
      destination: destinations[4],
      sourceLat: 24.3745,
      sourceLng: 88.6042,
      destLat: 25.7439,
      destLng: 89.2752,
      distance: 150.0,
      fare: 7500.0,
      status: BookingStatus.CANCELLED
    }
  ];

  for (const booking of bookings) {
    await prisma.booking.create({
      data: booking
    });
  }
}

async function seedReviews() {
  console.log('⭐ Seeding reviews...');
  
  const completedBookings = await prisma.booking.findMany({
    where: { status: BookingStatus.COMPLETED },
    include: { user: true, driver: true }
  });

  const reviews = [
    {
      userId: completedBookings[0].userId,
      driverId: completedBookings[0].driverId,
      bookingId: completedBookings[0].id,
      rating: 5,
      comment: 'Excellent service! Driver was very professional and punctual. Highly recommended!'
    }
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: review
    });
  }
}

async function seedMessages() {
  console.log('💬 Seeding messages...');
  
  const users = await prisma.user.findMany();
  
  const messages = [
    {
      senderId: users[0].id,
      receiverId: users[5].id, // driver
      content: 'Hi, are you available for a pickup tomorrow?',
      isRead: true
    },
    {
      senderId: users[5].id, // driver
      receiverId: users[0].id,
      content: 'Yes, I am available. What time and location?',
      isRead: true
    },
    {
      senderId: users[0].id,
      receiverId: users[5].id, // driver
      content: 'Around 10 AM from Dhaka Central. Is that okay?',
      isRead: false
    },
    {
      senderId: users[1].id,
      receiverId: users[6].id, // driver
      content: 'Hello, I need a truck for moving furniture. Are you free?',
      isRead: true
    },
    {
      senderId: users[6].id, // driver
      receiverId: users[1].id,
      content: 'Yes, I can help. What size truck do you need?',
      isRead: false
    }
  ];

  for (const message of messages) {
    await prisma.message.create({
      data: message
    });
  }
}

async function seedPayments() {
  console.log('💳 Seeding payments...');
  
  const completedBookings = await prisma.booking.findMany({
    where: { status: BookingStatus.COMPLETED }
  });

  const payments = [
    {
      bookingId: completedBookings[0].id,
      amount: completedBookings[0].fare,
      paymentMethod: 'CASH',
      transactionId: 'TXN-001',
      status: 'COMPLETED'
    }
  ];

  for (const payment of payments) {
    await prisma.payment.create({
      data: payment
    });
  }
}

async function seedTracking() {
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
    }
  ];

  for (const tracking of trackingData) {
    await prisma.tracking.create({
      data: tracking
    });
  }
}

async function seedEmergencyAlerts() {
  console.log('🚨 Seeding emergency alerts...');
  
  const users = await prisma.user.findMany({
    where: { role: UserRole.DRIVER }
  });
  
  const alerts = [
    {
      userId: users[0].id,
      type: 'BREAKDOWN',
      location: {
        latitude: 23.8103,
        longitude: 90.4125,
        address: 'Dhaka Central, Dhaka'
      },
      description: 'Engine overheating, need immediate assistance',
      severity: 'HIGH',
      status: 'PENDING',
      contactNumber: '+880-2222-222221'
    },
    {
      userId: users[1].id,
      type: 'ACCIDENT',
      location: {
        latitude: 23.7937,
        longitude: 90.4066,
        address: 'Dhaka North, Dhaka'
      },
      description: 'Minor collision with another vehicle, no injuries',
      severity: 'MEDIUM',
      status: 'ACKNOWLEDGED',
      contactNumber: '+880-2222-222222'
    }
  ];

  for (const alert of alerts) {
    await prisma.emergencyAlert.create({
      data: alert
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 