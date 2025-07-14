import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedSystemSettings() {
  console.log('⚙️ Seeding system settings...');
  
  const settings = [
    // Pricing and Fare Settings
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
      key: 'platform_fee_percentage',
      value: '20',
      type: 'number'
    },
    {
      key: 'cancellation_fee_percentage',
      value: '10',
      type: 'number'
    },
    
    // App Configuration
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
      key: 'force_update_version',
      value: '1.0.0',
      type: 'string'
    },
    
    // Support and Contact
    {
      key: 'support_email',
      value: 'support@truckbook.com',
      type: 'string'
    },
    {
      key: 'support_phone',
      value: '+880-1234-567890',
      type: 'string'
    },
    {
      key: 'emergency_contact',
      value: '+880-9999-999999',
      type: 'string'
    },
    
    // Driver Settings
    {
      key: 'driver_verification_required',
      value: 'true',
      type: 'boolean'
    },
    {
      key: 'max_driver_rating',
      value: '5',
      type: 'number'
    },
    {
      key: 'min_driver_rating',
      value: '1',
      type: 'number'
    },
    
    // Booking Settings
    {
      key: 'booking_timeout_minutes',
      value: '15',
      type: 'number'
    },
    {
      key: 'max_active_bookings_per_user',
      value: '3',
      type: 'number'
    },
    {
      key: 'auto_cancel_after_hours',
      value: '24',
      type: 'number'
    },
    
    // Payment Settings
    {
      key: 'payment_methods',
      value: '["CASH", "CARD", "MOBILE_BANKING"]',
      type: 'json'
    },
    {
      key: 'payment_timeout_minutes',
      value: '30',
      type: 'number'
    },
    
    // Notification Settings
    {
      key: 'push_notifications_enabled',
      value: 'true',
      type: 'boolean'
    },
    {
      key: 'email_notifications_enabled',
      value: 'true',
      type: 'boolean'
    },
    {
      key: 'sms_notifications_enabled',
      value: 'true',
      type: 'boolean'
    },
    
    // Security Settings
    {
      key: 'max_login_attempts',
      value: '5',
      type: 'number'
    },
    {
      key: 'lockout_duration_minutes',
      value: '30',
      type: 'number'
    },
    {
      key: 'session_timeout_hours',
      value: '24',
      type: 'number'
    },
    
    // Feature Flags
    {
      key: 'tracking_enabled',
      value: 'true',
      type: 'boolean'
    },
    {
      key: 'chat_enabled',
      value: 'true',
      type: 'boolean'
    },
    {
      key: 'emergency_alerts_enabled',
      value: 'true',
      type: 'boolean'
    },
    {
      key: 'reviews_enabled',
      value: 'true',
      type: 'boolean'
    }
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting
    });
  }
  
  console.log(`✅ Seeded ${settings.length} system settings`);
} 