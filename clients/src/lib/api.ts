import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, RegisterData, LoginData, CreateDriverData, CreateBookingData, SearchDriversParams, SearchFilters, SearchResult, Driver, Booking } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(userData: RegisterData): Promise<ApiResponse> {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials: LoginData): Promise<ApiResponse> {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async changePassword(passwords: { oldPassword: string; newPassword: string }): Promise<ApiResponse> {
    const response = await this.client.post('/auth/change-password', passwords);
    return response.data;
  }

  // Driver endpoints
  async createDriver(driverData: CreateDriverData): Promise<ApiResponse> {
    const response = await this.client.post('/drivers/profile', driverData);
    return response.data;
  }

  async updateDriver(driverData: Partial<CreateDriverData>): Promise<ApiResponse> {
    const response = await this.client.put('/drivers/profile', driverData);
    return response.data;
  }

  async getDriverProfile(): Promise<ApiResponse> {
    const response = await this.client.get('/drivers/profile');
    return response.data;
  }

  async searchDrivers(params: SearchDriversParams): Promise<ApiResponse> {
    const response = await this.client.get('/drivers/search', { params });
    return response.data;
  }

  // Search endpoints
  async searchTrucks(filters: SearchFilters, page = 1, limit = 10): Promise<ApiResponse<SearchResult>> {
    const response = await this.client.post('/search/trucks', filters, { 
      params: { page, limit } 
    });
    return response.data;
  }

  async getPopularTrucks(limit = 10): Promise<ApiResponse<Driver[]>> {
    const response = await this.client.get('/search/trucks/popular', { 
      params: { limit } 
    });
    return response.data;
  }

  async getNearbyTrucks(latitude: number, longitude: number, radius = 10, limit = 20): Promise<ApiResponse<Driver[]>> {
    const response = await this.client.get('/search/trucks/nearby', { 
      params: { latitude, longitude, radius, limit } 
    });
    return response.data;
  }

  async getSearchSuggestions(query: string): Promise<ApiResponse<string[]>> {
    const response = await this.client.get('/search/suggestions', { 
      params: { query } 
    });
    return response.data;
  }

  async getAdvancedSearch(params: SearchFilters & {
    sortBy?: 'rating' | 'distance' | 'price' | 'totalTrips';
    sortOrder?: 'asc' | 'desc';
    minTrips?: number;
    maxTrips?: number;
  }): Promise<ApiResponse<SearchResult>> {
    const response = await this.client.get('/search/advanced', { params });
    return response.data;
  }

  async getSearchStats(): Promise<ApiResponse<{
    totalDrivers: number;
    availableDrivers: number;
    verifiedDrivers: number;
    averageRating: number;
    availabilityRate: string;
    verificationRate: string;
  }>> {
    const response = await this.client.get('/search/stats');
    return response.data;
  }

  async getTruckTypeStats(): Promise<ApiResponse<Array<{
    truckType: string;
    count: number;
  }>>> {
    const response = await this.client.get('/search/stats/truck-types');
    return response.data;
  }

  async updateAvailability(isAvailable: boolean): Promise<ApiResponse> {
    const response = await this.client.put('/drivers/availability', { isAvailable });
    return response.data;
  }

  async updateLocation(locationData: { latitude: number; longitude: number; accuracy?: number }): Promise<ApiResponse> {
    const response = await this.client.put('/drivers/location', locationData);
    return response.data;
  }

  // Admin endpoints
  async verifyDriver(driverId: string, isVerified: boolean): Promise<ApiResponse> {
    const response = await this.client.put(`/drivers/verify/${driverId}`, { isVerified });
    return response.data;
  }

  async getAllDrivers(page = 1, limit = 10): Promise<ApiResponse> {
    const response = await this.client.get('/drivers/all', { params: { page, limit } });
    return response.data;
  }

  // Booking endpoints (to be implemented)
  async createBooking(bookingData: CreateBookingData): Promise<ApiResponse> {
    const response = await this.client.post('/bookings', bookingData);
    return response.data;
  }

  async getBookings(page = 1, limit = 10): Promise<ApiResponse> {
    const response = await this.client.get('/bookings', { params: { page, limit } });
    return response.data;
  }

  async getBooking(bookingId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/bookings/${bookingId}`);
    return response.data;
  }

  async updateBooking(bookingId: string, updateData: Partial<CreateBookingData>): Promise<ApiResponse> {
    const response = await this.client.put(`/bookings/${bookingId}`, updateData);
    return response.data;
  }

  async cancelBooking(bookingId: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/bookings/${bookingId}`);
    return response.data;
  }

  // User-specific booking endpoints
  async getUserBookings(page = 1, limit = 10): Promise<ApiResponse> {
    const response = await this.client.get('/bookings/user/me', { params: { page, limit } });
    return response.data;
  }

  // Driver-specific endpoints
  async getDriverBookings(page = 1, limit = 10): Promise<ApiResponse> {
    const response = await this.client.get('/bookings/driver/me', { params: { page, limit } });
    return response.data;
  }

  // Dashboard statistics endpoints
  async getDashboardStats(): Promise<ApiResponse<{
    totalBookings: number;
    totalSpent: number;
    favoriteDrivers: number;
    averageRating: number;
    recentBookings: Booking[];
    nearbyDrivers: Driver[];
    spendingData: Array<{ month: string; amount: number }>;
    bookingStatusData: Array<{ status: string; count: number }>;
  }>> {
    const response = await this.client.get('/dashboard/stats');
    return response.data;
  }

  async getDriverDashboardStats(): Promise<ApiResponse<{
    todayEarnings: number;
    activeBookings: number;
    rating: number;
    onlineHours: number;
    recentBookings: Booking[];
    earningsData: Array<{ day: string; amount: number }>;
    ratingData: Array<{ rating: number; count: number }>;
  }>> {
    const response = await this.client.get('/dashboard/driver/stats');
    return response.data;
  }

  // Method to access the underlying axios client for custom requests
  getClient() {
    return this.client;
  }
}

export const apiClient = new ApiClient(); 