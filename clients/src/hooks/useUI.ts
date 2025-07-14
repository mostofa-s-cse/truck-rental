import { useAppDispatch, useAppSelector } from './redux';
import {
  setLoading,
  showNotification,
  hideNotification,
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
} from '@/store/slices/uiSlice';

export const useUI = () => {
  const dispatch = useAppDispatch();
  const { isLoading, notification, theme, sidebarOpen } = useAppSelector((state) => state.ui);

  const setUILoading = (loading: boolean) => {
    dispatch(setLoading(loading));
  };

  const showUINotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    dispatch(showNotification({ message, type }));
  };

  const hideUINotification = () => {
    dispatch(hideNotification());
  };

  const toggleUITheme = () => {
    dispatch(toggleTheme());
  };

  const setUITheme = (theme: 'light' | 'dark') => {
    dispatch(setTheme(theme));
  };

  const toggleUISidebar = () => {
    dispatch(toggleSidebar());
  };

  const setUISidebarOpen = (open: boolean) => {
    dispatch(setSidebarOpen(open));
  };

  return {
    // State
    isLoading,
    notification,
    theme,
    sidebarOpen,
    
    // Actions
    setLoading: setUILoading,
    showNotification: showUINotification,
    hideNotification: hideUINotification,
    toggleTheme: toggleUITheme,
    setTheme: setUITheme,
    toggleSidebar: toggleUISidebar,
    setSidebarOpen: setUISidebarOpen,
  };
}; 