# SweetAlert2 Integration Guide

This guide explains how to use SweetAlert2 for beautiful, responsive alerts and notifications in your Next.js application.

## Installation

SweetAlert2 is already installed in your project:
```bash
npm install sweetalert2
```

## Quick Start

### 1. Basic Usage

Import the SweetAlert2 utility functions:

```typescript
import { useSweetAlert } from '@/hooks/useSweetAlert';

const MyComponent = () => {
  const { success, error, warning, info } = useSweetAlert();

  const handleSuccess = () => {
    success('Operation completed successfully!', 'Success!');
  };

  const handleError = () => {
    error('Something went wrong!', 'Error!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
};
```

### 2. Toast Notifications

For less intrusive notifications, use toast alerts:

```typescript
const { successToast, errorToast, warningToast, infoToast } = useSweetAlert();

// Quick success notification
successToast('Data saved successfully!');

// Error notification
errorToast('Failed to save data');

// Warning notification
warningToast('Please check your input');

// Info notification
infoToast('New message received');
```

### 3. Interactive Alerts

For confirmations and user interactions:

```typescript
const { question, loading } = useSweetAlert();

// Confirmation dialog
const handleDelete = async () => {
  const result = await question('Are you sure you want to delete this item?', 'Confirm Delete');
  
  if (result.isConfirmed) {
    // Proceed with deletion
    await deleteItem();
  }
};

// Loading alert
const handleAsyncOperation = async () => {
  const loadingAlert = loading('Processing your request...');
  
  try {
    await someAsyncOperation();
    loadingAlert.close();
    successToast('Operation completed!');
  } catch (error) {
    loadingAlert.close();
    errorToast('Operation failed!');
  }
};
```

## Advanced Usage

### 1. Utility Wrappers

The `useSweetAlert` hook provides utility wrappers for common patterns:

```typescript
const { withLoading, withConfirmation } = useSweetAlert();

// With loading wrapper
const handleApiCall = async () => {
  const result = await withLoading(
    () => apiClient.getData(),
    'Loading data...',
    'Data loaded successfully!',
    'Failed to load data'
  );
  
  if (result) {
    // Handle success
  }
};

// With confirmation wrapper
const handleDelete = async () => {
  const result = await withConfirmation(
    () => apiClient.deleteItem(id),
    'Are you sure you want to delete this item?',
    'Confirm Delete'
  );
  
  if (result) {
    // Item was deleted
  }
};
```

### 2. Custom Alerts

For custom styling and behavior:

```typescript
const { custom } = useSweetAlert();

const showCustomAlert = () => {
  custom({
    title: 'Custom Alert!',
    text: 'This is a custom alert with custom styling.',
    icon: 'success',
    background: '#FEF3C7',
    color: '#92400E',
    confirmButtonText: 'Custom Button',
    confirmButtonColor: '#F59E0B',
    showCancelButton: true,
    cancelButtonText: 'Cancel',
  });
};
```

### 3. API Integration

Use the enhanced API client with built-in SweetAlert2 integration:

```typescript
import { apiClientWithSweetAlert } from '@/lib/apiWithSweetAlert';

// Automatic loading, success, and error handling
const handleLogin = async (credentials) => {
  const result = await apiClientWithSweetAlert.login(credentials, {
    loadingMessage: 'Logging you in...',
    successMessage: 'Welcome back!',
    errorMessage: 'Invalid credentials',
  });
  
  if (result) {
    // Login successful
    router.push('/dashboard');
  }
};

// Custom options
const handleUpdateProfile = async (data) => {
  const result = await apiClientWithSweetAlert.updateDriver(data, {
    showLoading: true,
    showSuccess: true,
    showError: true,
    loadingMessage: 'Updating profile...',
    successMessage: 'Profile updated!',
    errorMessage: 'Update failed',
  });
};
```

## Available Functions

### Basic Alerts
- `success(message, title?)` - Success alert
- `error(message, title?)` - Error alert
- `warning(message, title?)` - Warning alert
- `info(message, title?)` - Info alert
- `question(message, title?)` - Confirmation dialog

### Toast Notifications
- `successToast(message)` - Success toast
- `errorToast(message)` - Error toast
- `warningToast(message)` - Warning toast
- `infoToast(message)` - Info toast

### Utility Functions
- `loading(message?)` - Show loading alert
- `close()` - Close any open alert
- `custom(config)` - Custom alert with full configuration

### Utility Wrappers
- `withLoading(asyncFunction, loadingMessage?, successMessage?, errorMessage?)` - Wrapper for async operations
- `withConfirmation(asyncFunction, confirmMessage?, confirmTitle?)` - Wrapper for confirmations

### Redux Integration
- `showSuccessNotification(message, title?)` - Shows both SweetAlert2 and Redux notification
- `showErrorNotification(message, title?)` - Shows both SweetAlert2 and Redux notification
- `showWarningNotification(message, title?)` - Shows both SweetAlert2 and Redux notification
- `showInfoNotification(message, title?)` - Shows both SweetAlert2 and Redux notification

## Configuration

### Default Styling

The SweetAlert2 alerts are configured with:
- **Position**: Top-end (top-right corner)
- **Timer**: 3 seconds auto-close
- **Progress Bar**: Enabled
- **Toast Mode**: Enabled for less intrusive notifications
- **Colors**: Tailwind CSS color palette

### Customizing Configuration

You can modify the default configuration in `src/lib/sweetalert.ts`:

```typescript
const commonConfig = {
  confirmButtonColor: '#3B82F6', // Change button color
  timer: 5000, // Change auto-close timer
  position: 'center' as const, // Change position
  // ... other options
};
```

## Best Practices

### 1. Use Appropriate Alert Types
- **Success**: For successful operations
- **Error**: For errors and failures
- **Warning**: For warnings and cautions
- **Info**: For informational messages
- **Question**: For user confirmations

### 2. Choose Between Alerts and Toasts
- **Alerts**: For important messages that require user attention
- **Toasts**: For quick notifications that don't require action

### 3. Handle Async Operations
```typescript
// Good: Use withLoading wrapper
const result = await withLoading(
  () => apiCall(),
  'Loading...',
  'Success!',
  'Error!'
);

// Good: Manual loading handling
const loadingAlert = loading('Processing...');
try {
  await apiCall();
  loadingAlert.close();
  successToast('Success!');
} catch (error) {
  loadingAlert.close();
  errorToast('Error!');
}
```

### 4. Use Confirmation for Destructive Actions
```typescript
const handleDelete = async () => {
  const result = await withConfirmation(
    () => deleteItem(),
    'Are you sure? This action cannot be undone.',
    'Confirm Delete'
  );
};
```

## Demo

Visit `/sweetalert-demo` to see all SweetAlert2 functions in action with interactive examples.

## Migration from Old Notification System

If you're migrating from the old notification system:

```typescript
// Old way
const { showNotification } = useUI();
showNotification('Success message', 'success');

// New way
const { successToast } = useSweetAlert();
successToast('Success message');

// Or for Redux integration
const { showSuccessNotification } = useSweetAlert();
showSuccessNotification('Success message');
```

## Troubleshooting

### Common Issues

1. **Alerts not showing**: Make sure you're calling the functions from a client component
2. **Styling issues**: Check if Tailwind CSS is properly loaded
3. **Multiple alerts**: Use `close()` to close existing alerts before showing new ones

### Debug Mode

Enable debug mode for development:

```typescript
import Swal from 'sweetalert2';

// Enable debug mode
Swal.mixin({
  debug: true
});
```

## API Reference

For complete SweetAlert2 API reference, visit: https://sweetalert2.github.io/ 