export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'DRIVER' | 'USER';
  avatar?: string;
  isActive: boolean;
  // Driver-only: availability flag for accepting jobs
  isAvailable?: boolean;
  createdAt: string;
}

export interface Driver {
  id: string;
  userId: string;
  truckType: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  capacity: number;
  quality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
  license: string;
  registration: string;
  documents?: string[];
  location: string;
  latitude?: number;
  longitude?: number;
  isAvailable: boolean;
  isVerified: boolean;
  rating: number;
  totalTrips: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  reviews?: Review[];
}

export interface Booking {
  id: string;
  userId: string;
  driverId: string;
  source: string;
  destination: string;
  sourceLat?: number;
  sourceLng?: number;
  destLat?: number;
  destLng?: number;
  distance?: number;
  fare: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  pickupTime?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  driver: Driver;
  review?: Review;
}

export interface Review {
  id: string;
  userId: string;
  driverId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: User;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
}

export interface ApiResponse<T = unknown> {
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



export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'ADMIN' | 'DRIVER' | 'USER';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateDriverData {
  truckType: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  capacity: number;
  quality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
  license: string;
  registration: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateBookingData {
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

export interface SearchDriversParams {
  truckType?: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  capacity?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface SearchFilters {
  truckType?: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  capacity?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  rating?: number;
  priceRange?: {
    min?: number;
    max?: number;
  };
  availability?: boolean;
  verified?: boolean;
  quality?: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

export interface SearchResult {
  drivers: Driver[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: SearchFilters;
} 