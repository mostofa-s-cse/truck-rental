import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedUsers() {
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
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'admin2@truckbook.com',
      password: hashedPassword,
      name: 'System Admin',
      phone: '+880-1111-111112',
      role: UserRole.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'superadmin@truckbook.com',
      password: hashedPassword,
      name: 'Super Administrator',
      phone: '+880-1111-111113',
      role: UserRole.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    
    // Driver users
    {
      email: 'driver1@truckbook.com',
      password: hashedPassword,
      name: 'Ahmed Khan',
      phone: '+880-2222-222221',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver2@truckbook.com',
      password: hashedPassword,
      name: 'Mohammed Ali',
      phone: '+880-2222-222222',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver3@truckbook.com',
      password: hashedPassword,
      name: 'Rahim Uddin',
      phone: '+880-2222-222223',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver4@truckbook.com',
      password: hashedPassword,
      name: 'Karim Hassan',
      phone: '+880-2222-222224',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver5@truckbook.com',
      password: hashedPassword,
      name: 'Salam Mia',
      phone: '+880-2222-222225',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver6@truckbook.com',
      password: hashedPassword,
      name: 'Abdul Rahman',
      phone: '+880-2222-222226',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver7@truckbook.com',
      password: hashedPassword,
      name: 'Nurul Islam',
      phone: '+880-2222-222227',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver8@truckbook.com',
      password: hashedPassword,
      name: 'Shahid Ullah',
      phone: '+880-2222-222228',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver9@truckbook.com',
      password: hashedPassword,
      name: 'Mizanur Rahman',
      phone: '+880-2222-222229',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver10@truckbook.com',
      password: hashedPassword,
      name: 'Fazal Karim',
      phone: '+880-2222-222230',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    // Additional driver users
    {
      email: 'driver11@truckbook.com',
      password: hashedPassword,
      name: 'Imtiaz Ahmed',
      phone: '+880-2222-222231',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver12@truckbook.com',
      password: hashedPassword,
      name: 'Shafiq Hasan',
      phone: '+880-2222-222232',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver13@truckbook.com',
      password: hashedPassword,
      name: 'Rafiul Islam',
      phone: '+880-2222-222233',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver14@truckbook.com',
      password: hashedPassword,
      name: 'Jubayer Khan',
      phone: '+880-2222-222234',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver15@truckbook.com',
      password: hashedPassword,
      name: 'Tareq Rahman',
      phone: '+880-2222-222235',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver16@truckbook.com',
      password: hashedPassword,
      name: 'Nizam Uddin',
      phone: '+880-2222-222236',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver17@truckbook.com',
      password: hashedPassword,
      name: 'Shahriar Alam',
      phone: '+880-2222-222237',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver18@truckbook.com',
      password: hashedPassword,
      name: 'Zubair Hossain',
      phone: '+880-2222-222238',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver19@truckbook.com',
      password: hashedPassword,
      name: 'Hasan Mahmud',
      phone: '+880-2222-222239',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'driver20@truckbook.com',
      password: hashedPassword,
      name: 'Sajid Ahmed',
      phone: '+880-2222-222240',
      role: UserRole.DRIVER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    
    // Regular users
    {
      email: 'user1@example.com',
      password: hashedPassword,
      name: 'Arif Hossain',
      phone: '+880-3333-333331',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user2@example.com',
      password: hashedPassword,
      name: 'Mahfuz Ahmed',
      phone: '+880-3333-333332',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user3@example.com',
      password: hashedPassword,
      name: 'Shahriar Kabir',
      phone: '+880-3333-333333',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user4@example.com',
      password: hashedPassword,
      name: 'Naeem Islam',
      phone: '+880-3333-333334',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user5@example.com',
      password: hashedPassword,
      name: 'Sajid Khan',
      phone: '+880-3333-333335',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user6@example.com',
      password: hashedPassword,
      name: 'Rezaul Karim',
      phone: '+880-3333-333336',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user7@example.com',
      password: hashedPassword,
      name: 'Tareq Aziz',
      phone: '+880-3333-333337',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user8@example.com',
      password: hashedPassword,
      name: 'Mahmud Hasan',
      phone: '+880-3333-333338',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user9@example.com',
      password: hashedPassword,
      name: 'Sabbir Rahman',
      phone: '+880-3333-333339',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user10@example.com',
      password: hashedPassword,
      name: 'Kamal Hossain',
      phone: '+880-3333-333340',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user11@example.com',
      password: hashedPassword,
      name: 'Nasir Uddin',
      phone: '+880-3333-333341',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user12@example.com',
      password: hashedPassword,
      name: 'Imran Khan',
      phone: '+880-3333-333342',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user13@example.com',
      password: hashedPassword,
      name: 'Farhan Ahmed',
      phone: '+880-3333-333343',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user14@example.com',
      password: hashedPassword,
      name: 'Rashid Ahmed',
      phone: '+880-3333-333344',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isActive: true
    },
    {
      email: 'user15@example.com',
      password: hashedPassword,
      name: 'Shahadat Parvez',
      phone: '+880-3333-333345',
      role: UserRole.USER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive
      },
      create: user
    });
  }
  
  console.log(`✅ Seeded ${users.length} users`);
} 