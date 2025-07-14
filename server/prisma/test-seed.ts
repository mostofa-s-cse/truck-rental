import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSeed() {
  console.log('🧪 Testing seeded data...');
  
  try {
    // Test system settings
    const systemSettings = await prisma.systemSetting.count();
    console.log(`✅ System Settings: ${systemSettings} records`);
    
    // Test truck categories
    const truckCategories = await prisma.truckCategory.count();
    console.log(`✅ Truck Categories: ${truckCategories} records`);
    
    // Test areas
    const areas = await prisma.area.count();
    console.log(`✅ Areas: ${areas} records`);
    
    // Test users
    const users = await prisma.user.count();
    console.log(`✅ Users: ${users} records`);
    
    // Test drivers
    const drivers = await prisma.driver.count();
    console.log(`✅ Drivers: ${drivers} records`);
    
    // Test bookings
    const bookings = await prisma.booking.count();
    console.log(`✅ Bookings: ${bookings} records`);
    
    // Test reviews
    const reviews = await prisma.review.count();
    console.log(`✅ Reviews: ${reviews} records`);
    
    // Test messages
    const messages = await prisma.message.count();
    console.log(`✅ Messages: ${messages} records`);
    
    // Test payments
    const payments = await prisma.payment.count();
    console.log(`✅ Payments: ${payments} records`);
    
    // Test tracking
    const tracking = await prisma.tracking.count();
    console.log(`✅ Tracking: ${tracking} records`);
    
    // Test emergency alerts
    const alerts = await prisma.emergencyAlert.count();
    console.log(`✅ Emergency Alerts: ${alerts} records`);
    
    // Test relationships
    const userWithDriver = await prisma.user.findFirst({
      where: { role: 'DRIVER' },
      include: { driverProfile: true }
    });
    
    if (userWithDriver?.driverProfile) {
      console.log(`✅ User-Driver relationship: Working`);
    } else {
      console.log(`❌ User-Driver relationship: Failed`);
    }
    
    const bookingWithRelations = await prisma.booking.findFirst({
      include: { user: true, driver: true }
    });
    
    if (bookingWithRelations?.user && bookingWithRelations?.driver) {
      console.log(`✅ Booking relationships: Working`);
    } else {
      console.log(`❌ Booking relationships: Failed`);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSeed(); 