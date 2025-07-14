'use client';

import { useState } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import Button from './Button';

const SweetAlertExamples = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const {
    successToast,
    errorToast,
    warningToast,
    infoToast,
    question,
    withLoading,
    withConfirmation,
  } = useSweetAlert();

  // Form validation example
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      errorToast('Please enter your name');
      return;
    }
    
    if (!formData.email.trim()) {
      errorToast('Please enter your email');
      return;
    }
    
    if (!formData.email.includes('@')) {
      warningToast('Please enter a valid email address');
      return;
    }
    
    const result = await withLoading(
      () => new Promise(resolve => setTimeout(() => resolve('Success'), 2000)),
      'Submitting form...',
      'Form submitted successfully!',
      'Failed to submit form'
    );
    
    if (result) {
      setFormData({ name: '', email: '' });
    }
  };

  // Delete confirmation example
  const handleDeleteItem = async () => {
    const result = await withConfirmation(
      () => new Promise(resolve => setTimeout(() => resolve('Deleted'), 1000)),
      'Are you sure you want to delete this item? This action cannot be undone.',
      'Confirm Delete'
    );
    
    if (result) {
      successToast('Item deleted successfully!');
    }
  };

  // API error handling example
  const handleApiCall = async () => {
    const result = await withLoading(
      () => new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve('API call successful');
          } else {
            reject(new Error('Network error'));
          }
        }, 1500);
      }),
      'Making API call...',
      'API call completed successfully!',
      'API call failed. Please try again.'
    );
    
    if (result) {
      infoToast('You can now proceed with the next step');
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">SweetAlert2 Examples</h2>
      
      {/* Form Validation Example */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Form Validation</h3>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <Button type="submit" className="w-full">
            Submit Form
          </Button>
        </form>
      </div>

      {/* Action Examples */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Action Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleDeleteItem}
            className="bg-red-500 hover:bg-red-600"
          >
            Delete Item (with confirmation)
          </Button>
          <Button
            onClick={handleApiCall}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Simulate API Call
          </Button>
        </div>
      </div>

      {/* Quick Notifications */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Quick Notifications</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => successToast('Operation completed successfully!')}
            className="bg-green-500 hover:bg-green-600"
          >
            Success Toast
          </Button>
          <Button
            onClick={() => errorToast('Something went wrong!')}
            className="bg-red-500 hover:bg-red-600"
          >
            Error Toast
          </Button>
          <Button
            onClick={() => warningToast('Please check your input!')}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Warning Toast
          </Button>
          <Button
            onClick={() => infoToast('Here is some information!')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Info Toast
          </Button>
        </div>
      </div>

      {/* Confirmation Examples */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Confirmation Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => question('Do you want to proceed?', 'Confirm Action')}
            className="bg-purple-500 hover:bg-purple-600"
          >
            Simple Confirmation
          </Button>
          <Button
            onClick={() => question('This will permanently delete your account. Are you absolutely sure?', 'Dangerous Action')}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Dangerous Action
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SweetAlertExamples; 