# Redux Store Documentation

This project uses Redux Toolkit for state management, replacing the previous Context API implementation.

## Store Structure

### Main Store (`/store/index.ts`)
- Configures the Redux store with all slices
- Exports `RootState` and `AppDispatch` types for type safety

### Slices

#### 1. Auth Slice (`/store/slices/authSlice.ts`)
Manages authentication state including:
- User data
- Authentication token
- Loading states
- Error handling

**Actions:**
- `loginUser` - Async thunk for user login
- `registerUser` - Async thunk for user registration
- `logoutUser` - Async thunk for user logout
- `checkAuthStatus` - Async thunk to check stored auth data
- `clearError` - Clear authentication errors
- `setLoading` - Set loading state

#### 2. UI Slice (`/store/slices/uiSlice.ts`)
Manages UI state including:
- Global loading states
- Notifications
- Theme (light/dark)
- Sidebar state

**Actions:**
- `setLoading` - Set global loading state
- `showNotification` - Show notification with message and type
- `hideNotification` - Hide current notification
- `toggleTheme` - Toggle between light/dark theme
- `setTheme` - Set specific theme
- `toggleSidebar` - Toggle sidebar open/closed
- `setSidebarOpen` - Set sidebar state

#### 3. Search Slice (`/store/slices/searchSlice.ts`)
Manages search functionality including:
- Search filters
- Search results
- Pagination
- Loading and error states

**Actions:**
- `setFilters` - Update search filters
- `clearFilters` - Clear all filters
- `setSearchQuery` - Set search query text
- `setSearchResults` - Set search results and total count
- `setCurrentPage` - Set current page for pagination
- `setItemsPerPage` - Set items per page
- `setLoading` - Set search loading state
- `setError` - Set search error
- `clearSearch` - Clear all search data

## Custom Hooks

### 1. `useAuth()` (`/hooks/useAuth.ts`)
Provides authentication functionality:
```typescript
const { user, token, login, register, logout, loading, error, clearError } = useAuth();
```

### 2. `useUI()` (`/hooks/useUI.ts`)
Provides UI state management:
```typescript
const { 
  isLoading, 
  notification, 
  theme, 
  sidebarOpen,
  setLoading,
  showNotification,
  hideNotification,
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen 
} = useUI();
```

### 3. `useSearch()` (`/hooks/useSearch.ts`)
Provides search functionality:
```typescript
const {
  filters,
  searchQuery,
  searchResults,
  totalResults,
  currentPage,
  itemsPerPage,
  isLoading,
  error,
  setFilters,
  clearFilters,
  setSearchQuery,
  setSearchResults,
  setCurrentPage,
  setItemsPerPage,
  setLoading,
  setError,
  clearSearch
} = useSearch();
```

### 4. Redux Hooks (`/hooks/redux.ts`)
Type-safe Redux hooks:
```typescript
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
```

## Usage Examples

### Authentication
```typescript
import { useAuth } from '@/hooks/useAuth';

const LoginComponent = () => {
  const { login, loading, error } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
};
```

### Notifications
```typescript
import { useUI } from '@/hooks/useUI';

const MyComponent = () => {
  const { showNotification } = useUI();
  
  const handleSuccess = () => {
    showNotification('Operation successful!', 'success');
  };
  
  const handleError = () => {
    showNotification('Something went wrong!', 'error');
  };
};
```

### Search
```typescript
import { useSearch } from '@/hooks/useSearch';

const SearchComponent = () => {
  const { 
    filters, 
    searchResults, 
    setFilters, 
    setSearchQuery 
  } = useSearch();
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ truckType: 'MINI_TRUCK' });
  };
};
```

## Provider Setup

The Redux store is provided at the root level in `app/layout.tsx`:

```typescript
import { ReduxProvider } from '@/providers/ReduxProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ReduxProvider>
          {children}
          <Notification />
        </ReduxProvider>
      </body>
    </html>
  );
}
```

## Migration from Context API

The following changes were made to migrate from Context API to Redux:

1. **Removed:**
   - `contexts/AuthContext.tsx`
   - `contexts/` directory
   - `AuthContextType` interface from types

2. **Added:**
   - Redux store configuration
   - Auth, UI, and Search slices
   - Custom hooks for each slice
   - Type-safe Redux hooks
   - Notification component

3. **Updated:**
   - All components now use Redux hooks instead of Context
   - Layout uses ReduxProvider instead of AuthProvider
   - Error handling now uses Redux state and notifications

## Benefits of Redux Toolkit

1. **Type Safety** - Full TypeScript support with type inference
2. **DevTools** - Built-in Redux DevTools support
3. **Performance** - Optimized re-renders and state updates
4. **Middleware** - Easy to add custom middleware
5. **Async Actions** - Built-in support for async operations with createAsyncThunk
6. **Immutability** - Automatic immutable updates with Immer
7. **Code Splitting** - Easy to split store into modules 