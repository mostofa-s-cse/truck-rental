'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppDispatch } from '@/hooks/redux';
import { checkAuthStatus } from '@/store/slices/authSlice';

interface ReduxProviderProps {
  children: React.ReactNode;
}

// Component to initialize auth on mount
const ReduxInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return <>{children}</>;
};

const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <ReduxInitializer>
        {children}
      </ReduxInitializer>
    </Provider>
  );
};

export default ReduxProvider; 