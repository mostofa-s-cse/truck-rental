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
    },
    {
      userId: users[2].id,
      type: 'THEFT',
      location: {
        latitude: 22.3419,
        longitude: 91.8132,
        address: 'Chittagong Port, Chittagong'
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
        latitude: 24.8949,
        longitude: 91.8687,
        address: 'Sylhet City, Sylhet'
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