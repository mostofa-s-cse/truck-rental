import { PrismaClient } from '@prisma/client';
import { seedSystemSettings } from './systemSettingsSeeder';
import { seedTruckCategories } from './truckCategorySeeder';
import { seedAreas } from './areaSeeder';
import { seedUsers } from './userSeeder';
import { seedDrivers } from './driverSeeder';
import { seedBookings } from './bookingSeeder';
import { seedReviews } from './reviewSeeder';
import { seedMessages } from './messageSeeder';
import { seedPayments } from './paymentSeeder';
import { seedTracking } from './trackingSeeder';
import { seedEmergencyAlerts } from './emergencyAlertSeeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');
  console.log('==============================================');

  try {
    // Step 1: Clear existing data (optional - comment out if you want to preserve data)
    if (await shouldClearDatabase()) {
      await clearDatabase();
    }

    // Step 2: Seed in order of dependencies
    console.log('\n📋 Seeding order:');
    console.log('1. System Settings');
    console.log('2. Truck Categories');
    console.log('3. Areas');
    console.log('4. Users (Admins, Drivers, Regular Users)');
    console.log('5. Driver Profiles');
    console.log('6. Bookings');
    console.log('7. Reviews');
    console.log('8. Messages');
    console.log('9. Payments');
    console.log('10. Tracking Data');
    console.log('11. Emergency Alerts');
    console.log('==============================================\n');

    // Execute seeders in order
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

    console.log('\n==============================================');
    console.log('✅ All seeders completed successfully!');
    console.log('==============================================');
    
    // Display summary
    await displaySeedingSummary();

  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
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
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM ${table}`);
      console.log(`   ✅ Cleared ${table}`);
    } catch (error) {
      console.log(`   ⚠️  Could not clear ${table}: ${error}`);
    }
  }
  console.log('   ✅ Database cleared\n');
}

async function displaySeedingSummary() {
  console.log('\n📊 Seeding Summary:');
  console.log('===================');
  
  try {
    const [
      systemSettingsCount,
      truckCategoriesCount,
      areasCount,
      usersCount,
      driversCount,
      bookingsCount,
      reviewsCount,
      messagesCount,
      paymentsCount,
      trackingCount,
      emergencyAlertsCount
    ] = await Promise.all([
      prisma.systemSetting.count(),
      prisma.truckCategory.count(),
      prisma.area.count(),
      prisma.user.count(),
      prisma.driver.count(),
      prisma.booking.count(),
      prisma.review.count(),
      prisma.message.count(),
      prisma.payment.count(),
      prisma.tracking.count(),
      prisma.emergencyAlert.count()
    ]);

    console.log(`⚙️  System Settings: ${systemSettingsCount}`);
    console.log(`🚛 Truck Categories: ${truckCategoriesCount}`);
    console.log(`📍 Areas: ${areasCount}`);
    console.log(`👥 Users: ${usersCount}`);
    console.log(`🚚 Drivers: ${driversCount}`);
    console.log(`📋 Bookings: ${bookingsCount}`);
    console.log(`⭐ Reviews: ${reviewsCount}`);
    console.log(`💬 Messages: ${messagesCount}`);
    console.log(`💳 Payments: ${paymentsCount}`);
    console.log(`📍 Tracking Records: ${trackingCount}`);
    console.log(`🚨 Emergency Alerts: ${emergencyAlertsCount}`);
    
    const totalRecords = systemSettingsCount + truckCategoriesCount + areasCount + 
                        usersCount + driversCount + bookingsCount + reviewsCount + 
                        messagesCount + paymentsCount + trackingCount + emergencyAlertsCount;
    
    console.log(`\n📈 Total Records Created: ${totalRecords}`);
    
  } catch (error) {
    console.log('⚠️  Could not display summary:', error);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const shouldClear = args.includes('--clear') || args.includes('-c');
const shouldSkipClear = args.includes('--skip-clear') || args.includes('-s');

// Create a function that determines whether to clear the database
async function shouldClearDatabase() {
  if (shouldSkipClear) {
    console.log('⏭️  Skipping database clear (--skip-clear flag provided)...\n');
    return false;
  }
  return true;
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🌱 Database Seeder Usage:

npm run seed                    # Run full seeding process
npm run seed --clear           # Clear database before seeding
npm run seed --skip-clear      # Skip clearing database
npm run seed --help            # Show this help

Available flags:
  --clear, -c      Clear database before seeding
  --skip-clear, -s Skip clearing database
  --help, -h       Show this help message

Examples:
  npm run seed                    # Normal seeding
  npm run seed --clear           # Clear and seed
  npm run seed --skip-clear      # Seed without clearing
`);
  process.exit(0);
}

// Run the seeder
main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  }); 