import { PrismaClient } from '@prisma/client';
import { logDatabase } from '../utils/logger';

const prisma = new PrismaClient();

export interface LocationUpdate {
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number; // km/h
  heading?: number; // degrees
  timestamp: Date;
  address?: string;
}

export interface TrackingData {
  id: string;
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: Date;
  address?: string | null;
  driver?: {
    id: string;
    userId: string;
    user: {
      name: string;
      phone: string | null;
    };
    truckType: string;
    isAvailable: boolean;
  };
}

export interface TrackingHistory {
  driverId: string;
  locations: Array<{
    latitude: number;
    longitude: number;
    timestamp: Date;
    speed?: number | null;
  }>;
  totalDistance: number;
  averageSpeed: number;
  duration: number; // in minutes
}

export class TrackingService {
  static async updateLocation(data: LocationUpdate): Promise<TrackingData> {
    logDatabase('insert', 'tracking', { 
      driverId: data.driverId, 
      latitude: data.latitude, 
      longitude: data.longitude 
    });

    const trackingData = await prisma.tracking.create({
      data: {
        driverId: data.driverId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        speed: data.speed,
        heading: data.heading,
        timestamp: data.timestamp,
        address: data.address
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        }
      }
    });

    // Update driver's current location
    await prisma.driver.update({
      where: { id: data.driverId },
      data: {
        latitude: data.latitude,
        longitude: data.longitude
      }
    });

    logDatabase('insert_success', 'tracking', { trackingId: trackingData.id });

    return trackingData;
  }

  static async getCurrentLocation(driverId: string): Promise<TrackingData | null> {
    logDatabase('select', 'tracking', { driverId, operation: 'current_location' });

    const trackingData = await prisma.tracking.findFirst({
      where: { driverId },
      include: {
        driver: {
          include: {
            user: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    return trackingData;
  }

  static async getTrackingHistory(
    driverId: string, 
    startTime: Date, 
    endTime: Date
  ): Promise<TrackingHistory> {
    logDatabase('select', 'tracking', { 
      driverId, 
      startTime, 
      endTime, 
      operation: 'tracking_history' 
    });

    const locations = await prisma.tracking.findMany({
      where: {
        driverId,
        timestamp: {
          gte: startTime,
          lte: endTime
        }
      },
      select: {
        latitude: true,
        longitude: true,
        timestamp: true,
        speed: true
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    // Calculate total distance and average speed
    let totalDistance = 0;
    let totalSpeed = 0;
    let speedCount = 0;

    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];
      
      const distance = this.calculateDistance(
        prev.latitude, prev.longitude,
        curr.latitude, curr.longitude
      );
      
      totalDistance += distance;
      
      if (curr.speed) {
        totalSpeed += curr.speed;
        speedCount++;
      }
    }

    const duration = locations.length > 1 
      ? (locations[locations.length - 1].timestamp.getTime() - locations[0].timestamp.getTime()) / (1000 * 60)
      : 0;

    return {
      driverId,
      locations,
      totalDistance: Math.round(totalDistance * 100) / 100,
      averageSpeed: speedCount > 0 ? Math.round((totalSpeed / speedCount) * 100) / 100 : 0,
      duration: Math.round(duration)
    };
  }

  static async getActiveDriversInArea(
    latitude: number, 
    longitude: number, 
    radius: number = 10
  ): Promise<TrackingData[]> {
    logDatabase('select', 'tracking', { 
      latitude, 
      longitude, 
      radius, 
      operation: 'active_drivers_in_area' 
    });

    // Get all active drivers
    const activeDrivers = await prisma.driver.findMany({
      where: {
        isAvailable: true,
        isVerified: true,
        latitude: {
          not: null
        },
        longitude: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });

    // Filter drivers within radius
    const driversInArea = activeDrivers.filter(driver => {
      if (!driver.latitude || !driver.longitude) return false;
      
      const distance = this.calculateDistance(
        latitude, longitude,
        driver.latitude, driver.longitude
      );
      
      return distance <= radius;
    });

    // Get latest tracking data for each driver
    const trackingData = await Promise.all(
      driversInArea.map(async (driver) => {
        const latestTracking = await prisma.tracking.findFirst({
          where: { driverId: driver.id },
          orderBy: { timestamp: 'desc' }
        });

        return {
          id: latestTracking?.id || '',
          driverId: driver.id,
          latitude: driver.latitude!,
          longitude: driver.longitude!,
          timestamp: latestTracking?.timestamp || new Date(),
          driver: {
            id: driver.id,
            userId: driver.userId,
            user: driver.user,
            truckType: driver.truckType,
            isAvailable: driver.isAvailable
          }
        };
      })
    );

    return trackingData;
  }

  static async getDriverRoute(
    driverId: string, 
    bookingId: string
  ): Promise<{
    source: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
    currentLocation?: { latitude: number; longitude: number };
    estimatedArrival?: number; // minutes
  }> {
    logDatabase('select', 'tracking', { 
      driverId, 
      bookingId, 
      operation: 'driver_route' 
    });

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        sourceLat: true,
        sourceLng: true,
        destLat: true,
        destLng: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const currentLocation = await this.getCurrentLocation(driverId);

    let estimatedArrival: number | undefined;
    if (currentLocation && booking.destLat && booking.destLng) {
      const distance = this.calculateDistance(
        currentLocation.latitude, currentLocation.longitude,
        booking.destLat, booking.destLng
      );
      estimatedArrival = Math.round(distance * 2); // 2 minutes per km
    }

    return {
      source: {
        latitude: booking.sourceLat || 0,
        longitude: booking.sourceLng || 0
      },
      destination: {
        latitude: booking.destLat || 0,
        longitude: booking.destLng || 0
      },
      currentLocation: currentLocation ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      } : undefined,
      estimatedArrival
    };
  }

  static async getTrackingStats(driverId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    logDatabase('select', 'tracking', { 
      driverId, 
      days, 
      operation: 'tracking_stats' 
    });

    const trackingData = await prisma.tracking.findMany({
      where: {
        driverId,
        timestamp: {
          gte: startDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    let totalDistance = 0;
    let totalSpeed = 0;
    let speedCount = 0;
    let maxSpeed = 0;

    for (let i = 1; i < trackingData.length; i++) {
      const prev = trackingData[i - 1];
      const curr = trackingData[i];
      
      const distance = this.calculateDistance(
        prev.latitude, prev.longitude,
        curr.latitude, curr.longitude
      );
      
      totalDistance += distance;
      
      if (curr.speed) {
        totalSpeed += curr.speed;
        speedCount++;
        maxSpeed = Math.max(maxSpeed, curr.speed);
      }
    }

    return {
      totalDistance: Math.round(totalDistance * 100) / 100,
      averageSpeed: speedCount > 0 ? Math.round((totalSpeed / speedCount) * 100) / 100 : 0,
      maxSpeed: Math.round(maxSpeed * 100) / 100,
      totalPoints: trackingData.length,
      daysTracked: days
    };
  }

  private static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
} 