'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useAppSelector } from '@/hooks/redux';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  UserCircleIcon, 
  PencilIcon,
  CameraIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { BellIcon, KeyIcon, ShieldCheckIcon } from 'lucide-react';

interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
  vehicle: {
    truckType: string;
    capacity: number;
    quality: string;
    license: string;
    registration: string;
    location: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    language: string;
    timezone: string;
  };
  security: {
    lastLogin: string;
    loginHistory: { date: string; ip: string; device: string }[];
    twoFactorEnabled: boolean;
  };
  stats: {
    totalTrips: number;
    averageRating: number;
    completionRate: number;
    totalEarnings: number;
  };
}

export default function DriverProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const { successToast, errorToast } = useSweetAlert();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    bio: ''
  });
  
  // Vehicle form data
  const [vehicleForm, setVehicleForm] = useState({
    truckType: '',
    capacity: 0,
    quality: '',
    license: '',
    registration: '',
    location: ''
  });
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    language: 'en',
    timezone: 'UTC'
  });

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock profile data (replace with real API call)
      const mockProfile: DriverProfile = {
        id: user?.id || '1',
        name: user?.name || 'Driver User',
        email: user?.email || 'driver@example.com',
        phone: '+1 (555) 123-4567',
        role: 'DRIVER',
        avatar: undefined,
        address: '123 Driver Street',
        city: 'Driver City',
        country: 'United States',
        bio: 'Professional truck driver with 5+ years of experience in safe and timely deliveries.',
        vehicle: {
          truckType: 'MINI_TRUCK',
          capacity: 1.5,
          quality: 'GOOD',
          license: 'DL123456789',
          registration: 'TRK789012345',
          location: 'Downtown Area'
        },
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          language: 'en',
          timezone: 'UTC'
        },
        security: {
          lastLogin: new Date().toISOString(),
          loginHistory: [
            { date: '2024-01-15T10:30:00Z', ip: '192.168.1.100', device: 'Chrome on Windows' },
            { date: '2024-01-14T15:45:00Z', ip: '192.168.1.100', device: 'Chrome on Windows' },
            { date: '2024-01-13T09:20:00Z', ip: '192.168.1.100', device: 'Chrome on Windows' }
          ],
          twoFactorEnabled: false
        },
        stats: {
          totalTrips: 156,
          averageRating: 4.8,
          completionRate: 98.5,
          totalEarnings: 8500
        }
      };

      setProfile(mockProfile);
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone || '',
        address: mockProfile.address || '',
        city: mockProfile.city || '',
        country: mockProfile.country || '',
        bio: mockProfile.bio || ''
      });
      setVehicleForm(mockProfile.vehicle);
      setPreferences(mockProfile.preferences);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      errorToast('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  }, [user, errorToast]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Validate form data
      if (!formData.name || !formData.email) {
        errorToast('Name and email are required');
        return;
      }

      // Mock API call (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile state
      if (profile) {
        setProfile({
          ...profile,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          bio: formData.bio
        });
      }
      
      setEditMode(false);
      successToast('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      errorToast('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVehicle = async () => {
    try {
      setSaving(true);
      
      // Validate vehicle form data
      if (!vehicleForm.truckType || !vehicleForm.license || !vehicleForm.registration || !vehicleForm.location) {
        errorToast('All vehicle fields are required');
        return;
      }

      // Mock API call (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile state
      if (profile) {
        setProfile({
          ...profile,
          vehicle: vehicleForm
        });
      }
      
      successToast('Vehicle information updated successfully');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      errorToast('Failed to update vehicle information');
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

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      
      // Mock API call (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (profile) {
        setProfile({
          ...profile,
          preferences
        });
      }
      
      successToast('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      errorToast('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      
      // Mock file upload (replace with real upload logic)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (profile) {
          setProfile({
            ...profile,
            avatar: e.target?.result as string
          });
        }
      };
      reader.readAsDataURL(file);
      
      setShowAvatarModal(false);
      successToast('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      errorToast('Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="DRIVER">
        <DashboardLayout title="Driver Profile" subtitle="Manage your account and vehicle information">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute requiredRole="DRIVER">
        <DashboardLayout title="Driver Profile" subtitle="Manage your account and vehicle information">
          <div className="text-center py-12">
            <p className="text-gray-500">Profile data not available</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="DRIVER">
      <DashboardLayout title="Driver Profile" subtitle="Manage your account and vehicle information">
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {profile.avatar ? (
                    <Image 
                      src={profile.avatar} 
                      alt={profile.name}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserCircleIcon className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute -bottom-1 -right-1 p-1 bg-blue-600 rounded-full text-white hover:bg-blue-700"
                  >
                    <CameraIcon className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600">{profile.role}</p>
                  <div className="flex items-center mt-1">
                    {renderStars(profile.stats.averageRating)}
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                {editMode ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setEditMode(true)}
                    variant="outline"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {editMode ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-gray-900">{profile.role}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Vehicle Information</h3>
                  <Button
                    onClick={handleSaveVehicle}
                    disabled={saving}
                    size="sm"
                  >
                    {saving ? 'Saving...' : 'Save Vehicle'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Truck Type</label>
                    <select
                      value={vehicleForm.truckType}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, truckType: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MINI_TRUCK">Mini Truck</option>
                      <option value="PICKUP">Pickup</option>
                      <option value="LORRY">Lorry</option>
                      <option value="TRUCK">Truck</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (tons)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vehicleForm.capacity}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: parseFloat(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                    <select
                      value={vehicleForm.quality}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, quality: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="AVERAGE">Average</option>
                      <option value="POOR">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <input
                      type="text"
                      value={vehicleForm.license}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, license: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                    <input
                      type="text"
                      value={vehicleForm.registration}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, registration: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
                    <input
                      type="text"
                      value={vehicleForm.location}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, location: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.address || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.city || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.country || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bio</h3>
                {editMode ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowPasswordModal(true)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <KeyIcon className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    Security Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <BellIcon className="h-4 w-4 mr-2" />
                    Notification Settings
                  </Button>
                </div>
              </div>

              {/* Driver Statistics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Driver Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Trips</span>
                    <span className="text-sm font-medium text-gray-900">{profile.stats.totalTrips}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <div className="flex items-center">
                      {renderStars(profile.stats.averageRating)}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-medium text-gray-900">{profile.stats.completionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Earnings</span>
                    <span className="text-sm font-medium text-green-600">${profile.stats.totalEarnings}</span>
                  </div>
                </div>
              </div>

              {/* Security Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Two-Factor Auth</span>
                    <span className={`text-sm ${profile.security.twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                      {profile.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Last Login</span>
                    <p className="text-sm text-gray-900">{new Date(profile.security.lastLogin).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
              <Button
                onClick={handleSavePreferences}
                disabled={saving}
                size="sm"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications}
                      onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">SMS Notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Push Notifications</span>
                  </label>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
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
                      value={preferences.timezone}
                      onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">GMT</option>
                    </select>
                  </div>
                </div>
              </div>
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

        {/* Avatar Upload Modal */}
        <Modal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          title="Update Avatar"
          size="md"
        >
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                {profile.avatar ? (
                  <Image 
                    src={profile.avatar} 
                    alt="Current avatar"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Upload a new profile picture
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAvatarModal(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 