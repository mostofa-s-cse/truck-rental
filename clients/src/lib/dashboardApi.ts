import { apiClient } from './api';

export interface DashboardStats {
  totalUsers: number;
  totalDrivers: number;
  totalBookings: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeBookings: number;
}

export interface DriverStats {
  totalTrips: number;
  averageRating: number;
  completionRate: number;
  responseTime: string;
}

export interface UserStats {
  totalBookings: number;
  totalSpent: number;
  averageRating: number;
  favoriteDrivers: number;
}

export interface Booking {
  id: string;
  user?: string;
  driver?: string;
  source: string;
  destination: string;
  fare: number;
  status: string;
  date: string;
  pickupTime?: string;
  distance?: number;
  rating?: number;
  driverRating?: number;
}

export interface Driver {
  id: string;
  name: string;
  truckType: string;
  capacity: number;
  rating: number;
  distance: number;
  isAvailable: boolean;
  location: string;
}

export interface DriverVerification {
  id: string;
  name: string;
  email: string;
  truckType: string;
  submittedAt: string;
}

export interface Earnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalEarnings: number;
}

// Admin Dashboard APIs
export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.getClient().get('/admin/dashboard/stats');
    return response.data;
  },

  getPendingVerifications: async (): Promise<DriverVerification[]> => {
    const response = await apiClient.getClient().get('/admin/drivers/pending-verifications');
    return response.data;
  },

  getRecentBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.getClient().get('/admin/bookings/recent');
    return response.data;
  },

  approveDriver: async (driverId: string): Promise<void> => {
    await apiClient.getClient().put(`/admin/drivers/${driverId}/verify`, { isVerified: true });
  },

  rejectDriver: async (driverId: string): Promise<void> => {
    await apiClient.getClient().put(`/admin/drivers/${driverId}/verify`, { isVerified: false });
  }
};

// Driver Dashboard APIs
export const driverApi = {
  getDriverStats: async (): Promise<DriverStats> => {
    const response = await apiClient.getClient().get('/driver/stats');
    return response.data;
  },

  getEarnings: async (): Promise<Earnings> => {
    const response = await apiClient.getClient().get('/driver/earnings');
    return response.data;
  },

  getRecentBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.getClient().get('/driver/bookings/recent');
    return response.data;
  },

  updateAvailability: async (isAvailable: boolean): Promise<void> => {
    await apiClient.getClient().put('/driver/availability', { isAvailable });
  },

  acceptBooking: async (bookingId: string): Promise<void> => {
    await apiClient.getClient().put(`/driver/bookings/${bookingId}/accept`);
  },

  declineBooking: async (bookingId: string): Promise<void> => {
    await apiClient.getClient().put(`/driver/bookings/${bookingId}/decline`);
  }
};

// User Dashboard APIs
export const userApi = {
  getUserStats: async (): Promise<UserStats> => {
    const response = await apiClient.getClient().get('/user/stats');
    return response.data;
  },

  getRecentBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.getClient().get('/user/bookings/recent');
    return response.data;
  },

  getNearbyDrivers: async (): Promise<Driver[]> => {
    const response = await apiClient.getClient().get('/user/drivers/nearby');
    return response.data;
  },

  searchDrivers: async (params: {
    location?: string;
    truckType?: string;
    capacity?: string;
  }): Promise<Driver[]> => {
    const response = await apiClient.getClient().get('/user/drivers/search', { params });
    return response.data;
  },

  calculateFare: async (params: {
    source: string;
    destination: string;
    truckType: string;
  }): Promise<{ fare: number; distance: number }> => {
    const response = await apiClient.getClient().post('/fare/calculate', params);
    return response.data;
  }
};

// Mock data for development
export const mockData = {
  adminStats: {
    totalUsers: 1250,
    totalDrivers: 342,
    totalBookings: 2847,
    totalRevenue: 125000,
    pendingVerifications: 15,
    activeBookings: 23
  },

  driverStats: {
    totalTrips: 150,
    averageRating: 4.8,
    completionRate: 98.5,
    responseTime: '2.3 min'
  },

  userStats: {
    totalBookings: 24,
    totalSpent: 1245.75,
    averageRating: 4.7,
    favoriteDrivers: 3
  },

  earnings: {
    today: 125.50,
    thisWeek: 847.25,
    thisMonth: 3240.75,
    totalEarnings: 15680.50
  }
}; 