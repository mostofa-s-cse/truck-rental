import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedEmergencyAlerts() {
  console.log('🚨 Seeding emergency alerts...');
  
  const users = await prisma.user.findMany({
    where: { role: UserRole.DRIVER }
  });
  
  const alerts = [
    {
      userId: users[0].id,
      type: 'BREAKDOWN',
      location: {
        latitude: 23.7803,
        longitude: 90.4168,
        address: 'Gulshan-1, Dhaka'
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
        latitude: 23.8260,
        longitude: 90.3800,
        address: 'Mirpur-10, Dhaka'
      },
      description: 'Minor collision with another vehicle, no injuries',
      severity: 'MEDIUM',
      status: 'ACKNOWLEDGED',
      contactNumber: '+880-2222-222222'
    },
    {
      userId: users[2].id,
      type: 'THEFT',
      location: {
        latitude: 23.8151,
        longitude: 90.4480,
        address: 'Bashundhara R/A, Dhaka'
      },
      description: 'Suspicious activity around the truck',
      severity: 'HIGH',
      status: 'RESOLVED',
      contactNumber: '+880-2222-222223'
    },
    {
      userId: users[3].id,
      type: 'SAFETY',
      location: {
        latitude: 23.7564,
        longitude: 90.3890,
        address: 'Farmgate, Dhaka'
      },
      description: 'Road conditions are dangerous due to heavy rain',
      severity: 'MEDIUM',
      status: 'PENDING',
      contactNumber: '+880-2222-222224'
    }
  ];

  for (const alert of alerts) {
    await prisma.emergencyAlert.create({
      data: alert
    });
  }
  
  console.log(`✅ Seeded ${alerts.length} emergency alerts`);
} 