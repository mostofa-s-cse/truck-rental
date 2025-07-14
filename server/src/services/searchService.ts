import { PrismaClient } from '@prisma/client';
import { logDatabase, logError } from '../utils/logger';

const prisma = new PrismaClient();

export interface SearchFilters {
  truckType?: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  capacity?: number; // minimum capacity in tons
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
  rating?: number; // minimum rating
  priceRange?: {
    min?: number;
    max?: number;
  };
  availability?: boolean;
  verified?: boolean;
  quality?: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

export interface SearchResult {
  drivers: Array<{
    id: string;
    userId: string;
    truckType: string;
    capacity: number;
    quality: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    isAvailable: boolean;
    isVerified: boolean;
    rating: number;
    totalTrips: number;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      avatar: string | null;
    };
    reviews: Array<{
      rating: number;
      comment: string | null;
    }>;
    distance?: number; // distance from search location
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: SearchFilters;
}

export class SearchService {
  static async searchTrucks(
    filters: SearchFilters,
    page = 1,
    limit = 10
  ): Promise<SearchResult> {
    try {
      const skip = (page - 1) * limit;

      logDatabase('select', 'search_trucks', { filters, page, limit });

      const where: Record<string, any> = {};

      // Build where clause based on filters
      if (filters.truckType) {
        where.truckType = filters.truckType;
      }

      if (filters.capacity) {
        where.capacity = {
          gte: filters.capacity
        };
      }

      if (filters.rating) {
        where.rating = {
          gte: filters.rating
        };
      }

      if (filters.availability !== undefined) {
        where.isAvailable = filters.availability;
      }

      if (filters.verified !== undefined) {
        where.isVerified = filters.verified;
      }

      if (filters.quality) {
        where.quality = filters.quality;
      }

      // Add location filter if provided
      if (filters.location) {
        where.location = {
          contains: filters.location,
          mode: 'insensitive'
        };
      }

      // Get all drivers first for distance calculation
      const allDrivers = await prisma.driver.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true
            }
          },
          reviews: {
            select: {
              rating: true,
              comment: true
            },
            take: 5,
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          rating: 'desc'
        }
      });

      // Calculate distance and apply radius filter if coordinates are provided
      let driversWithDistance = allDrivers;
      if (filters.latitude && filters.longitude) {
        driversWithDistance = allDrivers
          .map(driver => {
            if (driver.latitude && driver.longitude) {
              const distance = this.calculateDistance(
                filters.latitude!,
                filters.longitude!,
                driver.latitude,
                driver.longitude
              );
              return { ...driver, distance };
            }
            return { ...driver, distance: undefined };
          })
          .filter(driver => {
            // Filter by radius if specified
            if (filters.radius && driver.distance !== undefined) {
              return driver.distance <= filters.radius!;
            }
            return true;
          })
          .sort((a, b) => {
            // Sort by distance if available
            if (a.distance === undefined && b.distance === undefined) return 0;
            if (a.distance === undefined) return 1;
            if (b.distance === undefined) return -1;
            return a.distance - b.distance;
          });
      }

      // Apply pagination after all filtering
      const total = driversWithDistance.length;
      const paginatedDrivers = driversWithDistance.slice(skip, skip + limit);

      return {
        drivers: paginatedDrivers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        filters
      };
    } catch (error) {
      logError(error, { 
        operation: 'search_trucks', 
        filters, 
        page, 
        limit 
      });
      throw error;
    }
  }

  static async getPopularTrucks(limit = 10): Promise<any[]> {
    try {
      logDatabase('select', 'popular_trucks', { limit });

      const popularTrucks = await prisma.driver.findMany({
        where: {
          isVerified: true,
          isAvailable: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: [
          { rating: 'desc' },
          { totalTrips: 'desc' }
        ],
        take: limit
      });

      return popularTrucks;
    } catch (error) {
      logError(error, { 
        operation: 'get_popular_trucks', 
        limit 
      });
      throw error;
    }
  }

  static async getNearbyTrucks(
    latitude: number,
    longitude: number,
    radius: number = 10,
    limit = 20
  ): Promise<any[]> {
    try {
      logDatabase('select', 'nearby_trucks', { latitude, longitude, radius, limit });

      // Get all active drivers with coordinates
      const allDrivers = await prisma.driver.findMany({
        where: {
          isVerified: true,
          isAvailable: true,
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
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true
            }
          }
        }
      });

      // Calculate distances and filter by radius
      const nearbyDrivers = allDrivers
        .map(driver => {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            driver.latitude!,
            driver.longitude!
          );
          return { ...driver, distance };
        })
        .filter(driver => driver.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      return nearbyDrivers;
    } catch (error) {
      logError(error, { 
        operation: 'get_nearby_trucks', 
        latitude, 
        longitude, 
        radius, 
        limit 
      });
      throw error;
    }
  }

  static async getTruckRecommendations(
    userId: string,
    limit = 10
  ): Promise<any[]> {
    try {
      logDatabase('select', 'truck_recommendations', { userId, limit });

      // Get user's booking history
      const userBookings = await prisma.booking.findMany({
        where: { userId },
        include: {
          driver: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });

      // Get preferred truck types from history
      const truckTypeCounts = userBookings.reduce((acc, booking) => {
        const truckType = booking.driver.truckType;
        acc[truckType] = (acc[truckType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const preferredTruckTypes = Object.keys(truckTypeCounts)
        .sort((a, b) => truckTypeCounts[b] - truckTypeCounts[a])
        .slice(0, 2);

      // Get recommended drivers based on preferences
      const where: Record<string, any> = {
        isVerified: true,
        isAvailable: true
      };

      if (preferredTruckTypes.length > 0) {
        where.truckType = {
          in: preferredTruckTypes
        };
      }

      const recommendations = await prisma.driver.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: {
          rating: 'desc'
        },
        take: limit
      });

      return recommendations;
    } catch (error) {
      logError(error, { 
        operation: 'get_truck_recommendations', 
        userId, 
        limit 
      });
      throw error;
    }
  }

  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      logDatabase('select', 'search_suggestions', { query });

      const suggestions: string[] = [];

      // Get location suggestions
      const locations = await prisma.driver.findMany({
        where: {
          location: {
            contains: query
          }
        },
        select: {
          location: true
        },
        distinct: ['location'],
        take: 5
      });

      suggestions.push(...locations.map(l => l.location));

      // Get truck type suggestions
      const truckTypes = ['MINI_TRUCK', 'PICKUP', 'LORRY', 'TRUCK'];
      const matchingTruckTypes = truckTypes.filter(type =>
        type.toLowerCase().includes(query.toLowerCase())
      );

      suggestions.push(...matchingTruckTypes);

      return [...new Set(suggestions)]; // Remove duplicates
    } catch (error) {
      logError(error, { 
        operation: 'get_search_suggestions', 
        query 
      });
      throw error;
    }
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