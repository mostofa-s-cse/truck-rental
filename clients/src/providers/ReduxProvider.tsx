'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';

interface ReduxProviderProps {
  children: React.ReactNode;
}

// Component to check auth status on mount
const AuthChecker: React.FC = () => {
  useEffect(() => {
    // Check auth status on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          // Dispatch auth success action
          store.dispatch({
            type: 'auth/checkStatus/fulfilled',
            payload: { user, token }
          });
        } else {
          // Dispatch auth failure action
          store.dispatch({
            type: 'auth/checkStatus/rejected',
            payload: 'No stored auth data'
          });
        }
      } catch (error) {
        // Dispatch auth failure action
        store.dispatch({
          type: 'auth/checkStatus/rejected',
          payload: 'Failed to check auth status'
        });
      }
    };
    
    checkAuth();
  }, []);

  return null;
};

const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthChecker />
      {children}
    </Provider>
  );
};

export default ReduxProvider; 