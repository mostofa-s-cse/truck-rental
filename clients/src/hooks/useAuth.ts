import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  checkAuthStatus,
  clearError 
} from '@/store/slices/authSlice';
import { RegisterData } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check auth status on mount
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    await dispatch(loginUser({ email, password }));
  };

  const register = async (userData: RegisterData) => {
    await dispatch(registerUser(userData));
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error,
    clearError: clearAuthError,
  };
}; 