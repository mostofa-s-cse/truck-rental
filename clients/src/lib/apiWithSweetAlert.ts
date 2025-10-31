import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  RegisterData, 
  LoginData, 
  CreateDriverData, 
  CreateBookingData, 
  SearchDriversParams 
} from '@/types';

interface RequestOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  showLoading?: boolean;
  showSuccess?: boolean;
  showError?: boolean;
}
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showLoading as showLoadingAlert,
  closeAlert,
} from './sweetalert';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiClientWithSweetAlert {
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

    // Response interceptor to handle errors with SweetAlert2
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          showErrorToast('Session expired. Please login again.');
          // Remove automatic redirect - let components handle auth errors
        } else if (error.response?.status === 403) {
          showWarningToast('You do not have permission to perform this action.');
        } else if (error.response?.status === 404) {
          showErrorToast('Resource not found.');
        } else if (error.response?.status === 500) {
          showErrorToast('Server error. Please try again later.');
        } else if (error.response?.data?.message) {
          showErrorToast(error.response.data.message);
        } else if (error.message) {
          showErrorToast(error.message);
        } else {
          showErrorToast('An unexpected error occurred.');
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request wrapper with SweetAlert2 integration
  private async request<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    options: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
      showLoading?: boolean;
      showSuccess?: boolean;
      showError?: boolean;
    } = {}
  ): Promise<T | null> {
    const {
      loadingMessage = 'Loading...',
      successMessage,
      errorMessage = 'Something went wrong',
      showLoading = true,
      showSuccess = true,
      showError = true,
    } = options;

    try {
      if (showLoading) {
        showLoadingAlert(loadingMessage);
      }

      const response = await requestFn();

      if (showLoading) {
        closeAlert();
      }

      if (showSuccess && successMessage) {
        showSuccessToast(successMessage);
      }

      return response.data;
    } catch {
      if (showLoading) {
        closeAlert();
      }

      if (showError && errorMessage) {
        showErrorToast(errorMessage);
      }

      return null;
    }
  }

  // Auth endpoints
  async register(userData: RegisterData, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.post('/auth/register', userData),
      {
        loadingMessage: 'Creating your account...',
        successMessage: 'Account created successfully!',
        errorMessage: 'Failed to create account.',
        ...options,
      }
    );
  }

  async login(credentials: LoginData, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.post('/auth/login', credentials),
      {
        loadingMessage: 'Logging you in...',
        successMessage: 'Login successful!',
        errorMessage: 'Invalid credentials.',
        ...options,
      }
    );
  }

  async changePassword(passwords: { oldPassword: string; newPassword: string }, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.post('/auth/change-password', passwords),
      {
        loadingMessage: 'Updating password...',
        successMessage: 'Password updated successfully!',
        errorMessage: 'Failed to update password.',
        ...options,
      }
    );
  }

  // Driver endpoints
  async createDriver(driverData: CreateDriverData, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.post('/drivers/profile', driverData),
      {
        loadingMessage: 'Creating driver profile...',
        successMessage: 'Driver profile created successfully!',
        errorMessage: 'Failed to create driver profile.',
        ...options,
      }
    );
  }

  async updateDriver(driverData: Partial<CreateDriverData>, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.put('/drivers/profile', driverData),
      {
        loadingMessage: 'Updating driver profile...',
        successMessage: 'Driver profile updated successfully!',
        errorMessage: 'Failed to update driver profile.',
        ...options,
      }
    );
  }

  async getDriverProfile(options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.get('/drivers/profile'),
      {
        loadingMessage: 'Loading driver profile...',
        showSuccess: false,
        ...options,
      }
    );
  }

  async searchDrivers(params: SearchDriversParams, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.get('/drivers/search', { params }),
      {
        loadingMessage: 'Searching drivers...',
        showSuccess: false,
        ...options,
      }
    );
  }

  async updateAvailability(isAvailable: boolean, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.put('/drivers/availability', { isAvailable }),
      {
        loadingMessage: 'Updating availability...',
        successMessage: `You are now ${isAvailable ? 'available' : 'unavailable'}.`,
        errorMessage: 'Failed to update availability.',
        ...options,
      }
    );
  }

  async updateLocation(locationData: { latitude: number; longitude: number; accuracy?: number }, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.put('/drivers/location', locationData),
      {
        loadingMessage: 'Updating location...',
        successMessage: 'Location updated successfully!',
        errorMessage: 'Failed to update location.',
        ...options,
      }
    );
  }

  // Admin endpoints
  async verifyDriver(driverId: string, isVerified: boolean, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.put(`/drivers/verify/${driverId}`, { isVerified }),
      {
        loadingMessage: 'Updating driver verification...',
        successMessage: `Driver ${isVerified ? 'verified' : 'unverified'} successfully!`,
        errorMessage: 'Failed to update driver verification.',
        ...options,
      }
    );
  }

  async getAllDrivers(page = 1, limit = 10, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.get('/drivers/all', { params: { page, limit } }),
      {
        loadingMessage: 'Loading drivers...',
        showSuccess: false,
        ...options,
      }
    );
  }

  // Booking endpoints
  async createBooking(bookingData: CreateBookingData, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.post('/bookings', bookingData),
      {
        loadingMessage: 'Creating booking...',
        successMessage: 'Booking created successfully!',
        errorMessage: 'Failed to create booking.',
        ...options,
      }
    );
  }

  async getBookings(page = 1, limit = 10, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.get('/bookings', { params: { page, limit } }),
      {
        loadingMessage: 'Loading bookings...',
        showSuccess: false,
        ...options,
      }
    );
  }

  async getBooking(bookingId: string, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.get(`/bookings/${bookingId}`),
      {
        loadingMessage: 'Loading booking details...',
        showSuccess: false,
        ...options,
      }
    );
  }

  async updateBooking(bookingId: string, updateData: Partial<CreateBookingData>, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.put(`/bookings/${bookingId}`, updateData),
      {
        loadingMessage: 'Updating booking...',
        successMessage: 'Booking updated successfully!',
        errorMessage: 'Failed to update booking.',
        ...options,
      }
    );
  }

  async cancelBooking(bookingId: string, options?: RequestOptions): Promise<ApiResponse | null> {
    return this.request(
      () => this.client.delete(`/bookings/${bookingId}`),
      {
        loadingMessage: 'Cancelling booking...',
        successMessage: 'Booking cancelled successfully!',
        errorMessage: 'Failed to cancel booking.',
        ...options,
      }
    );
  }

  // Utility methods
  showSuccess(message: string) {
    showSuccessToast(message);
  }

  showError(message: string) {
    showErrorToast(message);
  }

  showWarning(message: string) {
    showWarningToast(message);
  }

  showInfo(message: string) {
    showInfoToast(message);
  }
}

export const apiClientWithSweetAlert = new ApiClientWithSweetAlert(); 