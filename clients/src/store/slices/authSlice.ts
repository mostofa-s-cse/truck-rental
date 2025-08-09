import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, RegisterData } from '@/types';
import { apiClient } from '@/lib/api';
import { setAuthData, getAuthData, clearAuthData } from '@/utils/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isInitialized: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', { email }); // Debug log
      const response = await apiClient.login({ email, password });
      console.log('Login response:', response); // Debug log
      
      if (response.success && response.data) {
        const authData = response.data as { user: User; token: string };
        const { user, token } = authData;
        
        // Store auth data using utility function
        setAuthData(user, token);
        
        return { user, token };
      } else {
        // Handle server error response
        console.log('Login failed with response:', response); // Debug log
        const errorMessage = response.message || response.error || 'Login failed';
        console.log('Extracted error message:', errorMessage); // Debug log
        return rejectWithValue(errorMessage);
      }
    } catch (error: unknown) {
      console.log('Login caught error:', error); // Debug log
      // Handle network or other errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
        const errorMessage = axiosError.response?.data?.message || 
                           axiosError.response?.data?.error || 
                           axiosError.message || 
                           'Login failed';
        console.log('Extracted axios error message:', errorMessage); // Debug log
        return rejectWithValue(errorMessage);
      }
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.log('Extracted generic error message:', errorMessage); // Debug log
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await apiClient.register(userData);
      
      if (response.success && response.data) {
        const authData = response.data as { user: User; token: string };
        const { user, token } = authData;
        
        // Store auth data using utility function
        setAuthData(user, token);
        
        return { user, token };
      } else {
        return rejectWithValue(response.message || 'Registration failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    // Clear auth data using utility function
    clearAuthData();
    return null;
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const authData = getAuthData();

      if (authData) {
        return authData;
      }
      
      return rejectWithValue('No stored auth data');
    } catch {
      return rejectWithValue('Failed to check auth status');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log('Login rejected with error:', action.payload); // Debug log
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
      });

    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isInitialized = true;
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer; 