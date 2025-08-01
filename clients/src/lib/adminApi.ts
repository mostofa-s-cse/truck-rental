import { apiClient } from './api';

// Types for Admin Dashboard
export interface AdminDashboardStats {
  stats: {
    totalUsers: number;
    totalDrivers: number;
    totalBookings: number;
    pendingBookings: number;
    completedBookings: number;
    totalRevenue: number;
    averageRating: number;
    activeDrivers: number;
  };
  recentBookings: Booking[];
  topDrivers: Driver[];
}

export interface BookingAnalytics {
  totalBookings: number;
  statusCounts: Record<string, number>;
  revenue: number;
  dailyStats: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
}

export interface DriverAnalytics {
  totalDrivers: number;
  verifiedDrivers: number;
  activeDrivers: number;
  averageRating: number;
  totalRevenue: number;
  driverStats: Array<{
    id: string;
    name: string;
    email: string;
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    averageRating: number;
    isVerified: boolean;
    isAvailable: boolean;
  }>;
}

export interface RevenueReport {
  totalRevenue: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  paymentMethods: Array<{
    method: string;
    revenue: number;
    percentage: number;
  }>;
  topEarningDrivers: Array<{
    id: string;
    name: string;
    revenue: number;
    bookings: number;
  }>;
}

export interface Booking {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  driver?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  source: string;
  destination: string;
  fare: number;
  status: string;
  date: string;
  createdAt: string;
  pickupTime?: string;
  completedAt?: string;
  paymentMethod: string;
  paymentStatus: string;
}

export interface Driver {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  truckType: string;
  capacity: number;
  rating: number;
  isVerified: boolean;
  isAvailable: boolean;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  totalBookings?: number;
  totalSpent?: number;
  driverProfile?: Driver | null;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  transactionId?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  driver?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface Review {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  driver: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: string;
  description?: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Admin API Client
export const adminApi = {
  // Dashboard Statistics
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await apiClient.getClient().get('/admin/dashboard');
    return response.data.data;
  },

  // Analytics
  getBookingAnalytics: async (timeRange: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<BookingAnalytics> => {
    const response = await apiClient.getClient().get(`/admin/analytics/bookings?timeRange=${timeRange}`);
    return response.data.data;
  },

  getDriverAnalytics: async (): Promise<DriverAnalytics> => {
    const response = await apiClient.getClient().get('/admin/analytics/drivers');
    return response.data.data;
  },

  getRevenueReport: async (startDate: string, endDate: string): Promise<RevenueReport> => {
    const response = await apiClient.getClient().get(`/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data;
  },

  // Users Management
  getUsers: async (page: number = 1, limit: number = 10, search?: string, role?: string): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (role) params.append('role', role);

    const response = await apiClient.getClient().get(`/users?${params.toString()}`);
    return {
      data: response.data.data.users,
      pagination: {
        page: response.data.data.page,
        limit: response.data.data.limit,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages
      }
    };
  },

  getUser: async (userId: string): Promise<User> => {
    const response = await apiClient.getClient().get(`/users/${userId}`);
    return response.data.data;
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await apiClient.getClient().put(`/users/${userId}`, userData);
    return response.data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.getClient().delete(`/users/${userId}`);
  },

  // Drivers Management
  getDrivers: async (page: number = 1, limit: number = 10, search?: string, status?: string): Promise<PaginatedResponse<Driver>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await apiClient.getClient().get(`/drivers/all?${params.toString()}`);
    return {
      data: response.data.data.drivers || response.data.data,
      pagination: {
        page: response.data.data.page,
        limit: response.data.data.limit,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages
      }
    };
  },

  getDriver: async (driverId: string): Promise<Driver> => {
    const response = await apiClient.getClient().get(`/drivers/${driverId}`);
    return response.data.data;
  },

  updateDriver: async (driverId: string, driverData: Partial<Driver>): Promise<Driver> => {
    const response = await apiClient.getClient().put(`/drivers/${driverId}`, driverData);
    return response.data.data;
  },

  verifyDriver: async (driverId: string, isVerified: boolean): Promise<Driver> => {
    const response = await apiClient.getClient().put(`/drivers/verify/${driverId}`, { isVerified });
    return response.data.data;
  },

  deleteDriver: async (driverId: string): Promise<void> => {
    await apiClient.getClient().delete(`/drivers/${driverId}`);
  },

  getPendingVerifications: async (): Promise<Driver[]> => {
    const response = await apiClient.getClient().get('/admin/drivers/pending-verifications');
    return response.data.data;
  },

  // Bookings Management
  getBookings: async (page: number = 1, limit: number = 10, search?: string, status?: string): Promise<PaginatedResponse<Booking>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await apiClient.getClient().get(`/bookings?${params.toString()}`);
    return {
      data: response.data.data.bookings || response.data.data,
      pagination: {
        page: response.data.data.page,
        limit: response.data.data.limit,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages
      }
    };
  },

  getBooking: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.getClient().get(`/bookings/${bookingId}`);
    return response.data.data;
  },

  updateBooking: async (bookingId: string, bookingData: Partial<Booking>): Promise<Booking> => {
    const response = await apiClient.getClient().put(`/bookings/${bookingId}`, bookingData);
    return response.data.data;
  },

  deleteBooking: async (bookingId: string): Promise<void> => {
    await apiClient.getClient().delete(`/bookings/${bookingId}`);
  },

  // Payments Management
  getPayments: async (page: number = 1, limit: number = 10, search?: string, status?: string): Promise<PaginatedResponse<Payment>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await apiClient.getClient().get(`/payments?${params.toString()}`);
    return {
      data: response.data.data.payments || response.data.data,
      pagination: {
        page: response.data.data.page,
        limit: response.data.data.limit,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages
      }
    };
  },

  getPayment: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.getClient().get(`/payments/${paymentId}`);
    return response.data.data;
  },

  updatePayment: async (paymentId: string, paymentData: Partial<Payment>): Promise<Payment> => {
    const response = await apiClient.getClient().patch(`/payments/${paymentId}/status`, paymentData);
    return response.data.data;
  },

  // Reviews Management
  getReviews: async (page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);

    const response = await apiClient.getClient().get(`/reviews?${params.toString()}`);
    return {
      data: response.data.data.reviews || response.data.data,
      pagination: {
        page: response.data.data.page,
        limit: response.data.data.limit,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages
      }
    };
  },

  getReview: async (reviewId: string): Promise<Review> => {
    const response = await apiClient.getClient().get(`/reviews/${reviewId}`);
    return response.data.data;
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await apiClient.getClient().delete(`/reviews/${reviewId}`);
  },

  // System Settings
  getSystemSettings: async (): Promise<SystemSetting[]> => {
    const response = await apiClient.getClient().get('/admin/settings');
    return response.data.data;
  },

  updateSystemSetting: async (key: string, value: string, type: string): Promise<SystemSetting> => {
    const response = await apiClient.getClient().put('/admin/settings', { key, value, type });
    return response.data.data;
  },

  // Reports
  getBookingReports: async (filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    driverId?: string;
    userId?: string;
  }): Promise<Booking[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await apiClient.getClient().get(`/admin/reports/bookings?${params.toString()}`);
    return response.data.data;
  }
}; 