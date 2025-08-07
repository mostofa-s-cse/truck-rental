import { PrismaClient } from '@prisma/client';
import { logDatabase } from '../utils/logger';

const prisma = new PrismaClient();

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface AreaSearchResult {
  id: string;
  name: string;
  city: string;
  state: string;
  distance: number; // in km
  latitude: number;
  longitude: number;
  address: string;
}

export interface AreaSearchRequest {
  query: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in km, default 50
  limit?: number; // default 20
}

export class AreaSearchService {
  private static readonly DEFAULT_RADIUS = 50; // km
  private static readonly DEFAULT_LIMIT = 20;

  /**
   * Search for areas dynamically using Google Places API
   */
  static async searchAreas(request: AreaSearchRequest): Promise<AreaSearchResult[]> {
    const { query, latitude, longitude, radius = this.DEFAULT_RADIUS, limit = this.DEFAULT_LIMIT } = request;

    logDatabase('select', 'area_search', { query, latitude, longitude, radius, limit });

    try {
      let results: AreaSearchResult[] = [];

      // If we have coordinates, search nearby places
      if (latitude && longitude) {
        results = await this.searchNearbyPlaces(query, latitude, longitude, radius, limit);
      } else {
        // Otherwise, search by text query
        results = await this.searchByTextQuery(query, limit);
      }

      // If no results from Google Places, fallback to basic search
      if (results.length === 0) {
        results = await this.fallbackSearch(query, limit);
      }

      logDatabase('select_success', 'area_search', { 
        query, 
        resultsCount: results.length 
      });

      return results;
    } catch (error) {
      logDatabase('select_error', 'area_search', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        request 
      });
      
      // Fallback to basic search on error
      return await this.fallbackSearch(query, limit);
    }
  }

  /**
   * Search for nearby places using OpenStreetMap Nominatim
   */
  private static async searchNearbyPlaces(
    query: string, 
    latitude: number, 
    longitude: number, 
    radius: number, 
    limit: number
  ): Promise<AreaSearchResult[]> {
    try {
      const results: AreaSearchResult[] = [];
      
      // Search using Nominatim with viewbox for nearby results
      const viewbox = this.calculateViewbox(latitude, longitude, radius);
      const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&viewbox=${viewbox}&bounded=1&limit=${limit}&addressdetails=1&countrycodes=bd`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'TruckLagbe/1.0 (https://trucklagbe.com; contact@trucklagbe.com)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }
      
      const data = await response.json() as any[];

      for (const place of data) {
        const distance = this.calculateDistance(latitude, longitude, parseFloat(place.lat), parseFloat(place.lon));
        
        const city = place.address?.city || place.address?.town || place.address?.district || 'Unknown';
        const state = place.address?.state || 'Bangladesh';
        
        const areaData = {
          id: place.place_id,
          name: place.display_name.split(',')[0] || place.name || 'Unknown',
          city,
          state,
          distance,
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
          address: place.display_name
        };
        
        results.push(areaData);
        
        // Save to database for tracking popular searches
        await this.saveSearchResult({
          placeId: place.place_id.toString(),
          name: areaData.name,
          city: areaData.city,
          state: areaData.state,
          country: 'Bangladesh',
          latitude: areaData.latitude,
          longitude: areaData.longitude,
          address: areaData.address
        });
      }

      // Sort by distance and limit results
      return results
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

    } catch (error) {
      console.warn('OpenStreetMap Nominatim error, using fallback:', error instanceof Error ? error.message : 'Unknown error');
      return this.fallbackSearch(query, limit);
    }
  }

  /**
   * Search by text query using OpenStreetMap Nominatim
   */
  private static async searchByTextQuery(query: string, limit: number): Promise<AreaSearchResult[]> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=${limit}&addressdetails=1&countrycodes=bd`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TruckLagbe/1.0 (https://trucklagbe.com; contact@trucklagbe.com)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }
      
      const data = await response.json() as any[];

      const results = [];
      for (const place of data) {
        const city = place.address?.city || place.address?.town || place.address?.district || 'Unknown';
        const state = place.address?.state || 'Bangladesh';
        
        const areaData = {
          id: place.place_id,
          name: place.display_name.split(',')[0] || place.name || 'Unknown',
          city,
          state,
          distance: 0, // No reference point for distance
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
          address: place.display_name
        };
        
        results.push(areaData);
        
        // Save to database for tracking popular searches
        await this.saveSearchResult({
          placeId: place.place_id.toString(),
          name: areaData.name,
          city: areaData.city,
          state: areaData.state,
          country: 'Bangladesh',
          latitude: areaData.latitude,
          longitude: areaData.longitude,
          address: areaData.address
        });
      }
      
      return results;
    } catch (error) {
      console.warn('OpenStreetMap Nominatim error, using fallback:', error instanceof Error ? error.message : 'Unknown error');
      return this.fallbackSearch(query, limit);
    }
  }

  /**
   * Fallback search using basic text matching
   */
  private static async fallbackSearch(query: string, limit: number): Promise<AreaSearchResult[]> {
    // Common areas in Bangladesh for fallback
    const commonAreas = [
      { name: 'Dhaka', city: 'Dhaka', state: 'Dhaka', lat: 23.8103, lng: 90.4125 },
      { name: 'Chittagong', city: 'Chittagong', state: 'Chittagong', lat: 22.3569, lng: 91.7832 },
      { name: 'Sylhet', city: 'Sylhet', state: 'Sylhet', lat: 24.8949, lng: 91.8687 },
      { name: 'Rajshahi', city: 'Rajshahi', state: 'Rajshahi', lat: 24.3745, lng: 88.6042 },
      { name: 'Khulna', city: 'Khulna', state: 'Khulna', lat: 22.8456, lng: 89.5403 },
      { name: 'Barisal', city: 'Barisal', state: 'Barisal', lat: 22.7010, lng: 90.3535 },
      { name: 'Rangpur', city: 'Rangpur', state: 'Rangpur', lat: 25.7439, lng: 89.2752 },
      { name: 'Mymensingh', city: 'Mymensingh', state: 'Mymensingh', lat: 24.7471, lng: 90.4203 },
      { name: 'Comilla', city: 'Comilla', state: 'Chittagong', lat: 23.4607, lng: 91.1809 },
      { name: 'Narayanganj', city: 'Narayanganj', state: 'Dhaka', lat: 23.6237, lng: 90.5000 },
      { name: 'Gazipur', city: 'Gazipur', state: 'Dhaka', lat: 23.9999, lng: 90.4203 },
      { name: 'Savar', city: 'Savar', state: 'Dhaka', lat: 23.8567, lng: 90.2600 },
      { name: 'Tongi', city: 'Tongi', state: 'Dhaka', lat: 23.8917, lng: 90.4023 },
      { name: 'Gulshan', city: 'Dhaka', state: 'Dhaka', lat: 23.7937, lng: 90.4066 },
      { name: 'Banani', city: 'Dhaka', state: 'Dhaka', lat: 23.7937, lng: 90.4066 },
      { name: 'Uttara', city: 'Dhaka', state: 'Dhaka', lat: 23.8700, lng: 90.3700 },
      { name: 'Dhanmondi', city: 'Dhaka', state: 'Dhaka', lat: 23.7467, lng: 90.3700 },
      { name: 'Mirpur', city: 'Dhaka', state: 'Dhaka', lat: 23.8000, lng: 90.3500 },
      { name: 'Tejgaon', city: 'Dhaka', state: 'Dhaka', lat: 23.7600, lng: 90.4000 },
      { name: 'Rampura', city: 'Dhaka', state: 'Dhaka', lat: 23.7600, lng: 90.4200 },
      { name: 'Badda', city: 'Dhaka', state: 'Dhaka', lat: 23.7800, lng: 90.4200 },
      { name: 'Bashundhara', city: 'Dhaka', state: 'Dhaka', lat: 23.8100, lng: 90.4200 },
      { name: 'Niketan', city: 'Dhaka', state: 'Dhaka', lat: 23.7900, lng: 90.4100 },
      { name: 'Nikunja', city: 'Dhaka', state: 'Dhaka', lat: 23.8000, lng: 90.4200 },
      { name: 'Khilkhet', city: 'Dhaka', state: 'Dhaka', lat: 23.8200, lng: 90.4200 },
      { name: 'Airport', city: 'Dhaka', state: 'Dhaka', lat: 23.8433, lng: 90.3978 },
      { name: 'Shahbagh', city: 'Dhaka', state: 'Dhaka', lat: 23.7400, lng: 90.3900 },
      { name: 'New Market', city: 'Dhaka', state: 'Dhaka', lat: 23.7400, lng: 90.3700 },
      { name: 'Kalabagan', city: 'Dhaka', state: 'Dhaka', lat: 23.7500, lng: 90.3700 },
      { name: 'Sukrabad', city: 'Dhaka', state: 'Dhaka', lat: 23.7500, lng: 90.3800 },
      { name: 'Adabor', city: 'Dhaka', state: 'Dhaka', lat: 23.7500, lng: 90.3600 },
      { name: 'Shyamoli', city: 'Dhaka', state: 'Dhaka', lat: 23.7600, lng: 90.3600 },
      { name: 'Agargaon', city: 'Dhaka', state: 'Dhaka', lat: 23.7700, lng: 90.3800 },
      { name: 'Wari', city: 'Dhaka', state: 'Dhaka', lat: 23.7200, lng: 90.4000 },
      { name: 'Gandaria', city: 'Dhaka', state: 'Dhaka', lat: 23.7200, lng: 90.4100 },
      { name: 'Jigatola', city: 'Dhaka', state: 'Dhaka', lat: 23.7300, lng: 90.4100 },
      { name: 'Hazaribagh', city: 'Dhaka', state: 'Dhaka', lat: 23.7300, lng: 90.4200 },
      { name: 'Lalbagh', city: 'Dhaka', state: 'Dhaka', lat: 23.7200, lng: 90.3800 },
      { name: 'Chawkbazar', city: 'Dhaka', state: 'Dhaka', lat: 23.7200, lng: 90.3900 },
      { name: 'Demra', city: 'Dhaka', state: 'Dhaka', lat: 23.7500, lng: 90.4400 },
      { name: 'Sabujbagh', city: 'Dhaka', state: 'Dhaka', lat: 23.7400, lng: 90.4400 },
      { name: 'Shahjahanpur', city: 'Dhaka', state: 'Dhaka', lat: 23.7300, lng: 90.4400 },
      { name: 'Uttarkhan', city: 'Dhaka', state: 'Dhaka', lat: 23.8500, lng: 90.4200 },
      { name: 'Dakshinkhan', city: 'Dhaka', state: 'Dhaka', lat: 23.8400, lng: 90.4200 },
      { name: 'Vatiara', city: 'Dhaka', state: 'Dhaka', lat: 23.8300, lng: 90.4200 },
      { name: 'Tongi', city: 'Gazipur', state: 'Dhaka', lat: 23.8917, lng: 90.4023 },
      { name: 'Gazipur', city: 'Gazipur', state: 'Dhaka', lat: 23.9999, lng: 90.4203 },
      { name: 'Savar', city: 'Savar', state: 'Dhaka', lat: 23.8567, lng: 90.2600 },
      { name: 'Narayanganj', city: 'Narayanganj', state: 'Dhaka', lat: 23.6237, lng: 90.5000 },
      { name: 'Keraniganj', city: 'Keraniganj', state: 'Dhaka', lat: 23.7000, lng: 90.3500 },
      { name: 'Dohar', city: 'Dohar', state: 'Dhaka', lat: 23.6000, lng: 90.1500 },
      { name: 'Nawabganj', city: 'Nawabganj', state: 'Dhaka', lat: 23.6000, lng: 90.1000 },
      { name: 'Dhamrai', city: 'Dhamrai', state: 'Dhaka', lat: 23.9000, lng: 90.2000 },
      { name: 'Munshiganj', city: 'Munshiganj', state: 'Dhaka', lat: 23.5500, lng: 90.5500 },
      { name: 'Manikganj', city: 'Manikganj', state: 'Dhaka', lat: 23.8500, lng: 90.0000 },
      { name: 'Tangail', city: 'Tangail', state: 'Dhaka', lat: 24.2500, lng: 89.9200 },
      { name: 'Narsingdi', city: 'Narsingdi', state: 'Dhaka', lat: 23.9200, lng: 90.7200 },
      { name: 'Kishoreganj', city: 'Kishoreganj', state: 'Dhaka', lat: 24.4400, lng: 90.7800 },
      { name: 'Gopalganj', city: 'Gopalganj', state: 'Dhaka', lat: 23.0000, lng: 89.8200 },
      { name: 'Madaripur', city: 'Madaripur', state: 'Dhaka', lat: 23.1700, lng: 90.2000 },
      { name: 'Shariatpur', city: 'Shariatpur', state: 'Dhaka', lat: 23.2000, lng: 90.3500 },
      { name: 'Rajbari', city: 'Rajbari', state: 'Dhaka', lat: 23.7500, lng: 89.6500 },
      { name: 'Faridpur', city: 'Faridpur', state: 'Dhaka', lat: 23.6000, lng: 89.8400 },
    ];

    const searchQuery = query.toLowerCase();
    const filteredAreas = commonAreas
      .filter(area => 
        area.name.toLowerCase().includes(searchQuery) ||
        area.city.toLowerCase().includes(searchQuery) ||
        area.state.toLowerCase().includes(searchQuery)
      )
      .slice(0, limit)
      .map(area => ({
        id: `fallback-${area.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: area.name,
        city: area.city,
        state: area.state,
        distance: 0, // No reference point for distance
        latitude: area.lat,
        longitude: area.lng,
        address: `${area.name}, ${area.city}, ${area.state}`
      }));

    return filteredAreas;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  /**
   * Calculate viewbox for Nominatim search
   */
  private static calculateViewbox(lat: number, lng: number, radiusKm: number): string {
    const latDelta = radiusKm / 111.32; // Approximate km per degree latitude
    const lngDelta = radiusKm / (111.32 * Math.cos(this.toRadians(lat))); // Approximate km per degree longitude
    
    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;
    
    return `${minLng},${maxLat},${maxLng},${minLat}`;
  }

  /**
   * Save search result to database for tracking popular searches
   */
  static async saveSearchResult(areaData: {
    placeId: string;
    name: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
    address: string;
  }): Promise<void> {
    try {
      await prisma.areaSearch.upsert({
        where: { placeId: areaData.placeId },
        update: {
          searchCount: { increment: 1 },
          lastSearched: new Date(),
          updatedAt: new Date()
        },
        create: {
          placeId: areaData.placeId,
          name: areaData.name,
          city: areaData.city,
          state: areaData.state,
          country: areaData.country,
          latitude: areaData.latitude,
          longitude: areaData.longitude,
          address: areaData.address,
          searchCount: 1,
          lastSearched: new Date(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error saving search result:', error);
    }
  }

  /**
   * Get areas for dropdown - now returns popular areas from Bangladesh
   */
  static async getAreasForDropdown(): Promise<Array<{
    value: string;
    label: string;
    area: string;
    latitude: number;
    longitude: number;
  }>> {
    try {
      logDatabase('select', 'area_search', { purpose: 'dropdown' });

      // Return popular areas in Bangladesh for dropdown
      const popularAreas = [
        { name: 'Dhaka Central', city: 'Dhaka', state: 'Dhaka', lat: 23.8103, lng: 90.4125 },
        { name: 'Gulshan', city: 'Dhaka', state: 'Dhaka', lat: 23.7937, lng: 90.4066 },
        { name: 'Banani', city: 'Dhaka', state: 'Dhaka', lat: 23.7937, lng: 90.4066 },
        { name: 'Baridhara', city: 'Dhaka', state: 'Dhaka', lat: 23.7937, lng: 90.4066 },
        { name: 'Uttara', city: 'Dhaka', state: 'Dhaka', lat: 23.8709, lng: 90.3835 },
        { name: 'Mirpur', city: 'Dhaka', state: 'Dhaka', lat: 23.8067, lng: 90.3687 },
        { name: 'Dhanmondi', city: 'Dhaka', state: 'Dhaka', lat: 23.7465, lng: 90.3760 },
        { name: 'Mohammadpur', city: 'Dhaka', state: 'Dhaka', lat: 23.7465, lng: 90.3760 },
        { name: 'Chittagong Central', city: 'Chittagong', state: 'Chittagong', lat: 22.3419, lng: 91.8132 },
        { name: 'Sylhet Central', city: 'Sylhet', state: 'Sylhet', lat: 24.8949, lng: 91.8687 },
        { name: 'Rajshahi Central', city: 'Rajshahi', state: 'Rajshahi', lat: 24.3745, lng: 88.6042 },
        { name: 'Khulna Central', city: 'Khulna', state: 'Khulna', lat: 22.8456, lng: 89.5403 },
        { name: 'Barisal Central', city: 'Barisal', state: 'Barisal', lat: 22.7010, lng: 90.3535 },
        { name: 'Rangpur Central', city: 'Rangpur', state: 'Rangpur', lat: 25.7439, lng: 89.2752 },
        { name: 'Mymensingh Central', city: 'Mymensingh', state: 'Mymensingh', lat: 24.7471, lng: 90.4203 },
        { name: 'Comilla Central', city: 'Comilla', state: 'Chittagong', lat: 23.4607, lng: 91.1809 },
        { name: 'Narayanganj Central', city: 'Narayanganj', state: 'Dhaka', lat: 23.6237, lng: 90.5000 },
        { name: 'Gazipur Central', city: 'Gazipur', state: 'Dhaka', lat: 24.0023, lng: 90.4264 },
        { name: 'Tangail Central', city: 'Tangail', state: 'Dhaka', lat: 24.2513, lng: 89.9167 },
        { name: 'Bogra Central', city: 'Bogra', state: 'Rajshahi', lat: 24.8484, lng: 89.3714 }
      ];

      logDatabase('select_success', 'area_search', { 
        count: popularAreas.length,
        purpose: 'dropdown'
      });

      return popularAreas.map(area => ({
        value: `${area.name}, ${area.city}`,
        label: area.name,
        area: `${area.city}, ${area.state}`,
        latitude: area.lat,
        longitude: area.lng
      }));
    } catch (error) {
      logDatabase('select_error', 'area_search', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        purpose: 'dropdown'
      });
      
      // Return empty array if error
      return [];
    }
  }
} 