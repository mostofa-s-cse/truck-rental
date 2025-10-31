import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoading: boolean;
  notification: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    show: boolean;
  };
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

const initialState: UIState = {
  isLoading: false,
  notification: {
    message: '',
    type: 'info',
    show: false,
  },
  theme: 'light',
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    showNotification: (state, action: PayloadAction<{ message: string; type?: 'success' | 'error' | 'warning' | 'info' }>) => {
      state.notification = {
        message: action.payload.message,
        type: action.payload.type || 'info',
        show: true,
      };
    },
    hideNotification: (state) => {
      state.notification.show = false;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const {
  setLoading,
  showNotification,
  hideNotification,
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer; 