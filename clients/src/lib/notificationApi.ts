import { Notification, NotificationResponse, UnreadCountResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class NotificationApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = localStorage.getItem('token');
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      console.log(`Making request to: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      console.log(`Response status: ${response.status} for ${endpoint}`);
      
      if (!response.ok) {
        // Log the error response for debugging
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = `${errorMessage} - ${errorData.message}`;
          }
        } catch {
          // If we can't parse the error response, use the status text
          errorMessage = `${errorMessage} - ${response.statusText}`;
        }
        
        console.error(`Request failed for ${endpoint}:`, errorMessage);
        
        // For 500 errors, throw a specific error that we can catch
        if (response.status === 500) {
          throw new Error(`Server error (500): ${errorMessage}`);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log(`Request successful for ${endpoint}:`, { success: data.success, dataCount: data.data?.length || 0 });
      return data;
    } catch (error) {
      console.error(`Request error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(limit: number = 20): Promise<Notification[]> {
    try {
      const response = await this.request<NotificationResponse>(`/notifications/user?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      
      // If it's a server error (500), return empty array instead of crashing
      if (error instanceof Error && error.message.includes('Server error (500)')) {
        console.warn('User notifications endpoint returned 500, returning empty array');
        return [];
      }
      
      // For other errors, also return empty array to prevent app crashes
      return [];
    }
  }

  // Get driver notifications
  async getDriverNotifications(limit: number = 20): Promise<Notification[]> {
    try {
      const response = await this.request<NotificationResponse>(`/notifications/driver?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching driver notifications:', error);
      
      // If it's a server error (500), return empty array instead of crashing
      if (error instanceof Error && error.message.includes('Server error (500)')) {
        console.warn('Driver notifications endpoint returned 500, returning empty array');
        return [];
      }
      
      // For other errors, also return empty array to prevent app crashes
      return [];
    }
  }

  // Get admin notifications
  async getAdminNotifications(limit: number = 20): Promise<Notification[]> {
    try {
      const response = await this.request<NotificationResponse>(`/notifications/admin?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      
      // If it's a server error (500), return empty array instead of crashing
      if (error instanceof Error && error.message.includes('Server error (500)')) {
        console.warn('Admin notifications endpoint returned 500, returning empty array');
        console.warn('This might be due to:');
        console.warn('1. No admin notifications exist in the database yet');
        console.warn('2. Database connection issues on the server');
        console.warn('3. Server-side exceptions in the notification service');
        console.warn('4. User might not have ADMIN role or insufficient permissions');
        return [];
      }
      
      // For other errors, also return empty array to prevent app crashes
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, message: 'Failed to mark notification as read' };
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request('/notifications/mark-all-read', {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, message: 'Failed to mark all notifications as read' };
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request(`/notifications/${notificationId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, message: 'Failed to delete notification' };
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.request<UnreadCountResponse>('/notifications/unread-count');
      return response.data?.unreadCount || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Helper method to check if user has admin role (for debugging)
  async checkUserRole(): Promise<{ role?: string; isAuthenticated: boolean }> {
    try {
      // Try to get user profile or any authenticated endpoint
      const response = await this.request<{ data?: { role?: string } }>('/auth/me');
      return { 
        role: response.data?.role, 
        isAuthenticated: true 
      };
    } catch (error) {
      console.error('Error checking user role:', error);
      return { isAuthenticated: false };
    }
  }
}

export const notificationApi = new NotificationApi();
export default notificationApi;
