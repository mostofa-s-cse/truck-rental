import { PrismaClient } from '@prisma/client';
import { logDatabase } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateAreaRequest {
  name: string;
  city: string;
  state: string;
}

export interface UpdateAreaRequest {
  name?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
}

export class AreaService {
  static async createArea(data: CreateAreaRequest) {
    logDatabase('insert', 'areas', { name: data.name, city: data.city, state: data.state });
    
    const area = await prisma.area.create({
      data: {
        name: data.name,
        city: data.city,
        state: data.state
      }
    });

    logDatabase('insert_success', 'areas', { id: area.id, name: data.name });
    
    return area;
  }

  static async getAllAreas(page = 1, limit = 10, includeInactive = false) {
    const skip = (page - 1) * limit;
    const where = includeInactive ? {} : { isActive: true };

    logDatabase('select', 'areas', { page, limit, includeInactive });

    const [areas, total] = await Promise.all([
      prisma.area.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.area.count({ where })
    ]);

    return {
      areas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getAreaById(id: string) {
    logDatabase('select', 'areas', { id });

    const area = await prisma.area.findUnique({
      where: { id }
    });

    if (!area) {
      throw new Error('Area not found');
    }

    return area;
  }

  static async updateArea(id: string, data: UpdateAreaRequest) {
    logDatabase('update', 'areas', { id, updateFields: Object.keys(data) });

    const area = await prisma.area.update({
      where: { id },
      data
    });

    logDatabase('update_success', 'areas', { id });

    return area;
  }

  static async deleteArea(id: string) {
    logDatabase('delete', 'areas', { id });

    const area = await prisma.area.delete({
      where: { id }
    });

    logDatabase('delete_success', 'areas', { id });

    return area;
  }

  static async deactivateArea(id: string) {
    logDatabase('update', 'areas', { id, action: 'deactivate' });

    const area = await prisma.area.update({
      where: { id },
      data: { isActive: false }
    });

    logDatabase('update_success', 'areas', { id, action: 'deactivated' });

    return area;
  }

  static async activateArea(id: string) {
    logDatabase('update', 'areas', { id, action: 'activate' });

    const area = await prisma.area.update({
      where: { id },
      data: { isActive: true }
    });

    logDatabase('update_success', 'areas', { id, action: 'activated' });

    return area;
  }

  static async searchAreas(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    logDatabase('select', 'areas', { query, page, limit, operation: 'search' });

    const [areas, total] = await Promise.all([
      prisma.area.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { city: { contains: query } },
            { state: { contains: query } }
          ]
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.area.count({
        where: {
          OR: [
            { name: { contains: query } },
            { city: { contains: query } },
            { state: { contains: query } }
          ]
        }
      })
    ]);

    return {
      areas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getAreasByCity(city: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    logDatabase('select', 'areas', { city, page, limit, operation: 'by_city' });

    const [areas, total] = await Promise.all([
      prisma.area.findMany({
        where: {
          city: { contains: city },
          isActive: true
        },
        skip,
        take: limit,
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.area.count({
        where: {
          city: { contains: city },
          isActive: true
        }
      })
    ]);

    return {
      areas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getAreasByState(state: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    logDatabase('select', 'areas', { state, page, limit, operation: 'by_state' });

    const [areas, total] = await Promise.all([
      prisma.area.findMany({
        where: {
          state: { contains: state },
          isActive: true
        },
        skip,
        take: limit,
        orderBy: [
          { city: 'asc' },
          { name: 'asc' }
        ]
      }),
      prisma.area.count({
        where: {
          state: { contains: state },
          isActive: true
        }
      })
    ]);

    return {
      areas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getAreaStats() {
    logDatabase('select', 'areas', { operation: 'stats' });

    const [totalAreas, activeAreas, inactiveAreas, uniqueCities, uniqueStates] = await Promise.all([
      prisma.area.count(),
      prisma.area.count({ where: { isActive: true } }),
      prisma.area.count({ where: { isActive: false } }),
      prisma.area.groupBy({
        by: ['city'],
        _count: { city: true }
      }),
      prisma.area.groupBy({
        by: ['state'],
        _count: { state: true }
      })
    ]);

    return {
      totalAreas,
      activeAreas,
      inactiveAreas,
      uniqueCities: uniqueCities.length,
      uniqueStates: uniqueStates.length
    };
  }
} 