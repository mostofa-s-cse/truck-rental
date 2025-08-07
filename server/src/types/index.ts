// Types for the application

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'DRIVER' | 'USER';
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export class AppError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'ADMIN' | 'DRIVER' | 'USER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateDriverRequest {
  truckType: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  capacity: number;
  quality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
  license: string;
  registration: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateBookingRequest {
  driverId: string;
  source: string;
  destination: string;
  sourceLat?: number;
  sourceLng?: number;
  destLat?: number;
  destLng?: number;
  distance?: number;
  fare: number;
}

export interface UpdateBookingRequest {
  status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  pickupTime?: Date;
  completedAt?: Date;
}

export interface PaymentData {
  bookingId: string;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_BANKING';
  transactionId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface SystemSettingUpdate {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
}

export interface CreateReviewRequest {
  driverId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
}

export interface SearchDriversRequest {
  truckType?: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  capacity?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
}

// Truck Category Types
export interface CreateTruckCategoryRequest {
  name: string;
  basePrice: number;
  description?: string;
}

export interface UpdateTruckCategoryRequest {
  name?: string;
  basePrice?: number;
  description?: string;
  isActive?: boolean;
}

// Area Types
export interface CreateAreaRequest {
  name: string;
  city: string;
  state: string;
}

export interface UpdateAreaRequest {
  name?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
}

// System Setting Types
export interface CreateSystemSettingRequest {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

export interface UpdateSystemSettingRequest {
  value: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DistanceMatrixResponse {
  distance: number;
  duration: number;
  fare: number;
}

// Fare Calculation Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface FareCalculationRequest {
  source: Location;
  destination: Location;
  truckType: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  weight?: number; // in tons
  urgency?: 'NORMAL' | 'URGENT' | 'EMERGENCY';
}

export interface FareCalculationResult {
  distance: number; // in km
  duration: number; // in minutes
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
}

// Emergency Alert Types
export interface EmergencyAlertRequest {
  type: 'SAFETY' | 'ACCIDENT' | 'BREAKDOWN' | 'THEFT' | 'OTHER';
  location: Location;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  contactNumber?: string;
}

// Tracking Types
export interface LocationUpdate {
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number; // km/h
  heading?: number; // degrees
  address?: string;
}

// Search Types
export interface SearchFilters {
  truckType?: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  capacity?: number; // minimum capacity in tons
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
  rating?: number; // minimum rating
  priceRange?: {
    min?: number;
    max?: number;
  };
  availability?: boolean;
  verified?: boolean;
  quality?: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaymentCreateInput {
  bookingId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  status?: string;
} 