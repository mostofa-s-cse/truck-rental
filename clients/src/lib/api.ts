import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  async register(userData: any): Promise<ApiResponse> {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials: any): Promise<ApiResponse> {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async changePassword(passwords: any): Promise<ApiResponse> {
    const response = await this.client.post('/auth/change-password', passwords);
    return response.data;
  }

  // Driver endpoints
  async createDriver(driverData: any): Promise<ApiResponse> {
    const response = await this.client.post('/drivers/profile', driverData);
    return response.data;
  }

  async updateDriver(driverData: any): Promise<ApiResponse> {
    const response = await this.client.put('/drivers/profile', driverData);
    return response.data;
  }

  async getDriverProfile(): Promise<ApiResponse> {
    const response = await this.client.get('/drivers/profile');
    return response.data;
  }

  async searchDrivers(params: any): Promise<ApiResponse> {
    const response = await this.client.get('/drivers/search', { params });
    return response.data;
  }

  async updateAvailability(isAvailable: boolean): Promise<ApiResponse> {
    const response = await this.client.put('/drivers/availability', { isAvailable });
    return response.data;
  }

  async updateLocation(locationData: any): Promise<ApiResponse> {
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
  async createBooking(bookingData: any): Promise<ApiResponse> {
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

  async updateBooking(bookingId: string, updateData: any): Promise<ApiResponse> {
    const response = await this.client.put(`/bookings/${bookingId}`, updateData);
    return response.data;
  }

  async cancelBooking(bookingId: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/bookings/${bookingId}`);
    return response.data;
  }
}

export const apiClient = new ApiClient(); 