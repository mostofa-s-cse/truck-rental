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
    console.log('useAuth: Starting login dispatch'); // Debug log
    const result = await dispatch(loginUser({ email, password }));
    console.log('useAuth: Login dispatch result:', result); // Debug log
    
    // Check if the action was rejected
    if (loginUser.rejected.match(result)) {
      console.log('useAuth: Login rejected, throwing error'); // Debug log
      throw new Error(result.payload as string || 'Login failed');
    }
    
    console.log('useAuth: Login successful, returning payload'); // Debug log
    return result.payload;
  };

  const register = async (userData: RegisterData) => {
    const result = await dispatch(registerUser(userData));
    
    // Check if the action was rejected
    if (registerUser.rejected.match(result)) {
      throw new Error(result.payload as string || 'Registration failed');
    }
    
    return result.payload;
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