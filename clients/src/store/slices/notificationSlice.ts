import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotificationType, Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  filters: {
    type: 'all' | NotificationType;
    priority: 'all' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'all' | 'read' | 'unread';
    search: string;
  };
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  filters: {
    type: 'all',
    priority: 'all',
    status: 'all',
    search: '',
  },
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async () => {
    // This will be implemented when we connect to the API
    return [] as Notification[];
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async () => {
    // This will be implemented when we connect to the API
    return 0;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    // This will be implemented when we connect to the API
    return notificationId;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    // This will be implemented when we connect to the API
    return true;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId: string) => {
    // This will be implemented when we connect to the API
    return notificationId;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateNotification: (state, action: PayloadAction<{ id: string; updates: Partial<Notification> }>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        const oldNotification = state.notifications[index];
        const newNotification = { ...oldNotification, ...action.payload.updates };
        
        // Update unread count
        if (oldNotification.isRead !== newNotification.isRead) {
          if (newNotification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          } else {
            state.unreadCount += 1;
          }
        }
        
        state.notifications[index] = newNotification;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setFilters: (state, action: PayloadAction<Partial<NotificationState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      .addCase(fetchUnreadCount.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch unread count';
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      });
  },
});

export const {
  setNotifications,
  setUnreadCount,
  addNotification,
  updateNotification,
  removeNotification,
  setFilters,
  clearFilters,
  setLoading,
  setError,
  clearError,
} = notificationSlice.actions;

export default notificationSlice.reducer;
