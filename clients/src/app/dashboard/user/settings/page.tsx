'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/hooks/redux';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  UserCircleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface UserSettings {
  account: {
    email: string;
    phone: string;
    name: string;
  };
}

export default function UserSettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { successToast, errorToast } = useSweetAlert();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [editMode, setEditMode] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock settings data (replace with real API call)
      const mockSettings: UserSettings = {
        account: {
          email: user?.email || 'user@example.com',
          phone: user?.phone || '+1 (555) 123-4567',
          name: user?.name || 'John Doe'
        }
      };
      
      setSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      errorToast('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [user, errorToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Mock API call (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      successToast('Settings saved successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      errorToast('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: Partial<UserSettings['account']>) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      account: {
        ...settings.account,
        ...updates
      }
    });
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="USER">
        <DashboardLayout title="Settings" subtitle="Manage your account information">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!settings) {
    return (
      <ProtectedRoute requiredRole="USER">
        <DashboardLayout title="Settings" subtitle="Manage your account information">
          <div className="text-center py-12">
            <p className="text-gray-500">Settings not available</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="USER">
      <DashboardLayout title="Settings" subtitle="Manage your account information">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                {!editMode && (
                  <Button
                    onClick={() => setEditMode(true)}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <UserCircleIcon className="h-4 w-4 mr-2" />
                  Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={settings.account.name}
                    onChange={(e) => updateSettings({ name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{settings.account.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Email Address
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={settings.account.email}
                    onChange={(e) => updateSettings({ email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email address"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{settings.account.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                  Phone Number
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={settings.account.phone}
                    onChange={(e) => updateSettings({ phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{settings.account.phone}</p>
                )}
              </div>

              {/* Account Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Account Status</h4>
                    <p className="text-sm text-green-700">Your account is active and verified</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {editMode && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveSettings}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Need Help?</h4>
            <p className="text-sm text-blue-700 mb-3">
              If you need to change your password or have other account-related questions, 
              please contact our support team.
            </p>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 