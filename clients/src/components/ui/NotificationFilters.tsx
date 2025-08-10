'use client';

import React from 'react';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { NotificationType } from '@/types';

interface Filters {
  type: 'all' | NotificationType;
  priority: 'all' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'all' | 'read' | 'unread';
  search: string;
}

interface NotificationFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const notificationTypes: { value: NotificationType; label: string }[] = [
    { value: 'BOOKING_CREATED', label: 'Booking Created' },
    { value: 'BOOKING_ACCEPTED', label: 'Booking Accepted' },
    { value: 'BOOKING_REJECTED', label: 'Booking Rejected' },
    { value: 'TRIP_STARTED', label: 'Trip Started' },
    { value: 'TRIP_COMPLETED', label: 'Trip Completed' },
    { value: 'TRIP_CANCELLED', label: 'Trip Cancelled' },
    { value: 'PAYMENT_RECEIVED', label: 'Payment Received' },
    { value: 'PAYMENT_FAILED', label: 'Payment Failed' },
    { value: 'DRIVER_ARRIVED', label: 'Driver Arrived' },
    { value: 'EMERGENCY_ALERT', label: 'Emergency Alert' },
    { value: 'SYSTEM_ALERT', label: 'System Alert' }
  ];

  const priorities = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'read', label: 'Read' },
    { value: 'unread', label: 'Unread' }
  ];

  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: 'all',
      priority: 'all',
      status: 'all',
      search: ''
    });
  };

  const hasActiveFilters = filters.type !== 'all' || 
                          filters.priority !== 'all' || 
                          filters.status !== 'all' || 
                          filters.search !== '';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search notifications..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Types</option>
            {notificationTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            id="priority"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Priorities</option>
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {filters.type !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Type: {notificationTypes.find(t => t.value === filters.type)?.label}
                <button
                  onClick={() => handleFilterChange('type', 'all')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.priority !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Priority: {priorities.find(p => p.value === filters.priority)?.label}
                <button
                  onClick={() => handleFilterChange('priority', 'all')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-orange-400 hover:bg-orange-200 hover:text-orange-500 focus:outline-none focus:bg-orange-500 focus:text-white"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {statuses.find(s => s.value === filters.status)?.label}
                <button
                  onClick={() => handleFilterChange('status', 'all')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:bg-green-500 focus:text-white"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Search: &quot;{filters.search}&quot;
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none focus:bg-purple-500 focus:text-white"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationFilters;
