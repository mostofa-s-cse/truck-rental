'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  CogIcon,
  UserCircleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon, BellIcon, KeyIcon } from 'lucide-react';

interface UserSettings {
  account: {
    email: string;
    phone: string;
    language: string;
    timezone: string;
    currency: string;
  };
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    sessionTimeout: number;
    passwordExpiryDays: number;
  };
  notifications: {
    email: {
      bookingConfirmations: boolean;
      bookingUpdates: boolean;
      driverArrivals: boolean;
      paymentReceipts: boolean;
      promotionalOffers: boolean;
    };
    sms: {
      bookingConfirmations: boolean;
      driverArrivals: boolean;
      urgentUpdates: boolean;
    };
    push: {
      bookingConfirmations: boolean;
      bookingUpdates: boolean;
      driverArrivals: boolean;
      nearbyDrivers: boolean;
      specialOffers: boolean;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'drivers';
    locationSharing: boolean;
    contactInfoSharing: boolean;
    analyticsSharing: boolean;
  };
  preferences: {
    defaultTruckType: string;
    preferredPaymentMethod: string;
    autoSaveAddresses: boolean;
    showFareEstimates: boolean;
  };
}

export default function UserSettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { successToast, errorToast, confirmDialog } = useSweetAlert();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'privacy' | 'preferences'>('account');
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Mock settings data (replace with real API call)
      const mockSettings: UserSettings = {
        account: {
          email: user?.email || 'user@example.com',
          phone: '+1 (555) 123-4567',
          language: 'en',
          timezone: 'UTC',
          currency: 'USD'
        },
        security: {
          twoFactorEnabled: false,
          loginNotifications: true,
          sessionTimeout: 30,
          passwordExpiryDays: 90
        },
        notifications: {
          email: {
            bookingConfirmations: true,
            bookingUpdates: true,
            driverArrivals: true,
            paymentReceipts: true,
            promotionalOffers: false
          },
          sms: {
            bookingConfirmations: true,
            driverArrivals: false,
            urgentUpdates: true
          },
          push: {
            bookingConfirmations: true,
            bookingUpdates: true,
            driverArrivals: true,
            nearbyDrivers: true,
            specialOffers: true
          }
        },
        privacy: {
          profileVisibility: 'public',
          locationSharing: true,
          contactInfoSharing: true,
          analyticsSharing: true
        },
        preferences: {
          defaultTruckType: 'MINI_TRUCK',
          preferredPaymentMethod: 'CASH',
          autoSaveAddresses: true,
          showFareEstimates: true
        }
      };

      setSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      errorToast('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (section: keyof UserSettings) => {
    try {
      setSaving(true);
      
      // Mock API call (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      successToast(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`);
    } catch (error) {
      console.error('Error saving settings:', error);
      errorToast('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setSaving(true);
      
      // Validate password form
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        errorToast('All password fields are required');
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        errorToast('New passwords do not match');
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        errorToast('New password must be at least 8 characters long');
        return;
      }

      // Mock API call (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      successToast('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      errorToast('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    if (!settings) return;

    const confirmed = await confirmDialog(
      settings.security.twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication',
      settings.security.twoFactorEnabled 
        ? 'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
        : 'Are you sure you want to enable two-factor authentication? You will need to set up an authenticator app.'
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      
      // Mock API call (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings({
        ...settings,
        security: {
          ...settings.security,
          twoFactorEnabled: !settings.security.twoFactorEnabled
        }
      });
      
      successToast(`Two-factor authentication ${settings.security.twoFactorEnabled ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      console.error('Error toggling two-factor authentication:', error);
      errorToast('Failed to update two-factor authentication');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof UserSettings, updates: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        ...updates
      }
    });
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="USER">
        <DashboardLayout title="Settings" subtitle="Manage your account preferences and security">
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
        <DashboardLayout title="Settings" subtitle="Manage your account preferences and security">
          <div className="text-center py-12">
            <p className="text-gray-500">Settings not available</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const tabs = [
    { id: 'account', name: 'Account', icon: UserCircleIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy', icon: CogIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon }
  ];

  return (
    <ProtectedRoute requiredRole="USER">
      <DashboardLayout title="Settings" subtitle="Manage your account preferences and security">
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={settings.account.email}
                          onChange={(e) => updateSettings('account', { email: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={settings.account.phone}
                          onChange={(e) => updateSettings('account', { phone: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <select
                          value={settings.account.language}
                          onChange={(e) => updateSettings('account', { language: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <select
                          value={settings.account.timezone}
                          onChange={(e) => updateSettings('account', { timezone: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time</option>
                          <option value="PST">Pacific Time</option>
                          <option value="GMT">GMT</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                          value={settings.account.currency}
                          onChange={(e) => updateSettings('account', { currency: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSaveSettings('account')}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Account Settings'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-sm ${settings.security.twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                            {settings.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <Button
                            onClick={handleToggleTwoFactor}
                            variant={settings.security.twoFactorEnabled ? 'outline' : 'default'}
                            size="sm"
                          >
                            {settings.security.twoFactorEnabled ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Login Notifications</h4>
                          <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.security.loginNotifications}
                            onChange={(e) => updateSettings('security', { loginNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                          <input
                            type="number"
                            value={settings.security.sessionTimeout}
                            onChange={(e) => updateSettings('security', { sessionTimeout: parseInt(e.target.value) })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry (days)</label>
                          <input
                            type="number"
                            value={settings.security.passwordExpiryDays}
                            onChange={(e) => updateSettings('security', { passwordExpiryDays: parseInt(e.target.value) })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      onClick={() => setShowPasswordModal(true)}
                      variant="outline"
                    >
                      Change Password
                    </Button>
                    <Button
                      onClick={() => handleSaveSettings('security')}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Security Settings'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                    
                    {/* Email Notifications */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                        Email Notifications
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(settings.notifications.email).map(([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => updateSettings('notifications', {
                                email: { ...settings.notifications.email, [key]: e.target.checked }
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* SMS Notifications */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
                        SMS Notifications
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(settings.notifications.sms).map(([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => updateSettings('notifications', {
                                sms: { ...settings.notifications.sms, [key]: e.target.checked }
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <BellIcon className="h-5 w-5 mr-2" />
                        Push Notifications
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(settings.notifications.push).map(([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => updateSettings('notifications', {
                                push: { ...settings.notifications.push, [key]: e.target.checked }
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSaveSettings('notifications')}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Notification Settings'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
                        <select
                          value={settings.privacy.profileVisibility}
                          onChange={(e) => updateSettings('privacy', { profileVisibility: e.target.value as any })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="drivers">Drivers Only</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.privacy.locationSharing}
                            onChange={(e) => updateSettings('privacy', { locationSharing: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Share location with drivers</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.privacy.contactInfoSharing}
                            onChange={(e) => updateSettings('privacy', { contactInfoSharing: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Share contact information</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.privacy.analyticsSharing}
                            onChange={(e) => updateSettings('privacy', { analyticsSharing: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Share analytics data</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSaveSettings('privacy')}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Privacy Settings'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Preferences Settings */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Truck Type</label>
                        <select
                          value={settings.preferences.defaultTruckType}
                          onChange={(e) => updateSettings('preferences', { defaultTruckType: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="MINI_TRUCK">Mini Truck</option>
                          <option value="PICKUP">Pickup</option>
                          <option value="LORRY">Lorry</option>
                          <option value="TRUCK">Truck</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Payment Method</label>
                        <select
                          value={settings.preferences.preferredPaymentMethod}
                          onChange={(e) => updateSettings('preferences', { preferredPaymentMethod: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="CASH">Cash</option>
                          <option value="CARD">Card</option>
                          <option value="MOBILE_MONEY">Mobile Money</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.preferences.autoSaveAddresses}
                            onChange={(e) => updateSettings('preferences', { autoSaveAddresses: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Auto-save frequently used addresses</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.preferences.showFareEstimates}
                            onChange={(e) => updateSettings('preferences', { showFareEstimates: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Show fare estimates before booking</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSaveSettings('preferences')}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={saving}
              >
                {saving ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 