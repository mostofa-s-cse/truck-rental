import { PrismaClient } from '@prisma/client';
import { logDatabase } from '../utils/logger';

const prisma = new PrismaClient();

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface FareCalculationRequest {
  source: Location;
  destination: Location;
  truckType: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  weight?: number; // in tons
  urgency?: 'NORMAL' | 'URGENT' | 'EMERGENCY';
}

export interface FareCalculationResult {
  distance: number; // in km
  duration: number; // in minutes
  baseFare: number;
  weightMultiplier: number;
  urgencyMultiplier: number;
  totalFare: number;
  breakdown: {
    distanceCost: number;
    weightCost: number;
    urgencyCost: number;
    basePrice: number;
  };
}

export class FareCalculationService {
  private static readonly GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  static async calculateFare(request: FareCalculationRequest): Promise<FareCalculationResult> {
    logDatabase('select', 'fare_calculation', { 
      source: request.source, 
      destination: request.destination, 
      truckType: request.truckType 
    });

    try {
      // Get truck category base price
      const truckCategory = await prisma.truckCategory.findFirst({
        where: { 
          name: request.truckType,
          isActive: true 
        }
      });

      if (!truckCategory) {
        throw new Error(`Truck category ${request.truckType} not found`);
      }

      // Calculate distance and duration using Google Maps API
      const { distance, duration } = await this.getDistanceAndDuration(
        request.source,
        request.destination
      );

      // Calculate fare components
      const basePrice = truckCategory.basePrice;
      const distanceCost = distance * basePrice;
      
      // Weight multiplier (if weight is provided)
      const weightMultiplier = request.weight ? this.calculateWeightMultiplier(request.weight) : 1;
      const weightCost = distanceCost * (weightMultiplier - 1);
      
      // Urgency multiplier
      const urgencyMultiplier = this.calculateUrgencyMultiplier(request.urgency || 'NORMAL');
      const urgencyCost = distanceCost * (urgencyMultiplier - 1);
      
      // Total fare calculation
      const totalFare = distanceCost + weightCost + urgencyCost;

      const result: FareCalculationResult = {
        distance,
        duration,
        baseFare: basePrice,
        weightMultiplier,
        urgencyMultiplier,
        totalFare: Math.round(totalFare * 100) / 100, // Round to 2 decimal places
        breakdown: {
          distanceCost: Math.round(distanceCost * 100) / 100,
          weightCost: Math.round(weightCost * 100) / 100,
          urgencyCost: Math.round(urgencyCost * 100) / 100,
          basePrice
        }
      };

      logDatabase('select_success', 'fare_calculation', { 
        distance, 
        totalFare: result.totalFare,
        truckType: request.truckType 
      });

      return result;
    } catch (error) {
      logDatabase('select_error', 'fare_calculation', { 
        error: error.message,
        request 
      });
      throw error;
    }
  }

  private static async getDistanceAndDuration(source: Location, destination: Location): Promise<{ distance: number; duration: number }> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      // Fallback to simple calculation if API key is not available
      return this.calculateSimpleDistance(source, destination);
    }

    try {
      const origin = `${source.latitude},${source.longitude}`;
      const dest = `${destination.latitude},${destination.longitude}`;
      
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${dest}&key=${this.GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
        const element = data.rows[0].elements[0];
        return {
          distance: element.distance.value / 1000, // Convert meters to km
          duration: element.duration.value / 60 // Convert seconds to minutes
        };
      } else {
        throw new Error(`Google Maps API error: ${data.status}`);
      }
    } catch (error) {
      // Fallback to simple calculation
      return this.calculateSimpleDistance(source, destination);
    }
  }

  private static calculateSimpleDistance(source: Location, destination: Location): { distance: number; duration: number } {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(destination.latitude - source.latitude);
    const dLon = this.toRadians(destination.longitude - source.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(source.latitude)) * Math.cos(this.toRadians(destination.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Estimate duration (assuming average speed of 30 km/h in city)
    const duration = distance * 2; // 2 minutes per km

    return { distance, duration };
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private static calculateWeightMultiplier(weight: number): number {
    if (weight <= 1) return 1.0;
    if (weight <= 3) return 1.2;
    if (weight <= 5) return 1.5;
    if (weight <= 10) return 2.0;
    return 2.5; // For weights above 10 tons
  }

  private static calculateUrgencyMultiplier(urgency: string): number {
    switch (urgency) {
      case 'NORMAL': return 1.0;
      case 'URGENT': return 1.3;
      case 'EMERGENCY': return 1.8;
      default: return 1.0;
    }
  }

  static async getFareHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    logDatabase('select', 'fare_history', { userId, page, limit });

    const bookings = await prisma.booking.findMany({
      where: { userId },
      select: {
        id: true,
        source: true,
        destination: true,
        distance: true,
        fare: true,
        status: true,
        createdAt: true,
        driver: {
          select: {
            truckType: true,
            capacity: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    return {
      bookings,
      page,
      limit,
      total: await prisma.booking.count({ where: { userId } })
    };
  }

  static async getFareAnalytics(adminId: string, startDate?: Date, endDate?: Date) {
    logDatabase('select', 'fare_analytics', { adminId, startDate, endDate });

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    const [totalBookings, totalRevenue, averageFare, fareByTruckType] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.aggregate({
        where,
        _sum: { fare: true }
      }),
      prisma.booking.aggregate({
        where,
        _avg: { fare: true }
      }),
      prisma.booking.groupBy({
        by: ['driverId'],
        where,
        _sum: { fare: true },
        _count: { id: true }
      })
    ]);

    return {
      totalBookings,
      totalRevenue: totalRevenue._sum.fare || 0,
      averageFare: averageFare._avg.fare || 0,
      fareByTruckType
    };
  }
} 