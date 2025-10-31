import { PrismaClient } from '@prisma/client';
import { logDatabase } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateTruckCategoryRequest {
  name: string;
  truckType: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  capacity: number;
  length: number;
  baseFare: number;
  insideDhakaRate: number;
  outsideDhakaRate: number;
  description?: string;
}

export interface UpdateTruckCategoryRequest {
  name?: string;
  truckType?: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  capacity?: number;
  length?: number;
  baseFare?: number;
  insideDhakaRate?: number;
  outsideDhakaRate?: number;
  description?: string;
  isActive?: boolean;
}

export class TruckCategoryService {
  static async createTruckCategory(data: CreateTruckCategoryRequest) {
    logDatabase('insert', 'truck_categories', { name: data.name, baseFare: data.baseFare });
    
    const truckCategory = await prisma.truckCategory.create({
      data: {
        name: data.name,
        truckType: data.truckType,
        capacity: data.capacity,
        length: data.length,
        baseFare: data.baseFare,
        insideDhakaRate: data.insideDhakaRate,
        outsideDhakaRate: data.outsideDhakaRate,
        description: data.description
      }
    });

    logDatabase('insert_success', 'truck_categories', { id: truckCategory.id, name: data.name });
    
    return truckCategory;
  }

  static async getAllTruckCategories(page = 1, limit = 10, includeInactive = false) {
    const skip = (page - 1) * limit;
    const where = includeInactive ? {} : { isActive: true };

    logDatabase('select', 'truck_categories', { page, limit, includeInactive });

    const [truckCategories, total] = await Promise.all([
      prisma.truckCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.truckCategory.count({ where })
    ]);

    return {
      truckCategories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getTruckCategoryById(id: string) {
    logDatabase('select', 'truck_categories', { id });

    const truckCategory = await prisma.truckCategory.findUnique({
      where: { id }
    });

    if (!truckCategory) {
      throw new Error('Truck category not found');
    }

    return truckCategory;
  }

  static async updateTruckCategory(id: string, data: UpdateTruckCategoryRequest) {
    logDatabase('update', 'truck_categories', { id, updateFields: Object.keys(data) });

    const truckCategory = await prisma.truckCategory.update({
      where: { id },
      data
    });

    logDatabase('update_success', 'truck_categories', { id });

    return truckCategory;
  }

  static async deleteTruckCategory(id: string) {
    logDatabase('delete', 'truck_categories', { id });

    const truckCategory = await prisma.truckCategory.delete({
      where: { id }
    });

    logDatabase('delete_success', 'truck_categories', { id });

    return truckCategory;
  }

  static async deactivateTruckCategory(id: string) {
    logDatabase('update', 'truck_categories', { id, action: 'deactivate' });

    const truckCategory = await prisma.truckCategory.update({
      where: { id },
      data: { isActive: false }
    });

    logDatabase('update_success', 'truck_categories', { id, action: 'deactivated' });

    return truckCategory;
  }

  static async activateTruckCategory(id: string) {
    logDatabase('update', 'truck_categories', { id, action: 'activate' });

    const truckCategory = await prisma.truckCategory.update({
      where: { id },
      data: { isActive: true }
    });

    logDatabase('update_success', 'truck_categories', { id, action: 'activated' });

    return truckCategory;
  }

  static async searchTruckCategories(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    logDatabase('select', 'truck_categories', { query, page, limit, operation: 'search' });

    const [truckCategories, total] = await Promise.all([
      prisma.truckCategory.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.truckCategory.count({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        }
      })
    ]);

    return {
      truckCategories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getTruckCategoryStats() {
    logDatabase('select', 'truck_categories', { operation: 'stats' });

    const [totalCategories, activeCategories, inactiveCategories] = await Promise.all([
      prisma.truckCategory.count(),
      prisma.truckCategory.count({ where: { isActive: true } }),
      prisma.truckCategory.count({ where: { isActive: false } })
    ]);

    return {
      totalCategories,
      activeCategories,
      inactiveCategories
    };
  }
} 