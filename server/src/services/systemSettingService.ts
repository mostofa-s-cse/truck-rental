import { PrismaClient } from '@prisma/client';
import { logDatabase } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateSystemSettingRequest {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

export interface UpdateSystemSettingRequest {
  value: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
}

export class SystemSettingService {
  static async createSystemSetting(data: CreateSystemSettingRequest) {
    logDatabase('insert', 'system_settings', { key: data.key, type: data.type });
    
    const systemSetting = await prisma.systemSetting.create({
      data: {
        key: data.key,
        value: data.value,
        type: data.type
      }
    });

    logDatabase('insert_success', 'system_settings', { id: systemSetting.id, key: data.key });
    
    return systemSetting;
  }

  static async getAllSystemSettings(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    logDatabase('select', 'system_settings', { page, limit });

    const [systemSettings, total] = await Promise.all([
      prisma.systemSetting.findMany({
        skip,
        take: limit,
        orderBy: {
          key: 'asc'
        }
      }),
      prisma.systemSetting.count()
    ]);

    return {
      systemSettings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getSystemSettingByKey(key: string) {
    logDatabase('select', 'system_settings', { key });

    const systemSetting = await prisma.systemSetting.findUnique({
      where: { key }
    });

    if (!systemSetting) {
      throw new Error('System setting not found');
    }

    return systemSetting;
  }

  static async updateSystemSetting(key: string, data: UpdateSystemSettingRequest) {
    logDatabase('update', 'system_settings', { key, updateFields: Object.keys(data) });

    const systemSetting = await prisma.systemSetting.update({
      where: { key },
      data
    });

    logDatabase('update_success', 'system_settings', { key });

    return systemSetting;
  }

  static async deleteSystemSetting(key: string) {
    logDatabase('delete', 'system_settings', { key });

    const systemSetting = await prisma.systemSetting.delete({
      where: { key }
    });

    logDatabase('delete_success', 'system_settings', { key });

    return systemSetting;
  }

  static async getSystemSettingsByType(type: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    logDatabase('select', 'system_settings', { type, page, limit, operation: 'by_type' });

    const [systemSettings, total] = await Promise.all([
      prisma.systemSetting.findMany({
        where: { type },
        skip,
        take: limit,
        orderBy: {
          key: 'asc'
        }
      }),
      prisma.systemSetting.count({ where: { type } })
    ]);

    return {
      systemSettings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async searchSystemSettings(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    logDatabase('select', 'system_settings', { query, page, limit, operation: 'search' });

    const [systemSettings, total] = await Promise.all([
      prisma.systemSetting.findMany({
        where: {
          OR: [
            { key: { contains: query } },
            { value: { contains: query } }
          ]
        },
        skip,
        take: limit,
        orderBy: {
          key: 'asc'
        }
      }),
      prisma.systemSetting.count({
        where: {
          OR: [
            { key: { contains: query } },
            { value: { contains: query } }
          ]
        }
      })
    ]);

    return {
      systemSettings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getSystemSettingStats() {
    logDatabase('select', 'system_settings', { operation: 'stats' });

    const [totalSettings, settingsByType] = await Promise.all([
      prisma.systemSetting.count(),
      prisma.systemSetting.groupBy({
        by: ['type'],
        _count: { type: true }
      })
    ]);

    const typeStats = settingsByType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSettings,
      typeStats
    };
  }

  static async getMultipleSystemSettings(keys: string[]) {
    logDatabase('select', 'system_settings', { keys, operation: 'multiple' });

    const systemSettings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: keys
        }
      }
    });

    // Convert to key-value object for easier access
    const settingsObject = systemSettings.reduce((acc, setting) => {
      acc[setting.key] = setting;
      return acc;
    }, {} as Record<string, any>);

    return settingsObject;
  }

  static async bulkUpdateSystemSettings(updates: Array<{ key: string; value: string; type?: string }>) {
    logDatabase('update', 'system_settings', { updates: updates.length, operation: 'bulk_update' });

    const updatePromises = updates.map(update => 
      prisma.systemSetting.update({
        where: { key: update.key },
        data: {
          value: update.value,
          ...(update.type && { type: update.type })
        }
      })
    );

    const results = await Promise.all(updatePromises);

    logDatabase('update_success', 'system_settings', { updatedCount: results.length, operation: 'bulk_update' });

    return results;
  }
} 