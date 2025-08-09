import { apiClient } from './api';

// Server response interfaces
interface ServerBooking {
  id: string;
  source: string;
  destination: string;
  fare: number;
  status: string;
  createdAt: string;
  date?: string; // Add optional date property
  pickupTime?: string;
  completedAt?: string;
}

interface ServerBookingWithDriver extends ServerBooking {
  driver?: {
    id: string;
    user?: {
      name: string;
    };
  };
  review?: {
    rating?: number;
  };
  distance?: number;
}

interface ServerDriver {
  id: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  name?: string; // Add optional name property for direct access
  truckType: string;
  capacity: number;
  rating: number;
  isAvailable: boolean;
  location?: string;
}

interface ServerUserDashboardData {
  totalBookings: number;
  totalSpent: number;
  favoriteDrivers: number;
  averageRating: number;
  recentBookings: ServerBooking[];
  nearbyDrivers: ServerDriver[];
  spendingData: Array<{ month: string; amount: number }>;
  bookingStatusData: Array<{ status: string; count: number }>;
}

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
  user?: {
    name: string;
    email: string;
    phone?: string;
  } | string;
  driver?: string;
  driverId?: string; // Add driver ID for contact functionality
  source: string;
  destination: string;
  fare: number;
  status: string;
  date: string;
  createdAt?: string;
  pickupTime?: string;
  completedAt?: string;
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
    const response = await apiClient.getClient().get('/dashboard/driver/stats');
    const data = response.data.data;
    return {
      totalTrips: data.totalTrips || 0,
      averageRating: data.averageRating || 0,
      completionRate: data.completionRate || 0,
      responseTime: data.responseTime || '0 min'
    };
  },

  getEarnings: async (): Promise<Earnings> => {
    const response = await apiClient.getClient().get('/dashboard/driver/earnings');
    const data = response.data.data;
    return {
      today: data.overview?.today || 0,
      thisWeek: data.overview?.thisWeek || 0,
      thisMonth: data.overview?.thisMonth || 0,
      totalEarnings: data.overview?.totalEarnings || 0
    };
  },

  getEarningsAnalytics: async (): Promise<{
    overview: Earnings;
    dailyEarnings: Array<{ date: string; earnings: number; trips: number; avgPerTrip: number }>;
    weeklyEarnings: Array<{ week: string; earnings: number; trips: number; avgPerTrip: number }>;
    monthlyEarnings: Array<{ month: string; earnings: number; trips: number; avgPerTrip: number }>;
    earningsByStatus: Array<{ status: string; earnings: number; trips: number; percentage: number }>;
    topEarningDays: Array<{ day: string; earnings: number; trips: number; avgPerTrip: number }>;
    paymentMethods: Array<{ method: string; earnings: number; trips: number; percentage: number }>;
    recentTransactions: Array<{ id: string; amount: number; method: string; date: string; status: string }>;
  }> => {
    const response = await apiClient.getClient().get('/dashboard/driver/earnings');
    return response.data.data;
  },

  getRecentBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.getClient().get('/bookings/driver/me');
    const data = response.data.data;
    return (data.bookings || []).map((booking: (ServerBookingWithDriver & { user?: { name: string; email?: string; phone?: string } })) => ({
      id: booking.id,
      source: booking.source,
      destination: booking.destination,
      fare: booking.fare,
      status: booking.status,
      date: booking.pickupTime || booking.createdAt,
      createdAt: booking.createdAt,
      pickupTime: booking.pickupTime,
      completedAt: booking.completedAt,
      distance: booking.distance,
      user: booking.user?.name || 'User',
      rating: booking.review?.rating
    }));
  },

  updateAvailability: async (isAvailable: boolean): Promise<void> => {
    await apiClient.getClient().put('/dashboard/driver/availability', { isAvailable });
  },

  acceptBooking: async (bookingId: string): Promise<void> => {
    await apiClient.getClient().put(`/dashboard/driver/bookings/${bookingId}/accept`);
  },

  declineBooking: async (bookingId: string): Promise<void> => {
    await apiClient.getClient().put(`/dashboard/driver/bookings/${bookingId}/decline`);
  },

  startTrip: async (bookingId: string): Promise<void> => {
    await apiClient.getClient().put(`/dashboard/driver/bookings/${bookingId}/start`);
  },

  completeTrip: async (bookingId: string): Promise<void> => {
    await apiClient.getClient().put(`/dashboard/driver/bookings/${bookingId}/complete`);
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string; avatar?: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.getClient().post('/drivers/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  }
};

// User Dashboard APIs
export const userApi = {
  getUserStats: async (): Promise<UserStats> => {
    const response = await apiClient.getClient().get('/dashboard/stats');
    const data: ServerUserDashboardData = response.data.data;
    return {
      totalBookings: data.totalBookings || 0,
      totalSpent: data.totalSpent || 0,
      averageRating: data.averageRating || 0,
      favoriteDrivers: data.favoriteDrivers || 0
    };
  },

  getRecentBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.getClient().get('/bookings/user/me');
    const data = response.data.data;
    return (data.bookings || []).map((booking: ServerBookingWithDriver) => ({
      id: booking.id,
      source: booking.source,
      destination: booking.destination,
      fare: booking.fare,
      status: booking.status,
      date: booking.pickupTime || booking.createdAt, // Use pickupTime as date
      createdAt: booking.createdAt,
      pickupTime: booking.pickupTime,
      completedAt: booking.completedAt,
      distance: booking.distance,
      driver: booking.driver?.user?.name || 'Driver Assigned',
      driverId: booking.driver?.id, // Add driver ID for contact functionality
      rating: booking.review?.rating
    }));
  },

  getUserBookings: async (page = 1, limit = 10): Promise<{ bookings: Booking[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.getClient().get('/bookings/user/me', { params: { page, limit } });
    const data = response.data.data;
    return {
      bookings: (data.bookings || []).map((booking: ServerBookingWithDriver) => ({
        id: booking.id,
        source: booking.source,
        destination: booking.destination,
        fare: booking.fare,
        status: booking.status,
        date: booking.pickupTime || booking.createdAt,
        createdAt: booking.createdAt,
        pickupTime: booking.pickupTime,
        completedAt: booking.completedAt,
        distance: booking.distance,
        driver: booking.driver?.user?.name || 'Driver Assigned',
        driverId: booking.driver?.id, // Add driver ID for contact functionality
        rating: booking.review?.rating
      })),
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || limit,
      totalPages: data.totalPages || 0
    };
  },

  getNearbyDrivers: async (): Promise<Driver[]> => {
    const response = await apiClient.getClient().get('/dashboard/stats');
    const data: ServerUserDashboardData = response.data.data;
    return (data.nearbyDrivers || []).map((driver: ServerDriver) => ({
      id: driver.id,
      name: driver.user?.name || 'Unknown Driver',
      truckType: driver.truckType,
      capacity: driver.capacity,
      rating: driver.rating,
      distance: 5, // Mock distance
      isAvailable: driver.isAvailable,
      location: driver.location || 'Unknown Location'
    }));
  },

  searchDrivers: async (params: {
    location?: string;
    truckType?: string;
    capacity?: string;
  }): Promise<Driver[]> => {
    const response = await apiClient.getClient().get('/dashboard/drivers/nearby', { params });
    return response.data.data.map((driver: ServerDriver) => ({
      id: driver.id,
      name: driver.name || driver.user?.name || 'Unknown Driver',
      truckType: driver.truckType,
      capacity: driver.capacity,
      rating: driver.rating,
      distance: 5, // Mock distance
      isAvailable: driver.isAvailable,
      location: driver.location || 'Unknown Location'
    }));
  },

  calculateFare: async (params: {
    source: string;
    destination: string;
    truckType: string;
  }): Promise<{ fare: number; distance: number }> => {
    const response = await apiClient.getClient().post('/dashboard/fare/calculate', params);
    return response.data.data;
  },

  cancelBooking: async (bookingId: string, cancelReason?: string, cancelComment?: string): Promise<void> => {
    await apiClient.getClient().delete(`/bookings/${bookingId}`, {
      data: { cancelReason, cancelComment }
    });
  },

  // Submit rating for a booking
  submitRating: async (bookingId: string, rating: number, comment?: string): Promise<void> => {
    await apiClient.getClient().post(`/reviews/booking/${bookingId}`, {
      rating,
      comment
    });
  },

  // Contact driver
  contactDriver: async (driverId: string, message?: string, bookingId?: string): Promise<{
    driver: {
      id: string;
      name: string;
      phone: string;
      email: string;
    };
    message: string;
    contactInfo: {
      phone: string;
      email: string;
    };
  }> => {
    const response = await apiClient.getClient().post(`/drivers/contact/${driverId}`, {
      message,
      bookingId
    });
    return response.data.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string; avatar?: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.getClient().post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Get user payment history
  getUserPayments: async (page = 1, limit = 10): Promise<{ 
    payments: Array<{
      id: string;
      amount: number;
      paymentMethod: string;
      status: string;
      transactionId: string;
      createdAt: string;
      updatedAt: string;
      booking: {
        id: string;
        source: string;
        destination: string;
        fare: number;
        status: string;
        driver: {
          user: {
            name: string;
          };
          truckType: string;
        };
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await apiClient.getClient().get('/payments/user/history', { 
      params: { page, limit } 
    });
    return response.data.data;
  },

  // Get payment details by ID
  getPaymentDetails: async (paymentId: string): Promise<{
    id: string;
    amount: number;
    paymentMethod: string;
    status: string;
    transactionId: string;
    createdAt: string;
    updatedAt: string;
    booking: {
      id: string;
      source: string;
      destination: string;
      fare: number;
      status: string;
      driver: {
        user: {
          name: string;
        };
        truckType: string;
      };
    };
  }> => {
    const response = await apiClient.getClient().get(`/payments/${paymentId}`);
    return response.data.data.payment;
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