'use client';

import { useEffect } from 'react';
import { useUI } from '@/hooks/useUI';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Notification = () => {
  const { notification, hideNotification } = useUI();

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000); // Auto hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [notification.show, hideNotification]);

  if (!notification.show) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`${getBgColor()} border rounded-lg shadow-lg p-4 flex items-start space-x-3`}>
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{notification.message}</p>
        </div>
        <button
          onClick={hideNotification}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification; 