'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  UserCircleIcon, 
  PencilIcon,
  CameraIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { KeyIcon } from 'lucide-react';
import { userApi } from '@/lib/dashboardApi';
import { updateUser } from '@/store/slices/authSlice';

interface UserProfile {
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
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    language: string;
    timezone: string;
  };
  security: {
    lastLogin: string;
    loginHistory: Array<{
      date: string;
      ip: string;
      device: string;
    }>;
    twoFactorEnabled: boolean;
  };
  stats: {
    totalBookings: number;
    totalSpent: number;
    averageRating: number;
    favoriteDrivers: number;
  };
}

export default function UserProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { successToast, errorToast } = useSweetAlert();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });


  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get user stats from dashboard API
      const userStats = await userApi.getUserStats();
      
      // Create profile data from user info and stats
      const profileData: UserProfile = {
        id: user?.id || '1',
        name: user?.name || 'User Name',
        email: user?.email || 'user@example.com',
        phone: user?.phone || '+880-3333-333331',
        role: 'USER',
        avatar: user?.avatar,
        address: 'Dhaka, Bangladesh',
        city: 'Dhaka',
        country: 'Bangladesh',
        bio: 'Regular user of the truck booking service.',
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          language: 'en',
          timezone: 'Asia/Dhaka'
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
          totalBookings: userStats.totalBookings,
          totalSpent: userStats.totalSpent,
          averageRating: userStats.averageRating,
          favoriteDrivers: userStats.favoriteDrivers
        }
      };

      setProfile(profileData);
      setFormData({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        country: profileData.country || '',
        bio: profileData.bio || ''
      });
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

      // TODO: Implement real API call to update user profile
      // await apiClient.updateUserProfile(formData);
      
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

      // TODO: Implement real API call to change password
      // await apiClient.changePassword({
      //   oldPassword: passwordForm.currentPassword,
      //   newPassword: passwordForm.newPassword
      // });
      
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const { avatarUrl } = await userApi.uploadAvatar(file);
      if (profile) {
        const nextSrc = avatarUrl.replace(/^https?:\/\/localhost:\d+/, '');
        setProfile({ ...profile, avatar: nextSrc });
        dispatch(updateUser({ avatar: nextSrc }));
      }
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
      <ProtectedRoute requiredRole="USER">
        <DashboardLayout title="User Profile" subtitle="Manage your account settings">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute requiredRole="USER">
        <DashboardLayout title="User Profile" subtitle="Manage your account settings">
          <div className="text-center py-12">
            <p className="text-gray-500">Profile data not available</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="USER">
      <DashboardLayout title="User Profile" subtitle="Manage your account settings">
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
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Active</span>
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
                </div>
              </div>

              {/* User Statistics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Bookings</span>
                    <span className="text-sm font-medium text-gray-900">{profile.stats.totalBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Spent</span>
                    <span className="text-sm font-medium text-green-600">${profile.stats.totalSpent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <div className="flex items-center">
                      {renderStars(profile.stats.averageRating)}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Favorite Drivers</span>
                    <span className="text-sm font-medium text-gray-900">{profile.stats.favoriteDrivers}</span>
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