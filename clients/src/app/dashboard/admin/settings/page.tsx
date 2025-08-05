'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppSelector } from '@/hooks/redux';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { adminApi, SystemSetting } from '@/lib/adminApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import Button from '@/components/ui/Button';
import { 
  CogIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  BellIcon,
  ShieldCheckIcon,
  TruckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SettingsCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  settings: SystemSetting[];
  color: string;
}

interface ImportedSetting {
  key: string;
  value: string;
  type: string;
  description?: string;
}

interface SettingValidation {
  isValid: boolean;
  error?: string;
}

interface SettingHistory {
  id: string;
  settingKey: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
}

export default function AdminSettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { successToast, errorToast, withConfirmation } = useSweetAlert();
  
  // State
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({});
  const [settingHistory, setSettingHistory] = useState<SettingHistory[]>([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedSettings, setSelectedSettings] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, [refreshKey]);

  // Auto-refresh settings every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSystemSettings();
      setSettings(data);
      
      // Fetch setting history for advanced view
      if (showAdvanced) {
        await fetchSettingHistory();
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      errorToast('Failed to fetch system settings');
    } finally {
      setLoading(false);
    }
  }, [showAdvanced, errorToast]);

  const fetchSettingHistory = async () => {
    try {
      // Mock history data - replace with real API call
      const mockHistory: SettingHistory[] = [
        {
          id: '1',
          settingKey: 'maintenance_mode',
          oldValue: 'false',
          newValue: 'true',
          changedBy: 'admin@example.com',
          changedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          settingKey: 'base_fare_per_km',
          oldValue: '2.50',
          newValue: '3.00',
          changedBy: 'admin@example.com',
          changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setSettingHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching setting history:', error);
    }
  };

  const validateSetting = useCallback((setting: SystemSetting, value: string): SettingValidation => {
    switch (setting.type) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          return { isValid: false, error: 'Value must be a valid number' };
        }
        if (setting.key.includes('percentage') && (num < 0 || num > 100)) {
          return { isValid: false, error: 'Percentage must be between 0 and 100' };
        }
        if (setting.key.includes('timeout') && num < 0) {
          return { isValid: false, error: 'Timeout must be a positive number' };
        }
        break;
      
      case 'boolean':
        if (value !== 'true' && value !== 'false') {
          return { isValid: false, error: 'Value must be true or false' };
        }
        break;
      
      case 'json':
        try {
          JSON.parse(value);
        } catch {
          return { isValid: false, error: 'Invalid JSON format' };
        }
        break;
      
      case 'string':
        if (setting.key.includes('email') && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return { isValid: false, error: 'Invalid email format' };
          }
        }
        if (setting.key.includes('phone') && value) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            return { isValid: false, error: 'Invalid phone number format' };
          }
        }
        break;
    }
    
    return { isValid: true };
  }, []);

  const handleEditSetting = useCallback((setting: SystemSetting) => {
    setEditingSetting(setting.key);
    setEditValues(prev => ({
      ...prev,
      [setting.key]: setting.value
    }));
    setValidationErrors(prev => ({
      ...prev,
      [setting.key]: ''
    }));
  }, []);

  const handleSaveSetting = useCallback(async (setting: SystemSetting) => {
    try {
      const newValue = editValues[setting.key];
      if (newValue === undefined || newValue === setting.value) {
        setEditingSetting(null);
        return;
      }

      // Validate the new value
      const validation = validateSetting(setting, newValue);
      if (!validation.isValid) {
        setValidationErrors(prev => ({
          ...prev,
          [setting.key]: validation.error!
        }));
        return;
      }

      setSaving(true);
      await adminApi.updateSystemSetting(setting.key, newValue, setting.type);
      
      // Update local state
      setSettings(prev => prev.map(s => 
        s.key === setting.key 
          ? { ...s, value: newValue, updatedAt: new Date().toISOString() }
          : s
      ));
      
      setEditingSetting(null);
      setValidationErrors(prev => ({
        ...prev,
        [setting.key]: ''
      }));
      successToast('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      errorToast('Failed to update setting');
    } finally {
      setSaving(false);
    }
  }, [editValues, validateSetting, successToast, errorToast]);

  const handleCancelEdit = useCallback(() => {
    setEditingSetting(null);
    setEditValues({});
    setValidationErrors({});
  }, []);

  const handleBulkUpdate = useCallback(async () => {
    if (selectedSettings.size === 0) {
      errorToast('Please select at least one setting to update');
      return;
    }

    const result = await withConfirmation(
      async () => {
        const updates = Array.from(selectedSettings).map(key => {
          const setting = settings.find(s => s.key === key);
          const newValue = editValues[key];
          return { key, value: newValue, type: setting?.type || 'string' };
        });

        // Mock bulk update - replace with real API call
        await Promise.all(updates.map(update => 
          adminApi.updateSystemSetting(update.key, update.value, update.type)
        ));

        // Update local state
        setSettings(prev => prev.map(s => {
          const update = updates.find(u => u.key === s.key);
          return update ? { ...s, value: update.value, updatedAt: new Date().toISOString() } : s;
        }));

        setBulkEditMode(false);
        setSelectedSettings(new Set());
        setEditValues({});
        successToast(`Successfully updated ${updates.length} settings`);
        return updates;
      },
      `Are you sure you want to update ${selectedSettings.size} settings? This action cannot be undone.`,
      'Bulk Update Settings'
    );

    if (!result) return;
  }, [selectedSettings, editValues, settings, successToast, errorToast]);

  const handleExportSettings = useCallback(async () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        exportedBy: user?.email || 'unknown',
        settings: settings.map(s => ({
          key: s.key,
          value: s.value,
          type: s.type,
          description: s.description
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      successToast('Settings exported successfully');
    } catch (error) {
      console.error('Error exporting settings:', error);
      errorToast('Failed to export settings');
    }
  }, [settings, user, successToast, errorToast]);

  const handleImportSettings = useCallback(async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const text = await file.text();
        const importData = JSON.parse(text);

        if (!importData.settings || !Array.isArray(importData.settings)) {
          errorToast('Invalid settings file format');
          return;
        }

        const result = await withConfirmation(
          async () => {
            setSaving(true);
            // Mock import - replace with real API call
            await Promise.all(importData.settings.map((s: ImportedSetting) => 
              adminApi.updateSystemSetting(s.key, s.value, s.type)
            ));

            // Refresh settings
            await fetchSettings();
            successToast('Settings imported successfully');
          },
          `This will update ${importData.settings.length} settings. Are you sure you want to proceed?`,
          'Import Settings'
        );

        if (!result) return;

        setSaving(true);
        // Mock import - replace with real API call
        await Promise.all(importData.settings.map((s: ImportedSetting) => 
          adminApi.updateSystemSetting(s.key, s.value, s.type)
        ));

        // Refresh settings
        await fetchSettings();
        successToast('Settings imported successfully');
      };
      input.click();
    } catch (error) {
      console.error('Error importing settings:', error);
      errorToast('Failed to import settings');
    } finally {
      setSaving(false);
    }
  }, [fetchSettings, successToast, errorToast]);

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
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      settings: settings.filter(s => 
        ['app_version', 'maintenance_mode', 'force_update_version', 'support_email', 'support_phone', 'emergency_contact'].includes(s.key)
      )
    },
    {
      id: 'business',
      name: 'Business Settings',
      icon: CurrencyDollarIcon,
      description: 'Business and financial configuration',
      color: 'bg-green-50 border-green-200 text-green-700',
      settings: settings.filter(s => 
        ['base_fare_per_km', 'minimum_fare', 'max_distance_km', 'driver_commission_percentage', 'platform_fee_percentage', 'cancellation_fee_percentage', 'payment_methods', 'payment_timeout_minutes'].includes(s.key)
      )
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      description: 'Email and notification settings',
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      settings: settings.filter(s => 
        ['push_notifications_enabled', 'email_notifications_enabled', 'sms_notifications_enabled'].includes(s.key)
      )
    },
    {
      id: 'security',
      name: 'Security',
      icon: ShieldCheckIcon,
      description: 'Security and authentication settings',
      color: 'bg-red-50 border-red-200 text-red-700',
      settings: settings.filter(s => 
        ['max_login_attempts', 'lockout_duration_minutes', 'session_timeout_hours'].includes(s.key)
      )
    },
    {
      id: 'drivers',
      name: 'Driver Settings',
      icon: TruckIcon,
      description: 'Driver-related configuration',
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      settings: settings.filter(s => 
        ['driver_verification_required', 'max_driver_rating', 'min_driver_rating'].includes(s.key)
      )
    },
    {
      id: 'booking',
      name: 'Booking Settings',
      icon: DocumentTextIcon,
      description: 'Booking and reservation settings',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      settings: settings.filter(s => 
        ['booking_timeout_minutes', 'max_active_bookings_per_user', 'auto_cancel_after_hours'].includes(s.key)
      )
    },
    {
      id: 'features',
      name: 'Feature Flags',
      icon: GlobeAltIcon,
      description: 'Enable or disable system features',
      color: 'bg-pink-50 border-pink-200 text-pink-700',
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
          {/* Header with Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
                  <p className="text-sm text-gray-500">Manage and configure system parameters</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => setRefreshKey(prev => prev + 1)}
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </Button>
                  <Button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`flex items-center space-x-2 ${
                      showAdvanced ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <InformationCircleIcon className="h-4 w-4" />
                    <span>Advanced</span>
                  </Button>
                  <Button
                    onClick={handleExportSettings}
                    className="flex items-center space-x-2"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                  <Button
                    onClick={handleImportSettings}
                    className="flex items-center space-x-2"
                  >
                    <DocumentArrowUpIcon className="h-4 w-4" />
                    <span>Import</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Features Panel */}
          {showAdvanced && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Advanced Features</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Bulk Operations</h4>
                    <p className="text-sm text-gray-600 mb-4">Update multiple settings at once</p>
                    <Button
                      onClick={() => setBulkEditMode(!bulkEditMode)}
                      className={`w-full ${bulkEditMode ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    >
                      {bulkEditMode ? 'Cancel Bulk Edit' : 'Enable Bulk Edit'}
                    </Button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Setting History</h4>
                    <p className="text-sm text-gray-600 mb-4">View recent changes to settings</p>
                    <Button
                      onClick={() => fetchSettingHistory()}
                      className="w-full"
                    >
                      View History
                    </Button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">System Status</h4>
                    <p className="text-sm text-gray-600 mb-4">Monitor system health and performance</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Total Settings:</span>
                        <span className="font-medium">{settings.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Last Updated:</span>
                        <span className="font-medium">
                          {settings.length > 0 
                            ? new Date(Math.max(...settings.map(s => new Date(s.updatedAt).getTime()))).toLocaleString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                        ? `${category.color} border-current`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <category.icon className={`h-6 w-6 ${
                        activeCategory === category.id ? 'text-current' : 'text-gray-500'
                      }`} />
                      <div className="text-left">
                        <h4 className={`font-medium ${
                          activeCategory === category.id ? 'text-current' : 'text-gray-900'
                        }`}>
                          {category.name}
                        </h4>
                        <p className={`text-sm ${
                          activeCategory === category.id ? 'text-current opacity-80' : 'text-gray-500'
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
                  {/* Bulk Edit Actions */}
                  {bulkEditMode && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {selectedSettings.size} selected
                      </span>
                      <Button
                        onClick={handleBulkUpdate}
                        disabled={selectedSettings.size === 0 || saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {saving ? 'Updating...' : 'Update Selected'}
                      </Button>
                    </div>
                  )}
                  
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
                    <div key={setting.key} className={`border border-gray-200 rounded-lg p-6 ${
                      bulkEditMode && selectedSettings.has(setting.key) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {bulkEditMode && (
                              <input
                                type="checkbox"
                                checked={selectedSettings.has(setting.key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSettings(prev => new Set([...prev, setting.key]));
                                  } else {
                                    setSelectedSettings(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(setting.key);
                                      return newSet;
                                    });
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            )}
                            <h4 className="text-lg font-medium text-gray-900">
                              {formatSettingName(setting.key)}
                            </h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {setting.type}
                            </span>
                            {setting.key.includes('critical') && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Critical
                              </span>
                            )}
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
                                {validationErrors[setting.key] && (
                                  <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                    {validationErrors[setting.key]}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => handleSaveSetting(setting)}
                                  disabled={saving}
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                                  {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={saving}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                                <div className="flex items-center space-x-4">
                                  <div className="text-sm text-gray-500">
                                    Last updated: {new Date(setting.updatedAt).toLocaleString()}
                                  </div>
                                  {showAdvanced && (
                                    <button
                                      onClick={() => setShowHistory(prev => ({
                                        ...prev,
                                        [setting.key]: !prev[setting.key]
                                      }))}
                                      className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                      {showHistory[setting.key] ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                      History
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {bulkEditMode && (
                                    <input
                                      type="text"
                                      placeholder="New value..."
                                      value={editValues[setting.key] || ''}
                                      onChange={(e) => setEditValues(prev => ({
                                        ...prev,
                                        [setting.key]: e.target.value
                                      }))}
                                      className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  )}
                                  <button
                                    onClick={() => handleEditSetting(setting)}
                                    disabled={saving}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                  >
                                    <PencilIcon className="h-4 w-4 mr-2" />
                                    Edit
                                  </button>
                                </div>
                              </div>
                              
                              {/* Setting History */}
                              {showAdvanced && showHistory[setting.key] && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                  <h5 className="text-sm font-medium text-gray-900 mb-2">Recent Changes</h5>
                                  <div className="space-y-2">
                                    {settingHistory
                                      .filter(h => h.settingKey === setting.key)
                                      .slice(0, 3)
                                      .map(history => (
                                        <div key={history.id} className="text-xs text-gray-600">
                                          <span className="font-medium">{history.changedBy}</span> changed from{' '}
                                          <span className="font-mono bg-gray-200 px-1 rounded">{history.oldValue}</span> to{' '}
                                          <span className="font-mono bg-gray-200 px-1 rounded">{history.newValue}</span> on{' '}
                                          <span>{new Date(history.changedAt).toLocaleString()}</span>
                                        </div>
                                      ))}
                                    {settingHistory.filter(h => h.settingKey === setting.key).length === 0 && (
                                      <p className="text-xs text-gray-500">No recent changes</p>
                                    )}
                                  </div>
                                </div>
                              )}
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