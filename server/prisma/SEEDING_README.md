# Database Seeding System

This document explains the comprehensive database seeding system for the Truck Rental application.

## 🌱 Overview

The seeding system populates your database with realistic test data for all entities in the application. It includes:

- **System Settings** - Configuration data
- **Truck Categories** - Different types of trucks with pricing
- **Areas** - Cities and locations across Bangladesh
- **Users** - Admins, drivers, and regular users
- **Drivers** - Driver profiles with truck information
- **Bookings** - Trip bookings with different statuses
- **Reviews** - User reviews and ratings
- **Messages** - Chat messages between users and drivers
- **Payments** - Payment records for completed trips
- **Tracking** - GPS tracking data for drivers
- **Emergency Alerts** - Emergency situations and alerts

## 🚀 Quick Start

### Prerequisites

1. Make sure your database is set up and migrations are applied:
```bash
npm run db:generate
npm run db:migrate
```

2. Ensure your `.env` file has the correct `DATABASE_URL`

### Running the Seeder

```bash
# Run full seeding process (clears existing data first)
npm run seed

# Alternative commands
npm run seed:clear      # Explicitly clear and seed
npm run seed:skip-clear # Seed without clearing existing data
```

## 📋 Seeding Order

The seeder runs in the following order to maintain referential integrity:

1. **System Settings** - App configuration
2. **Truck Categories** - Truck types and pricing
3. **Areas** - Cities and locations
4. **Users** - All user types (admins, drivers, regular users)
5. **Drivers** - Driver profiles linked to users
6. **Bookings** - Trip bookings linked to users and drivers
7. **Reviews** - Reviews for completed bookings
8. **Messages** - Chat messages between users
9. **Payments** - Payment records for completed bookings
10. **Tracking** - GPS data for drivers
11. **Emergency Alerts** - Emergency situations

## 📊 Seeded Data Summary

### System Settings (30+ records)
- Pricing configuration (base fare, minimum fare, etc.)
- App settings (version, maintenance mode, etc.)
- Support contact information
- Driver and booking settings
- Payment and notification settings
- Security settings
- Feature flags

### Truck Categories (6 records)
- Mini Truck (1 ton capacity)
- Pickup (2 ton capacity)
- Lorry (5 ton capacity)
- Truck (10 ton capacity)
- Refrigerated Truck (temperature controlled)
- Flatbed Truck (oversized loads)

### Areas (80+ records)
- All major cities in Bangladesh
- Industrial areas
- Airports and ports
- Suburban areas

### Users (28 records)
- **3 Admin users** with full system access
- **10 Driver users** with driver profiles
- **15 Regular users** for booking trips

### Drivers (10 records)
- Various truck types and capacities
- Different locations across Bangladesh
- Realistic ratings and trip counts
- Verification statuses

### Bookings (8 records)
- Different booking statuses (pending, confirmed, in progress, completed, cancelled)
- Various routes across Bangladesh
- Realistic fares and distances
- Pickup and completion times

### Reviews (2 records)
- Ratings and comments for completed trips
- Linked to specific bookings

### Messages (10 records)
- Conversations between users and drivers
- Read/unread status
- Realistic chat content

### Payments (2 records)
- Different payment methods (cash, card)
- Completed payment statuses
- Transaction IDs

### Tracking (5 records)
- GPS coordinates for drivers
- Speed, heading, and accuracy data
- Realistic locations

### Emergency Alerts (4 records)
- Different alert types (breakdown, accident, theft, safety)
- Various severity levels
- Different statuses (pending, acknowledged, resolved)

## 🔧 Command Line Options

```bash
# Basic seeding
npm run seed

# Clear database before seeding
npm run seed:clear

# Seed without clearing existing data
npm run seed:skip-clear

# Show help
npm run seed -- --help
```

### Available Flags

- `--clear, -c` - Clear database before seeding
- `--skip-clear, -s` - Skip clearing database
- `--help, -h` - Show help message

## 🛠️ Individual Seeders

Each seeder can be run independently for development purposes:

```typescript
// Import individual seeders
import { seedSystemSettings } from './seeders/systemSettingsSeeder';
import { seedTruckCategories } from './seeders/truckCategorySeeder';
import { seedAreas } from './seeders/areaSeeder';
import { seedUsers } from './seeders/userSeeder';
import { seedDrivers } from './seeders/driverSeeder';
import { seedBookings } from './seeders/bookingSeeder';
import { seedReviews } from './seeders/reviewSeeder';
import { seedMessages } from './seeders/messageSeeder';
import { seedPayments } from './seeders/paymentSeeder';
import { seedTracking } from './seeders/trackingSeeder';
import { seedEmergencyAlerts } from './seeders/emergencyAlertSeeder';
```

## 🔐 Test Credentials

### Admin Users
- Email: `admin@truckbook.com` / Password: `password123`
- Email: `admin2@truckbook.com` / Password: `password123`
- Email: `superadmin@truckbook.com` / Password: `password123`

### Driver Users
- Email: `driver1@truckbook.com` / Password: `password123`
- Email: `driver2@truckbook.com` / Password: `password123`
- ... (up to driver10@truckbook.com)

### Regular Users
- Email: `user1@example.com` / Password: `password123`
- Email: `user2@example.com` / Password: `password123`
- ... (up to user15@example.com)

## 📍 Geographic Coverage

The seeder includes data for all major cities in Bangladesh:

- **Dhaka Division**: Dhaka, Gazipur, Narayanganj, Savar
- **Chittagong Division**: Chittagong, Cox's Bazar, Comilla, Feni, Chandpur
- **Sylhet Division**: Sylhet, Sunamganj, Habiganj, Moulvibazar
- **Rajshahi Division**: Rajshahi, Bogra, Pabna, Sirajganj, Natore, Naogaon, Chapainawabganj
- **Khulna Division**: Khulna, Jessore, Satkhira, Bagerhat, Kushtia, Magura, Jhenaidah, Narail, Chuadanga, Meherpur
- **Barisal Division**: Barisal, Pirojpur, Patuakhali, Bhola, Barguna, Jhalokati
- **Rangpur Division**: Rangpur, Dinajpur, Kurigram, Gaibandha, Nilphamari, Panchagarh, Thakurgaon, Lalmonirhat
- **Mymensingh Division**: Mymensingh, Jamalpur, Netrokona, Sherpur

## 🚛 Truck Information

### Available Truck Types
1. **Mini Truck** - 1 ton capacity, BDT 40/km
2. **Pickup** - 2 ton capacity, BDT 50/km
3. **Lorry** - 5 ton capacity, BDT 70/km
4. **Truck** - 10 ton capacity, BDT 90/km
5. **Refrigerated Truck** - Temperature controlled, BDT 120/km
6. **Flatbed Truck** - Oversized loads, BDT 85/km

### Driver Profiles
- Various truck qualities (Excellent, Good, Average)
- Realistic ratings (3.8 - 4.9 stars)
- Different verification statuses
- Multiple document types (license, registration, insurance, fitness, route permit)

## 💰 Pricing Structure

- **Base fare**: BDT 50 per kilometer
- **Minimum fare**: BDT 100
- **Driver commission**: 80%
- **Platform fee**: 20%
- **Cancellation fee**: 10% of fare

## 🔄 Reseeding

To update existing data without clearing:

```bash
npm run seed:skip-clear
```

This will use `upsert` operations to update existing records or create new ones.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `.env` file and `DATABASE_URL`
   - Ensure database is running

2. **Migration Errors**
   - Run `npm run db:migrate` first
   - Check for pending migrations

3. **Permission Errors**
   - Ensure database user has write permissions
   - Check database connection settings

4. **Foreign Key Errors**
   - Run seeders in the correct order
   - Check that referenced records exist

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=prisma:* npm run seed
```

## 📝 Customization

### Adding New Data

1. Create a new seeder file in `prisma/seeders/`
2. Export a function that creates the data
3. Import and call it in `prisma/seeders/index.ts`

### Modifying Existing Data

Edit the respective seeder files to change the data being created.

### Environment-Specific Data

Use environment variables to customize data:

```typescript
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const isProduction = process.env.NODE_ENV === 'production';
```

## 📈 Performance

The seeder is optimized for performance:

- Uses `upsert` operations to avoid duplicates
- Batches operations where possible
- Proper error handling and rollback
- Progress logging for monitoring

## 🔒 Security Notes

- Test credentials are for development only
- Change passwords in production
- Remove sensitive data before deployment
- Use environment variables for production settings

## 📞 Support

For issues with the seeding system:

1. Check the troubleshooting section
2. Review the logs for specific errors
3. Ensure database schema is up to date
4. Verify all dependencies are installed

---

**Note**: This seeder is designed for development and testing purposes. Always review and customize the data for production use. 