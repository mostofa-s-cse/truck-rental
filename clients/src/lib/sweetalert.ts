import Swal from 'sweetalert2';

// Common configuration for all alerts
const commonConfig = {
  confirmButtonColor: '#3B82F6', // Blue color
  cancelButtonColor: '#6B7280', // Gray color
  timer: 3000, // Auto close after 3 seconds
  timerProgressBar: true,
  toast: true,
  position: 'top-end' as const,
  showConfirmButton: false,
  showCloseButton: true,
};

// Success alert
export const showSuccess = (message: string, title?: string) => {
  return Swal.fire({
    ...commonConfig,
    icon: 'success',
    title: title || 'Success!',
    text: message,
    background: '#F0FDF4', // Light green background
    color: '#166534', // Dark green text
    iconColor: '#22C55E', // Green icon
  });
};

// Error alert
export const showError = (message: string, title?: string) => {
  return Swal.fire({
    ...commonConfig,
    icon: 'error',
    title: title || 'Error!',
    text: message,
    background: '#FEF2F2', // Light red background
    color: '#991B1B', // Dark red text
    iconColor: '#EF4444', // Red icon
  });
};

// Warning alert
export const showWarning = (message: string, title?: string) => {
  return Swal.fire({
    ...commonConfig,
    icon: 'warning',
    title: title || 'Warning!',
    text: message,
    background: '#FFFBEB', // Light yellow background
    color: '#92400E', // Dark orange text
    iconColor: '#F59E0B', // Orange icon
  });
};

// Info alert
export const showInfo = (message: string, title?: string) => {
  return Swal.fire({
    ...commonConfig,
    icon: 'info',
    title: title || 'Info',
    text: message,
    background: '#EFF6FF', // Light blue background
    color: '#1E40AF', // Dark blue text
    iconColor: '#3B82F6', // Blue icon
  });
};

// Question alert (for confirmations)
export const showQuestion = (message: string, title?: string) => {
  return Swal.fire({
    icon: 'question',
    title: title || 'Confirm',
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    confirmButtonColor: '#3B82F6',
    cancelButtonColor: '#6B7280',
  });
};

// Loading alert
export const showLoading = (message: string = 'Loading...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close any open alert
export const closeAlert = () => {
  Swal.close();
};

// Custom alert with custom configuration
export const showCustomAlert = (config: Partial<typeof Swal.fire>) => {
  return Swal.fire({
    ...commonConfig,
    ...config,
  });
};

// Success toast (smaller, less intrusive)
export const showSuccessToast = (message: string) => {
  return Swal.fire({
    ...commonConfig,
    icon: 'success',
    title: message,
    toast: true,
    position: 'top-end',
    timer: 2000,
    showConfirmButton: false,
  });
};

// Error toast
export const showErrorToast = (message: string) => {
  return Swal.fire({
    ...commonConfig,
    icon: 'error',
    title: message,
    toast: true,
    position: 'top-end',
    timer: 3000,
    showConfirmButton: false,
  });
};

// Warning toast
export const showWarningToast = (message: string) => {
  return Swal.fire({
    ...commonConfig,
    icon: 'warning',
    title: message,
    toast: true,
    position: 'top-end',
    timer: 2500,
    showConfirmButton: false,
  });
};

// Info toast
export const showInfoToast = (message: string) => {
  return Swal.fire({
    ...commonConfig,
    icon: 'info',
    title: message,
    toast: true,
    position: 'top-end',
    timer: 2000,
    showConfirmButton: false,
  });
}; 