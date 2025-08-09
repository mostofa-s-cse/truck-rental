import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedMessages() {
  console.log('💬 Seeding messages...');
  
  const users = await prisma.user.findMany({ where: { role: UserRole.USER } });
  const drivers = await prisma.user.findMany({ where: { role: UserRole.DRIVER } });
  
  const messages = [
    {
      senderId: users[0].id,
      receiverId: drivers[0].id,
      content: 'Hi, are you available for a pickup tomorrow?',
      isRead: true
    },
    {
      senderId: drivers[0].id,
      receiverId: users[0].id,
      content: 'Yes, I am available. What time and location?',
      isRead: true
    },
    {
      senderId: users[0].id,
      receiverId: drivers[0].id,
      content: 'Around 10 AM from Gulshan-1. Is that okay?',
      isRead: false
    },
    {
      senderId: users[1].id,
      receiverId: drivers[1].id,
      content: 'Hello, I need a truck from Banani to Uttara. Are you free?',
      isRead: true
    },
    {
      senderId: drivers[1].id,
      receiverId: users[1].id,
      content: 'Yes, I can help. What size truck do you need? Pickup at Banani.',
      isRead: false
    },
    {
      senderId: users[2].id,
      receiverId: drivers[2].id,
      content: 'Do you have experience with fragile items? Route: Dhanmondi to Shahbagh.',
      isRead: true
    },
    {
      senderId: drivers[2].id,
      receiverId: users[2].id,
      content: 'Yes, I have special equipment for fragile items. Don\'t worry!',
      isRead: true
    },
    {
      senderId: users[3].id,
      receiverId: drivers[3].id,
      content: 'What\'s your estimated arrival time to Mohammadpur?',
      isRead: false
    },
    {
      senderId: drivers[4].id,
      receiverId: users[4].id,
      content: 'I\'m running 10 minutes late due to Tejgaon traffic. Sorry for the inconvenience.',
      isRead: true
    },
    {
      senderId: users[4].id,
      receiverId: drivers[4].id,
      content: 'No problem, take your time. Safety first! See you at Farmgate.',
      isRead: false
    }
  ];

  for (const message of messages) {
    await prisma.message.create({
      data: message
    });
  }
  
  console.log(`✅ Seeded ${messages.length} messages`);
} 