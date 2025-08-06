import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, RegisterData, LoginData, CreateDriverData, CreateBookingData, SearchDriversParams, SearchFilters, SearchResult, Driver, Booking } from '@/types';

const API_BASE_URL = process.env.SERVER_URL_API || 'http://localhost:4000/api/v1';

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

  // Payment methods
  async createPaymentSession(paymentRequest: {
    bookingId: string;
    amount: number;
    currency: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
    customerPostCode: string;
    customerCountry: string;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
    ipnUrl: string;
  }): Promise<ApiResponse<{
    redirectUrl: string;
    sessionKey: string;
    transactionId: string;
  }>> {
    const response = await this.client.post('/payments/session', paymentRequest);
    return response.data;
  }

  async validatePayment(tranId: string, amount: number, currency: string): Promise<ApiResponse> {
    const response = await this.client.post('/payments/validate', { tran_id: tranId, amount, currency });
    return response.data;
  }

  async getPaymentStatus(bookingId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/payments/status/${bookingId}`);
    return response.data;
  }

  async refundPayment(bookingId: string, reason: string): Promise<ApiResponse> {
    const response = await this.client.post(`/payments/refund/${bookingId}`, { reason });
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

  // Area endpoints
  async getAreasForDropdown(): Promise<ApiResponse<Array<{
    value: string;
    label: string;
    area: string;
  }>>> {
    const response = await this.client.get('/areas/dropdown');
    return response.data;
  }

  async getAreasGrouped(): Promise<ApiResponse<{
    [state: string]: {
      [city: string]: Array<{
        id: string;
        name: string;
        city: string;
        state: string;
        isActive: boolean;
      }>
    }
  }>> {
    const response = await this.client.get('/areas/grouped');
    return response.data;
  }

  async getStates(): Promise<ApiResponse<string[]>> {
    const response = await this.client.get('/areas/states');
    return response.data;
  }

  async getCitiesByState(state: string): Promise<ApiResponse<string[]>> {
    const response = await this.client.get(`/areas/cities/${state}`);
    return response.data;
  }

  async getAllAreas(filters?: {
    city?: string;
    state?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>>> {
    const response = await this.client.get('/areas', { params: filters });
    return response.data;
  }

  // Fare calculation endpoints
  async calculateFare(fareRequest: {
    source: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    destination: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    truckType: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
    weight?: number;
    urgency?: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  }): Promise<ApiResponse<{
    distance: number;
    duration: number;
    baseFare: number;
    weightMultiplier: number;
    urgencyMultiplier: number;
    totalFare: number;
    breakdown: {
      distanceCost: number;
      weightCost: number;
      urgencyCost: number;
      basePrice: number;
    };
  }>> {
    const response = await this.client.post('/fare-calculation/calculate', fareRequest);
    return response.data;
  }

  async getFareHistory(page = 1, limit = 10): Promise<ApiResponse<{
    bookings: Array<{
      id: string;
      source: string;
      destination: string;
      distance: number;
      fare: number;
      status: string;
      createdAt: string;
      driver: {
        truckType: string;
        capacity: number;
      };
    }>;
    page: number;
    limit: number;
    total: number;
  }>> {
    const response = await this.client.get('/fare-calculation/history', { 
      params: { page, limit } 
    });
    return response.data;
  }

  // Method to access the underlying axios client for custom requests
  getClient() {
    return this.client;
  }
}

export const apiClient = new ApiClient(); 