import { useCallback } from 'react';
import { useUI } from './useUI';
import Swal from 'sweetalert2';
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showQuestion,
  showLoading,
  closeAlert,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showCustomAlert,
} from '@/lib/sweetalert';

export const useSweetAlert = () => {
  const { showNotification } = useUI();

  // Direct SweetAlert2 functions
  const success = useCallback((message: string, title?: string) => {
    return showSuccess(message, title);
  }, []);

  const error = useCallback((message: string, title?: string) => {
    return showError(message, title);
  }, []);

  const warning = useCallback((message: string, title?: string) => {
    return showWarning(message, title);
  }, []);

  const info = useCallback((message: string, title?: string) => {
    return showInfo(message, title);
  }, []);

  const question = useCallback((message: string, title?: string) => {
    return showQuestion(message, title);
  }, []);

  const loading = useCallback((message?: string) => {
    return showLoading(message);
  }, []);

  const close = useCallback(() => {
    closeAlert();
  }, []);

  // Toast functions
  const successToast = useCallback((message: string) => {
    return showSuccessToast(message);
  }, []);

  const errorToast = useCallback((message: string) => {
    return showErrorToast(message);
  }, []);

  const warningToast = useCallback((message: string) => {
    return showWarningToast(message);
  }, []);

  const infoToast = useCallback((message: string) => {
    return showInfoToast(message);
  }, []);

  // Custom alert
  const custom = useCallback((config: Partial<typeof Swal.fire>) => {
    return showCustomAlert(config);
  }, []);

  // Redux-integrated functions (also shows SweetAlert2)
  const showSuccessNotification = useCallback((message: string, title?: string) => {
    showNotification(message, 'success');
    return showSuccess(message, title);
  }, [showNotification]);

  const showErrorNotification = useCallback((message: string, title?: string) => {
    showNotification(message, 'error');
    return showError(message, title);
  }, [showNotification]);

  const showWarningNotification = useCallback((message: string, title?: string) => {
    showNotification(message, 'warning');
    return showWarning(message, title);
  }, [showNotification]);

  const showInfoNotification = useCallback((message: string, title?: string) => {
    showNotification(message, 'info');
    return showInfo(message, title);
  }, [showNotification]);

  // Async wrapper for API calls with loading and error handling
  const withLoading = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    loadingMessage: string = 'Loading...',
    successMessage?: string,
    errorMessage: string = 'Something went wrong'
  ): Promise<T | null> => {
    try {
      showLoading(loadingMessage);
      
      const result = await asyncFunction();
      
      closeAlert();
      
      if (successMessage) {
        showSuccessToast(successMessage);
      }
      
      return result;
    } catch (err) {
      closeAlert();
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      showErrorToast(errorMsg);
      return null;
    }
  }, []);

  // Confirmation dialog wrapper
  const withConfirmation = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    confirmMessage: string = 'Are you sure?',
    confirmTitle: string = 'Confirm Action'
  ): Promise<T | null> => {
    const result = await showQuestion(confirmMessage, confirmTitle);
    
    if (result.isConfirmed) {
      return await asyncFunction();
    }
    
    return null;
  }, []);

  return {
    // Direct SweetAlert2 functions
    success,
    error,
    warning,
    info,
    question,
    loading,
    close,
    
    // Toast functions
    successToast,
    errorToast,
    warningToast,
    infoToast,
    
    // Custom alert
    custom,
    
    // Redux-integrated functions
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification,
    
    // Utility wrappers
    withLoading,
    withConfirmation,
  };
}; 