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

      // Build comprehensive where clause based on all filters
      
      // Truck Type Filter
      if (filters.truckType) {
        where.truckType = filters.truckType;
      }

      // Capacity Filter (minimum capacity)
      if (filters.capacity && filters.capacity > 0) {
        where.capacity = {
          gte: filters.capacity
        };
      }

      // Rating Filter (minimum rating)
      if (filters.rating && filters.rating > 0) {
        where.rating = {
          gte: filters.rating
        };
      }

      // Availability Filter
      if (filters.availability !== undefined) {
        where.isAvailable = filters.availability;
      }

      // Verification Filter
      if (filters.verified !== undefined) {
        where.isVerified = filters.verified;
      }

      // Quality Filter
      if (filters.quality) {
        where.quality = filters.quality;
      }

      // Location Filter will be applied after fetching results for case-insensitive search
      const locationFilter = filters.location?.trim().toLowerCase();

      // Get all drivers with comprehensive filtering
      let allDrivers = await prisma.driver.findMany({
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
        orderBy: [
          { rating: 'desc' },
          { totalTrips: 'desc' },
          { isVerified: 'desc' }
        ]
      });

      // Apply location filter if specified (case-insensitive)
      if (locationFilter) {
        allDrivers = allDrivers.filter(driver => 
          driver.location.toLowerCase().includes(locationFilter)
        );
      }

      // Apply distance-based filtering and sorting if coordinates provided
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
            if (filters.radius && filters.radius > 0 && driver.distance !== undefined) {
              return driver.distance <= filters.radius;
            }
            return true;
          })
          .sort((a, b) => {
            // Sort by distance if available, then by rating
            if (a.distance !== undefined && b.distance !== undefined) {
              return a.distance - b.distance;
            }
            if (a.distance !== undefined) return -1;
            if (b.distance !== undefined) return 1;
            return b.rating - a.rating;
          });
      }

      // Apply price range filter if specified
      if (filters.priceRange) {
        driversWithDistance = driversWithDistance.filter(driver => {
          // This would need to be implemented based on your pricing logic
          // For now, we'll assume all drivers are within range
          return true;
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

  static async getAllTrucks(limit?: number): Promise<any[]> {
    try {
      logDatabase('select', 'all_trucks', { limit });

      const result = await prisma.driver.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true }
          },
          reviews: {
            select: { rating: true }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        take: limit
      });

      return result;
    } catch (error) {
      logError(error, { operation: 'get_all_trucks', limit });
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

      // Get quality suggestions
      const qualities = ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR'];
      const matchingQualities = qualities.filter(quality =>
        quality.toLowerCase().includes(query.toLowerCase())
      );

      suggestions.push(...matchingQualities);

      return [...new Set(suggestions)]; // Remove duplicates
    } catch (error) {
      logError(error, { 
        operation: 'get_search_suggestions', 
        query 
      });
      throw error;
    }
  }

  // Advanced search with additional filtering options
  static async advancedSearch(
    filters: SearchFilters & {
      sortBy?: 'rating' | 'distance' | 'price' | 'totalTrips';
      sortOrder?: 'asc' | 'desc';
      minTrips?: number;
      maxTrips?: number;
      experienceYears?: number;
    },
    page = 1,
    limit = 10
  ): Promise<SearchResult> {
    try {
      const skip = (page - 1) * limit;

      logDatabase('select', 'advanced_search', { filters, page, limit });

      const where: Record<string, any> = {};

      // Apply all basic filters
      if (filters.truckType) {
        where.truckType = filters.truckType;
      }

      if (filters.capacity && filters.capacity > 0) {
        where.capacity = {
          gte: filters.capacity
        };
      }

      if (filters.rating && filters.rating > 0) {
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

      // Location filter will be applied after fetching results for case-insensitive search
      const locationFilter = filters.location?.trim().toLowerCase();

      // Advanced filters
      if (filters.minTrips && filters.minTrips > 0) {
        where.totalTrips = {
          gte: filters.minTrips
        };
      }

      if (filters.maxTrips && filters.maxTrips > 0) {
        where.totalTrips = {
          ...where.totalTrips,
          lte: filters.maxTrips
        };
      }

      // Get drivers with advanced filtering
      let allDrivers = await prisma.driver.findMany({
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
        }
      });

      // Apply location filter if specified (case-insensitive)
      if (locationFilter) {
        allDrivers = allDrivers.filter(driver => 
          driver.location.toLowerCase().includes(locationFilter)
        );
      }

      // Apply distance filtering if coordinates provided
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
            if (filters.radius && filters.radius > 0 && driver.distance !== undefined) {
              return driver.distance <= filters.radius;
            }
            return true;
          });
      }

      // Apply custom sorting
      const sortBy = filters.sortBy || 'rating';
      const sortOrder = filters.sortOrder || 'desc';

      driversWithDistance.sort((a: any, b: any) => {
        let comparison = 0;

        switch (sortBy) {
          case 'rating':
            comparison = a.rating - b.rating;
            break;
          case 'distance':
            if (a.distance !== undefined && b.distance !== undefined) {
              comparison = a.distance - b.distance;
            } else if (a.distance !== undefined) {
              comparison = -1;
            } else if (b.distance !== undefined) {
              comparison = 1;
            }
            break;
          case 'totalTrips':
            comparison = a.totalTrips - b.totalTrips;
            break;
          case 'price':
            // This would need to be implemented based on your pricing logic
            comparison = 0;
            break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });

      // Apply pagination
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
        operation: 'advanced_search', 
        filters, 
        page, 
        limit 
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

  // Statistics methods
  static async getTotalDrivers(): Promise<number> {
    try {
      return await prisma.driver.count();
    } catch (error) {
      logError(error, { operation: 'get_total_drivers' });
      throw error;
    }
  }

  static async getAvailableDrivers(): Promise<number> {
    try {
      return await prisma.driver.count({
        where: { isAvailable: true }
      });
    } catch (error) {
      logError(error, { operation: 'get_available_drivers' });
      throw error;
    }
  }

  static async getVerifiedDrivers(): Promise<number> {
    try {
      return await prisma.driver.count({
        where: { isVerified: true }
      });
    } catch (error) {
      logError(error, { operation: 'get_verified_drivers' });
      throw error;
    }
  }

  static async getAverageRating(): Promise<number> {
    try {
      const result = await prisma.driver.aggregate({
        _avg: {
          rating: true
        }
      });
      return result._avg.rating || 0;
    } catch (error) {
      logError(error, { operation: 'get_average_rating' });
      throw error;
    }
  }

  static async getTruckTypeStats(): Promise<Array<{ truckType: string; count: number }>> {
    try {
      const stats = await prisma.driver.groupBy({
        by: ['truckType'],
        _count: {
          truckType: true
        }
      });

      return stats.map(stat => ({
        truckType: stat.truckType,
        count: stat._count.truckType
      }));
    } catch (error) {
      logError(error, { operation: 'get_truck_type_stats' });
      throw error;
    }
  }
} 