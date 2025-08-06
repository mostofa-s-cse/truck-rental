import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Area {
  id: string;
  name: string;
  city: string;
  state: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AreaFilters {
  city?: string;
  state?: string;
  search?: string;
  isActive?: boolean;
}

export class AreaService {
  /**
   * Get all areas with optional filtering
   */
  async getAllAreas(filters: AreaFilters = {}): Promise<Area[]> {
    try {
      const whereClause: any = {};

      // Apply filters
      if (filters.city) {
        whereClause.city = {
          contains: filters.city
        };
      }

      if (filters.state) {
        whereClause.state = {
          contains: filters.state
        };
      }

      if (filters.search) {
        whereClause.OR = [
          {
            name: {
              contains: filters.search
            }
          },
          {
            city: {
              contains: filters.search
            }
          },
          {
            state: {
              contains: filters.search
            }
          }
        ];
      }

      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }

      const areas = await prisma.area.findMany({
        where: whereClause,
        orderBy: [
          { state: 'asc' },
          { city: 'asc' },
          { name: 'asc' }
        ]
      });

      return areas;
    } catch (error) {
      console.error('Error fetching areas:', error);
      throw new Error('Failed to fetch areas');
    }
  }

  /**
   * Get areas grouped by state and city
   */
  async getAreasGrouped(): Promise<{
    [state: string]: {
      [city: string]: Area[]
    }
  }> {
    try {
      const areas = await prisma.area.findMany({
        where: { isActive: true },
        orderBy: [
          { state: 'asc' },
          { city: 'asc' },
          { name: 'asc' }
        ]
      });

      const grouped: { [state: string]: { [city: string]: Area[] } } = {};

      areas.forEach(area => {
        if (!grouped[area.state]) {
          grouped[area.state] = {};
        }
        if (!grouped[area.state][area.city]) {
          grouped[area.state][area.city] = [];
        }
        grouped[area.state][area.city].push(area);
      });

      return grouped;
    } catch (error) {
      console.error('Error fetching grouped areas:', error);
      throw new Error('Failed to fetch grouped areas');
    }
  }

  /**
   * Get areas in the format expected by the frontend dropdown
   */
  async getAreasForDropdown(): Promise<Array<{
    value: string;
    label: string;
    area: string;
  }>> {
    try {
      const areas = await prisma.area.findMany({
        where: { isActive: true },
        orderBy: [
          { state: 'asc' },
          { city: 'asc' },
          { name: 'asc' }
        ]
      });

      return areas.map(area => ({
        value: area.name.toLowerCase().replace(/\s+/g, '-'),
        label: area.name,
        area: area.state
      }));
    } catch (error) {
      console.error('Error fetching areas for dropdown:', error);
      throw new Error('Failed to fetch areas for dropdown');
    }
  }

  /**
   * Get area by ID
   */
  async getAreaById(id: string): Promise<Area | null> {
    try {
      const area = await prisma.area.findUnique({
        where: { id }
      });

      return area;
    } catch (error) {
      console.error('Error fetching area by ID:', error);
      throw new Error('Failed to fetch area');
    }
  }

  /**
   * Create a new area
   */
  async createArea(data: {
    name: string;
    city: string;
    state: string;
    isActive?: boolean;
  }): Promise<Area> {
    try {
      const area = await prisma.area.create({
        data: {
          name: data.name,
          city: data.city,
          state: data.state,
          isActive: data.isActive ?? true
        }
      });

      return area;
    } catch (error) {
      console.error('Error creating area:', error);
      throw new Error('Failed to create area');
    }
  }

  /**
   * Update an area
   */
  async updateArea(id: string, data: {
    name?: string;
    city?: string;
    state?: string;
    isActive?: boolean;
  }): Promise<Area> {
    try {
      const area = await prisma.area.update({
        where: { id },
        data
      });

      return area;
    } catch (error) {
      console.error('Error updating area:', error);
      throw new Error('Failed to update area');
    }
  }

  /**
   * Delete an area
   */
  async deleteArea(id: string): Promise<void> {
    try {
      await prisma.area.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting area:', error);
      throw new Error('Failed to delete area');
    }
  }

  /**
   * Get cities by state
   */
  async getCitiesByState(state: string): Promise<string[]> {
    try {
      const cities = await prisma.area.findMany({
        where: { 
          state: {
            contains: state
          },
          isActive: true
        },
        select: { city: true },
        distinct: ['city']
      });

      return cities.map(c => c.city);
    } catch (error) {
      console.error('Error fetching cities by state:', error);
      throw new Error('Failed to fetch cities');
    }
  }

  /**
   * Get states
   */
  async getStates(): Promise<string[]> {
    try {
      const states = await prisma.area.findMany({
        where: { isActive: true },
        select: { state: true },
        distinct: ['state']
      });

      return states.map(s => s.state);
    } catch (error) {
      console.error('Error fetching states:', error);
      throw new Error('Failed to fetch states');
    }
  }
} 