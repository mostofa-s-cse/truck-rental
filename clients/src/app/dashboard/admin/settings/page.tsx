'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@/hooks/redux';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { adminApi, SystemSetting } from '@/lib/adminApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  CogIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  BellIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface SettingsCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  settings: SystemSetting[];
}

export default function AdminSettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { successToast, errorToast, confirmDialog } = useSweetAlert();
  
  // State
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      errorToast('Failed to fetch system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSetting = (setting: SystemSetting) => {
    setEditingSetting(setting.key);
    setEditValues(prev => ({
      ...prev,
      [setting.key]: setting.value
    }));
  };

  const handleSaveSetting = async (setting: SystemSetting) => {
    try {
      const newValue = editValues[setting.key];
      if (newValue === undefined || newValue === setting.value) {
        setEditingSetting(null);
        return;
      }

      await adminApi.updateSystemSetting(setting.key, newValue, setting.type);
      
      // Update local state
      setSettings(prev => prev.map(s => 
        s.key === setting.key 
          ? { ...s, value: newValue, updatedAt: new Date().toISOString() }
          : s
      ));
      
      setEditingSetting(null);
      successToast('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      errorToast('Failed to update setting');
    }
  };

  const handleCancelEdit = () => {
    setEditingSetting(null);
    setEditValues({});
  };

  const formatSettingName = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getSettingValue = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return setting.value === 'true' ? 'Yes' : 'No';
      case 'number':
        return setting.value;
      case 'json':
        try {
          return JSON.stringify(JSON.parse(setting.value), null, 2);
        } catch {
          return setting.value;
        }
      default:
        return setting.value;
    }
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const value = editValues[setting.key] || setting.value;

    switch (setting.type) {
      case 'boolean':
        return (
          <select
            value={value}
            onChange={(e) => setEditValues(prev => ({
              ...prev,
              [setting.key]: e.target.value
            }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setEditValues(prev => ({
              ...prev,
              [setting.key]: e.target.value
            }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      case 'json':
        return (
          <textarea
            value={value}
            onChange={(e) => setEditValues(prev => ({
              ...prev,
              [setting.key]: e.target.value
            }))}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter JSON data..."
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setEditValues(prev => ({
              ...prev,
              [setting.key]: e.target.value
            }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  const categories = useMemo(() => [
    {
      id: 'general',
      name: 'General Settings',
      icon: CogIcon,
      description: 'Basic system configuration',
      settings: settings.filter(s => 
        ['app_version', 'maintenance_mode', 'force_update_version', 'support_email', 'support_phone', 'emergency_contact'].includes(s.key)
      )
    },
    {
      id: 'business',
      name: 'Business Settings',
      icon: CurrencyDollarIcon,
      description: 'Business and financial configuration',
      settings: settings.filter(s => 
        ['base_fare_per_km', 'minimum_fare', 'max_distance_km', 'driver_commission_percentage', 'platform_fee_percentage', 'cancellation_fee_percentage', 'payment_methods', 'payment_timeout_minutes'].includes(s.key)
      )
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      description: 'Email and notification settings',
      settings: settings.filter(s => 
        ['push_notifications_enabled', 'email_notifications_enabled', 'sms_notifications_enabled'].includes(s.key)
      )
    },
    {
      id: 'security',
      name: 'Security',
      icon: ShieldCheckIcon,
      description: 'Security and authentication settings',
      settings: settings.filter(s => 
        ['max_login_attempts', 'lockout_duration_minutes', 'session_timeout_hours'].includes(s.key)
      )
    },
    {
      id: 'drivers',
      name: 'Driver Settings',
      icon: TruckIcon,
      description: 'Driver-related configuration',
      settings: settings.filter(s => 
        ['driver_verification_required', 'max_driver_rating', 'min_driver_rating'].includes(s.key)
      )
    },
    {
      id: 'booking',
      name: 'Booking Settings',
      icon: DocumentTextIcon,
      description: 'Booking and reservation settings',
      settings: settings.filter(s => 
        ['booking_timeout_minutes', 'max_active_bookings_per_user', 'auto_cancel_after_hours'].includes(s.key)
      )
    },
    {
      id: 'features',
      name: 'Feature Flags',
      icon: GlobeAltIcon,
      description: 'Enable or disable system features',
      settings: settings.filter(s => 
        ['tracking_enabled', 'chat_enabled', 'emergency_alerts_enabled', 'reviews_enabled'].includes(s.key)
      )
    }
  ], [settings]);

  const activeCategoryData = categories.find(cat => cat.id === activeCategory);

  const filteredSettings = searchTerm 
    ? settings.filter(s => 
        formatSettingName(s.key).toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.key.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : activeCategoryData?.settings || [];

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="System Settings" subtitle="Manage system configuration">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="System Settings" subtitle="Manage system configuration">
        <div className="space-y-6">
          {/* Category Navigation */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Settings Categories</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <category.icon className={`h-6 w-6 ${
                        activeCategory === category.id ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <div className="text-left">
                        <h4 className={`font-medium ${
                          activeCategory === category.id ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {category.name}
                        </h4>
                        <p className={`text-sm ${
                          activeCategory === category.id ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {category.settings.length} settings
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Settings List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {searchTerm ? 'Search Results' : activeCategoryData?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchTerm 
                      ? `Found ${filteredSettings.length} settings matching "${searchTerm}"`
                      : activeCategoryData?.description
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Search Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search settings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {filteredSettings.length} settings
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {filteredSettings.length === 0 ? (
                <div className="text-center py-12">
                  <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchTerm ? 'No settings found' : 'No settings found'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? `No settings match your search for "${searchTerm}"`
                      : 'No settings available for this category.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredSettings.map((setting) => (
                    <div key={setting.key} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                                                     <div className="flex items-center space-x-2 mb-2">
                             <h4 className="text-lg font-medium text-gray-900">
                               {formatSettingName(setting.key)}
                             </h4>
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                               {setting.type}
                             </span>
                           </div>
                          
                          {setting.description && (
                            <p className="text-sm text-gray-600 mb-4">
                              {setting.description}
                            </p>
                          )}

                          {editingSetting === setting.key ? (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Value
                                </label>
                                {renderSettingInput(setting)}
                              </div>
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => handleSaveSetting(setting)}
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <XCircleIcon className="h-4 w-4 mr-2" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Current Value
                                </label>
                                <div className="bg-gray-50 rounded-md p-3">
                                  <pre className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                                    {getSettingValue(setting)}
                                  </pre>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                  Last updated: {new Date(setting.updatedAt).toLocaleString()}
                                </div>
                                <button
                                  onClick={() => handleEditSetting(setting)}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <PencilIcon className="h-4 w-4 mr-2" />
                                  Edit
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 