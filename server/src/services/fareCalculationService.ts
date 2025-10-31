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
  truckCategoryId?: string; // Specific truck category ID
  truckType?: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK'; // Fallback to truck type
  weight?: number; // in tons
  urgency?: 'NORMAL' | 'URGENT' | 'EMERGENCY';
}

export interface FareCalculationResult {
  distance: number; // in km
  duration: number; // in minutes
  baseFare: number;
  distanceCost: number;
  weightMultiplier: number;
  urgencyMultiplier: number;
  totalFare: number;
  isInsideDhaka: boolean;
  breakdown: {
    baseFare: number;
    distanceCost: number;
    weightCost: number;
    urgencyCost: number;
    tolls: number;
  };
}

export class FareCalculationService {

  static async calculateFare(request: FareCalculationRequest): Promise<FareCalculationResult> {
    logDatabase('select', 'fare_calculation', { 
      source: request.source, 
      destination: request.destination, 
      truckCategoryId: request.truckCategoryId,
      truckType: request.truckType 
    });

    try {
      // Get truck category
      let truckCategory;
      if (request.truckCategoryId) {
        truckCategory = await prisma.truckCategory.findUnique({
          where: { id: request.truckCategoryId }
        });
      } else if (request.truckType) {
        // Fallback to first available category of the specified type
        truckCategory = await prisma.truckCategory.findFirst({
          where: { 
            truckType: request.truckType,
            isActive: true 
          }
        });
      }

      if (!truckCategory) {
        throw new Error(`Truck category not found for ${request.truckCategoryId || request.truckType}`);
      }

      // Calculate distance and duration using Google Maps API
      const { distance, duration } = await this.getDistanceAndDuration(
        request.source,
        request.destination
      );

      // Determine if trip is inside or outside Dhaka
      const isInsideDhaka = this.isInsideDhaka(request.source) && this.isInsideDhaka(request.destination);
      
      // Calculate fare components using TruckBook formula
      const baseFare = truckCategory.baseFare;
      const ratePerKm = isInsideDhaka ? truckCategory.insideDhakaRate : truckCategory.outsideDhakaRate;
      const distanceCost = distance * ratePerKm;
      
      // Weight multiplier (if weight is provided and exceeds truck capacity)
      const weightMultiplier = request.weight && request.weight > truckCategory.capacity 
        ? this.calculateWeightMultiplier(request.weight / truckCategory.capacity) 
        : 1;
      const weightCost = distanceCost * (weightMultiplier - 1);
      
      // Urgency multiplier
      const urgencyMultiplier = this.calculateUrgencyMultiplier(request.urgency || 'NORMAL');
      const urgencyCost = distanceCost * (urgencyMultiplier - 1);
      
      // Calculate tolls (simplified - could be enhanced with actual toll data)
      const tolls = this.calculateTolls(request.source, request.destination, distance);
      
      // Total fare calculation: Base Fare + Distance Cost + Weight Cost + Urgency Cost + Tolls
      const totalFare = baseFare + distanceCost + weightCost + urgencyCost + tolls;

      const result: FareCalculationResult = {
        distance,
        duration,
        baseFare,
        distanceCost,
        weightMultiplier,
        urgencyMultiplier,
        totalFare: Math.round(totalFare),
        isInsideDhaka,
        breakdown: {
          baseFare,
          distanceCost: Math.round(distanceCost),
          weightCost: Math.round(weightCost),
          urgencyCost: Math.round(urgencyCost),
          tolls
        }
      };

      logDatabase('select_success', 'fare_calculation', { 
        distance, 
        totalFare: result.totalFare,
        truckCategory: truckCategory.name,
        isInsideDhaka
      });

      return result;
    } catch (error) {
      logDatabase('select_error', 'fare_calculation', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        request 
      });
      throw error;
    }
  }

  private static async getDistanceAndDuration(source: Location, destination: Location): Promise<{ distance: number; duration: number }> {
    try {
      // Use OpenStreetMap Routing API (OSRM) for distance and duration
      const origin = `${source.longitude},${source.latitude}`;
      const dest = `${destination.longitude},${destination.latitude}`;
      
      const url = `https://router.project-osrm.org/route/v1/driving/${origin};${dest}?overview=false&annotations=true`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TruckLagbe/1.0 (https://trucklagbe.com; contact@trucklagbe.com)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }
      
      const data = await response.json() as any;

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: route.distance / 1000, // Convert meters to km
          duration: route.duration / 60 // Convert seconds to minutes
        };
      } else {
        throw new Error(`OSRM API error: ${data.code}`);
      }
    } catch (error) {
      // Fallback to simple calculation
      console.warn('OSRM API error, using fallback calculation:', error instanceof Error ? error.message : 'Unknown error');
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

  private static isInsideDhaka(location: Location): boolean {
    // Dhaka city boundaries (approximate)
    const dhakaBounds = {
      north: 23.85,
      south: 23.70,
      east: 90.45,
      west: 90.30
    };

    return location.latitude >= dhakaBounds.south && 
           location.latitude <= dhakaBounds.north && 
           location.longitude >= dhakaBounds.west && 
           location.longitude <= dhakaBounds.east;
  }

  private static calculateTolls(source: Location, destination: Location, distance: number): number {
    // Simplified toll calculation
    // In a real implementation, this would check against actual toll locations
    let tolls = 0;
    
    // Add tolls for long-distance trips (outside Dhaka)
    if (distance > 50) {
      tolls += 200; // Basic toll for long distance
    }
    
    // Add tolls for bridge crossings (simplified)
    if (this.crossesBridge(source, destination)) {
      tolls += 100; // Bridge toll
    }
    
    return tolls;
  }

  private static crossesBridge(source: Location, destination: Location): boolean {
    // Simplified bridge detection
    // In reality, this would check against actual bridge coordinates
    const bridges = [
      { lat: 23.7937, lng: 90.4066, name: 'Jamuna Bridge' },
      { lat: 23.8103, lng: 90.4125, name: 'Padma Bridge' }
    ];
    
    // Check if route crosses near any bridge
    for (const bridge of bridges) {
      const sourceDistance = this.calculateSimpleDistance(source, { latitude: bridge.lat, longitude: bridge.lng }).distance;
      const destDistance = this.calculateSimpleDistance(destination, { latitude: bridge.lat, longitude: bridge.lng }).distance;
      
      if (sourceDistance < 10 && destDistance < 10) {
        return true;
      }
    }
    
    return false;
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

  /**
   * Get route details for map display using OpenStreetMap
   */
  static async getRouteDetails(source: Location, destination: Location): Promise<{
    distance: number;
    duration: number;
    routeGeometry: string; // Encoded polyline for map display
    waypoints: Array<{ latitude: number; longitude: number }>;
  }> {
    try {
      const origin = `${source.longitude},${source.latitude}`;
      const dest = `${destination.longitude},${destination.latitude}`;
      
      const url = `https://router.project-osrm.org/route/v1/driving/${origin};${dest}?overview=full&geometries=geojson&annotations=true`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TruckLagbe/1.0 (https://trucklagbe.com; contact@trucklagbe.com)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }
      
      const data = await response.json() as any;

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const geometry = route.geometry;
        
        // Extract waypoints for map markers
        const waypoints = geometry.coordinates.map((coord: [number, number]) => ({
          latitude: coord[1],
          longitude: coord[0]
        }));

        return {
          distance: route.distance / 1000, // Convert to km
          duration: route.duration / 60, // Convert to minutes
          routeGeometry: JSON.stringify(geometry),
          waypoints
        };
      } else {
        throw new Error(`OSRM API error: ${data.code}`);
      }
    } catch (error) {
      console.warn('OSRM API error, using fallback route:', error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback: simple straight line route
      const distance = this.calculateSimpleDistance(source, destination).distance;
      const duration = distance * 2; // 2 minutes per km
      
      return {
        distance,
        duration,
        routeGeometry: JSON.stringify({
          type: 'LineString',
          coordinates: [
            [source.longitude, source.latitude],
            [destination.longitude, destination.latitude]
          ]
        }),
        waypoints: [
          { latitude: source.latitude, longitude: source.longitude },
          { latitude: destination.latitude, longitude: destination.longitude }
        ]
      };
    }
  }
} 