'use client';

import { useSweetAlert } from '@/hooks/useSweetAlert';
import Button from './Button';

const SweetAlertDemo = () => {
  const {
    success,
    error,
    warning,
    info,
    question,
    loading,
    successToast,
    errorToast,
    warningToast,
    infoToast,
    withLoading,
    withConfirmation,
    custom,
  } = useSweetAlert();

  const handleAsyncOperation = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Operation completed successfully!');
      }, 2000);
    });
  };

  const handleDeleteOperation = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Item deleted successfully!');
      }, 1000);
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">SweetAlert2 Demo</h2>
      
      {/* Basic Alerts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Basic Alerts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => success('Operation completed successfully!', 'Success!')}
            className="bg-green-500 hover:bg-green-600"
          >
            Success Alert
          </Button>
          <Button
            onClick={() => error('Something went wrong!', 'Error!')}
            className="bg-red-500 hover:bg-red-600"
          >
            Error Alert
          </Button>
          <Button
            onClick={() => warning('Please be careful!', 'Warning!')}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Warning Alert
          </Button>
          <Button
            onClick={() => info('Here is some information.', 'Info')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Info Alert
          </Button>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Toast Notifications</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => successToast('Success toast message!')}
            className="bg-green-500 hover:bg-green-600"
          >
            Success Toast
          </Button>
          <Button
            onClick={() => errorToast('Error toast message!')}
            className="bg-red-500 hover:bg-red-600"
          >
            Error Toast
          </Button>
          <Button
            onClick={() => warningToast('Warning toast message!')}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Warning Toast
          </Button>
          <Button
            onClick={() => infoToast('Info toast message!')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Info Toast
          </Button>
        </div>
      </div>

      {/* Interactive Alerts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Interactive Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={() => question('Are you sure you want to delete this item?', 'Confirm Delete')}
            className="bg-purple-500 hover:bg-purple-600"
          >
            Confirmation Dialog
          </Button>
          <Button
            onClick={() => loading('Processing your request...')}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Loading Alert
          </Button>
        </div>
      </div>

      {/* Utility Wrappers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Utility Wrappers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={() => withLoading(
              handleAsyncOperation,
              'Processing...',
              'Operation completed!',
              'Operation failed!'
            )}
            className="bg-indigo-500 hover:bg-indigo-600"
          >
            With Loading Wrapper
          </Button>
          <Button
            onClick={() => withConfirmation(
              handleDeleteOperation,
              'Are you sure you want to delete this item?',
              'Confirm Delete'
            )}
            className="bg-orange-500 hover:bg-orange-600"
          >
            With Confirmation Wrapper
          </Button>
        </div>
      </div>

      {/* Custom Alert */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Custom Alert</h3>
        <Button
          onClick={() => {
            custom({
              title: 'Custom Alert!',
              text: 'This is a custom alert with custom styling.',
              icon: 'success',
              background: '#FEF3C7',
              color: '#92400E',
              confirmButtonText: 'Custom Button',
              confirmButtonColor: '#F59E0B',
            });
          }}
          className="bg-pink-500 hover:bg-pink-600"
        >
          Custom Alert
        </Button>
      </div>
    </div>
  );
};

export default SweetAlertDemo; 