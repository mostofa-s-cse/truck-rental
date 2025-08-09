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
          // Only clear auth data, don't redirect automatically
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Remove automatic redirect - let components handle auth errors
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

  async getUserProfile(): Promise<ApiResponse<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  }>> {
    const response = await this.client.get('/users/me');
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
    shippingMethod: string;
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

  async initiateSSLCommerzPayment(paymentRequest: {
    bookingId: string;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      postCode: string;
      country: string;
    };
  }): Promise<ApiResponse<{
    sessionId: string;
    gatewayUrl: string;
  }>> {
    const response = await this.client.post('/sslcommerz/initiate', paymentRequest);
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

  // Get user payment history
  async getPaymentHistory(page = 1, limit = 10): Promise<ApiResponse<{
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
  }>> {
    const response = await this.client.get('/payments/user/history', { params: { page, limit } });
    return response.data;
  }

  // Get payment details by transaction ID
  async getPaymentDetails(tranId: string): Promise<ApiResponse<{
    payment: {
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
    };
  }>> {
    const response = await this.client.get(`/payments/${tranId}`);
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
    latitude: number;
    longitude: number;
  }>>> {
    const response = await this.client.get('/area-search/dropdown');
    return response.data;
  }

  async searchAreas(query: string, latitude?: number, longitude?: number, radius?: number, limit?: number): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    distance: number;
    latitude: number;
    longitude: number;
    address: string;
  }>>> {
    const response = await this.client.post('/area-search/search', {
      query,
      latitude,
      longitude,
      radius,
      limit
    });
    return response.data;
  }

  async getPopularAreas(limit?: number): Promise<ApiResponse<Array<{
    value: string;
    label: string;
    area: string;
  }>>> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await this.client.get(`/area-search/popular${params}`);
    return response.data;
  }

  async getNearbyAreas(latitude: number, longitude: number, radius?: number, limit?: number): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    distance: number;
    latitude: number;
    longitude: number;
    address: string;
  }>>> {
    const params = new URLSearchParams();
    params.append('latitude', latitude.toString());
    params.append('longitude', longitude.toString());
    if (radius) params.append('radius', radius.toString());
    if (limit) params.append('limit', limit.toString());
    
    const response = await this.client.get(`/area-search/nearby?${params.toString()}`);
    return response.data;
  }

  async getAreasGrouped(): Promise<ApiResponse<{
    [state: string]: {
      [city: string]: Array<{
        value: string;
        label: string;
        area: string;
      }>;
    };
  }>> {
    const response = await this.client.get('/area-search/grouped');
    return response.data;
  }

  async getCitiesByState(state: string): Promise<ApiResponse<string[]>> {
    const response = await this.client.get(`/area-search/cities/${encodeURIComponent(state)}`);
    return response.data;
  }

  async getStates(): Promise<ApiResponse<string[]>> {
    const response = await this.client.get('/area-search/states');
    return response.data;
  }

  // Admin endpoints (require authentication)
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
    distance: number;
    latitude: number;
    longitude: number;
    address: string;
  }>>> {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.state) params.append('state', filters.state);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    
    const response = await this.client.get(`/area-search/admin?${params.toString()}`);
    return response.data;
  }

  async getAreaById(id: string): Promise<ApiResponse<{
    id: string;
    name: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
    address: string;
    searchCount: number;
    isActive: boolean;
  }>> {
    const response = await this.client.get(`/area-search/admin/${id}`);
    return response.data;
  }

  async createArea(data: {
    placeId: string;
    name: string;
    city: string;
    state: string;
    country?: string;
    latitude: number;
    longitude: number;
    address: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ id: string }>> {
    const response = await this.client.post('/area-search/admin', data);
    return response.data;
  }

  async updateArea(id: string, data: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ id: string }>> {
    const response = await this.client.put(`/area-search/admin/${id}`, data);
    return response.data;
  }

  async deleteArea(id: string): Promise<ApiResponse<{ id: string }>> {
    const response = await this.client.delete(`/area-search/admin/${id}`);
    return response.data;
  }

  async getAreaAnalytics(): Promise<ApiResponse<{
    totalAreas: number;
    totalSearches: number;
    popularAreas: Array<{ name: string; searches: number }>;
    searchTrends: {
      last7Days: number;
      last30Days: number;
      last90Days: number;
    };
  }>> {
    const response = await this.client.get('/area-search/admin/analytics');
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
    truckCategoryId?: string;
    truckType?: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
    weight?: number;
    urgency?: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  }): Promise<ApiResponse<{
    distance: number;
    duration: number;
    baseFare: number;
    distanceCost: number;
    weightMultiplier: number;
    urgencyMultiplier: number;
    totalFare: number;
    isInsideDhaka: boolean;
    breakdown: {
      baseFare: number;
      distanceCost: number;
      weightCost: number;
      urgencyCost: number;
      tolls: number;
    };
  }>> {
    const response = await this.client.post('/fare-calculation/calculate', fareRequest);
    return response.data;
  }

  async getTruckCategories(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    truckType: string;
    capacity: number;
    length: number;
    baseFare: number;
    insideDhakaRate: number;
    outsideDhakaRate: number;
    description: string;
    isActive: boolean;
  }>>> {
    const response = await this.client.get('/fare-calculation/categories');
    return response.data;
  }

  async getRouteDetails(source: { latitude: number; longitude: number; address?: string }, destination: { latitude: number; longitude: number; address?: string }): Promise<ApiResponse<{
    distance: number;
    duration: number;
    routeGeometry: string;
    waypoints: Array<{ latitude: number; longitude: number }>;
  }>> {
    const response = await this.client.post('/fare-calculation/route', {
      source,
      destination
    });
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