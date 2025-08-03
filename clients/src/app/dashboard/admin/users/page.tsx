'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { adminApi, User } from '@/lib/adminApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  UserCircleIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

// Types
interface FormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  avatar: string;
}

interface CreateFormData extends FormData {
  password: string;
}

// Utility functions
const formatDate = (date: string) => new Date(date).toLocaleDateString();

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'bg-red-100 text-red-800';
    case 'DRIVER': return 'bg-green-100 text-green-800';
    case 'USER': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getInitialFormData = (): FormData => ({
  name: '',
  email: '',
  phone: '',
  role: 'USER',
  isActive: true,
  avatar: ''
});

const getInitialCreateFormData = (): CreateFormData => ({
  ...getInitialFormData(),
  password: ''
});

// Sub-components
const RoleFilter = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (role: string) => void; 
}) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter by Role:</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="DRIVER">Driver</option>
          <option value="USER">User</option>
        </select>
      </div>
      {value && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Active filter:</span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(value)}`}>
            {value}
          </span>
          <button
            onClick={() => onChange('')}
            className="text-gray-400 hover:text-gray-600"
            title="Clear filter"
          >
            ×
          </button>
        </div>
      )}
    </div>
  </div>
);

const AvatarUpload = ({ 
  avatar, 
  onChange 
}: { 
  avatar: string; 
  onChange: (avatar: string) => void; 
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const avatarUrl = e.target?.result as string;
      onChange(avatarUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 relative">
        {avatar ? (
          <img 
            src={avatar} 
            alt="User avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <UserCircleIcon className="h-12 w-12 text-gray-400" />
        )}
        <label className="absolute -bottom-1 -right-1 p-1 bg-blue-600 rounded-full text-white hover:bg-blue-700 cursor-pointer">
          <CameraIcon className="h-4 w-4" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

const FormField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false 
}: { 
  label: string; 
  type?: string; 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string; 
  required?: boolean; 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

const RoleSelect = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void; 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Role
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="USER">User</option>
      <option value="DRIVER">Driver</option>
      <option value="ADMIN">Admin</option>
    </select>
  </div>
);

const ActiveCheckbox = ({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
}) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    <label className="ml-2 text-sm text-gray-700">
      Active Account
    </label>
  </div>
);

const UserDetails = ({ user }: { user: User }) => (
  <div className="space-y-6">
    {/* User Header */}
    <div className="flex items-center">
      <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
        <UserCircleIcon className="h-8 w-8 text-blue-600" />
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
        <p className="text-sm text-gray-500">{user.email}</p>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(user.role)}`}>
          {user.role}
        </span>
      </div>
    </div>

    {/* User Information */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center">
            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">{user.phone}</span>
          </div>
        )}
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">Joined {formatDate(user.createdAt)}</span>
        </div>
        {user.lastLogin && (
          <div className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">Last login {formatDate(user.lastLogin)}</span>
          </div>
        )}
      </div>
    </div>

    {/* User Statistics */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">User Statistics</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total Bookings</span>
          <span className="text-sm font-medium text-gray-900">{user.totalBookings || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total Spent</span>
          <span className="text-sm font-medium text-green-600">${(user.totalSpent || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Account Status</span>
          <span className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Main component
export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { successToast, errorToast, withConfirmation } = useSweetAlert();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterRole, setFilterRole] = useState<string>('');

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form data
  const [editFormData, setEditFormData] = useState<FormData>(getInitialFormData());
  const [createFormData, setCreateFormData] = useState<CreateFormData>(getInitialCreateFormData());

  // Sync local state with URL params
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    setCurrentPage(page);
    setPageSize(limit);
    setSearchQuery(search);
    setFilterRole(role);
  }, [searchParams]);

  // Update URL
  const updateURL = useCallback((page: number, limit: number, search: string, role: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (limit !== 10) params.set('limit', limit.toString());
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    const query = params.toString() ? `?${params.toString()}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  }, [router, pathname]);

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchQuery, filterRole]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers(currentPage, pageSize, searchQuery, filterRole);
      setUsers(response.data);
      setTotalUsers(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching users:', err);
      errorToast('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, filterRole, errorToast]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL(1, pageSize, query, filterRole);
  }, [pageSize, filterRole, updateURL]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateURL(page, pageSize, searchQuery, filterRole);
  }, [pageSize, searchQuery, filterRole, updateURL]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    updateURL(1, size, searchQuery, filterRole);
  }, [searchQuery, filterRole, updateURL]);

  const handleRoleFilterChange = useCallback((newRole: string) => {
    setFilterRole(newRole);
    setCurrentPage(1);
    setSearchQuery(''); // Reset search when role filter changes
    updateURL(1, pageSize, '', newRole);
  }, [pageSize, updateURL]);

  const handleEditUser = useCallback(async () => {
    if (!selectedUser) return;
    try {
      await adminApi.updateUser(selectedUser.id, editFormData);
      successToast('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      setEditFormData(getInitialFormData());
      // Trigger a refetch by updating a dependency
      setCurrentPage(prev => prev);
    } catch (error) {
      console.error('Error updating user:', error);
      errorToast('Failed to update user');
    }
  }, [selectedUser, editFormData, successToast, errorToast]);

  const handleDeleteUser = useCallback(async (user: User) => {
    await withConfirmation(
      async () => {
        await adminApi.deleteUser(user.id);
        successToast('User deleted successfully');
        // Trigger a refetch by updating a dependency
        setCurrentPage(prev => prev);
      },
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      'Delete User'
    );
  }, [withConfirmation, successToast]);

  const handleCreateUser = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
      successToast('User created successfully');
      setShowCreateModal(false);
      setCreateFormData(getInitialCreateFormData());
      // Trigger a refetch by updating a dependency
      setCurrentPage(prev => prev);
    } catch (err) {
      console.error('Error creating user:', err);
      errorToast('Failed to create user');
    }
  }, [successToast, errorToast]);

  const handleEditUserClick = useCallback((user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive,
      avatar: user.avatar || ''
    });
    setShowEditModal(true);
  }, []);

  const handleViewUser = useCallback((user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  }, []);

  const handleEditFormChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateFormChange = useCallback((field: keyof CreateFormData, value: string | boolean) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Memoized values
  const columns = useMemo((): Column<User>[] => [
    {
      key: 'name',
      header: 'Name',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <UserCircleIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    { key: 'phone', header: 'Phone', render: (value) => (value as string) || '-' },
    {
      key: 'role',
      header: 'Role',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(value as string)}`}>
          {value as string}
        </span>
      )
    },
    {
      key: 'totalBookings',
      header: 'Bookings',
      render: (value) => <div className="text-sm text-gray-900">{value as number || 0}</div>
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      render: (value) => <div className="text-sm font-medium text-green-600">${((value as number) || 0).toFixed(2)}</div>
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (value) => formatDate(value as string)
    }
  ], []);

  const pagination = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    total: totalUsers,
    totalPages: totalPages
  }), [currentPage, pageSize, totalUsers, totalPages]);

  const actions = useMemo(() => ({
    view: handleViewUser,
    edit: handleEditUserClick,
    delete: handleDeleteUser
  }), [handleViewUser, handleEditUserClick, handleDeleteUser]);

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="User Management" subtitle="Manage all user accounts">
        <div className="space-y-6">
          {/* Filters */}
          <RoleFilter value={filterRole} onChange={handleRoleFilterChange} />

          {/* DataTable */}
          <DataTable
            data={users}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handlePageSizeChange}
            onSearch={handleSearch}
            searchPlaceholder="Search users by name or email..."
            showAddButton={true}
            addButtonText="Create User"
            onAdd={() => setShowCreateModal(true)}
            actions={actions}
            emptyMessage="No users found"
            initialSearchQuery={searchQuery}
          />
        </div>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New User"
          size="md"
        >
          <div className="space-y-4">
                         <AvatarUpload 
               avatar={createFormData.avatar} 
               onChange={(avatar) => handleCreateFormChange('avatar', avatar)} 
             />

            <FormField
              label="Full Name"
              value={createFormData.name}
              onChange={(value) => handleCreateFormChange('name', value)}
              placeholder="Enter full name"
              required
            />

            <FormField
              label="Email Address"
              type="email"
              value={createFormData.email}
              onChange={(value) => handleCreateFormChange('email', value)}
              placeholder="Enter email address"
              required
            />

            <FormField
              label="Password"
              type="password"
              value={createFormData.password}
              onChange={(value) => handleCreateFormChange('password', value)}
              placeholder="Enter password"
              required
            />

            <FormField
              label="Phone Number"
              type="tel"
              value={createFormData.phone}
              onChange={(value) => handleCreateFormChange('phone', value)}
              placeholder="Enter phone number"
            />

            <RoleSelect 
              value={createFormData.role} 
              onChange={(value) => handleCreateFormChange('role', value)} 
            />

            <ActiveCheckbox 
              checked={createFormData.isActive} 
              onChange={(checked) => handleCreateFormChange('isActive', checked)} 
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                Create User
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit User"
          size="md"
        >
          <div className="space-y-4">
            <AvatarUpload 
              avatar={editFormData.avatar} 
              onChange={(avatar) => handleEditFormChange('avatar', avatar)} 
            />

            <FormField
              label="Full Name"
              value={editFormData.name}
              onChange={(value) => handleEditFormChange('name', value)}
              placeholder="Enter full name"
            />

            <FormField
              label="Email Address"
              type="email"
              value={editFormData.email}
              onChange={(value) => handleEditFormChange('email', value)}
              placeholder="Enter email address"
            />

            <FormField
              label="Phone Number"
              type="tel"
              value={editFormData.phone}
              onChange={(value) => handleEditFormChange('phone', value)}
              placeholder="Enter phone number"
            />

            <RoleSelect 
              value={editFormData.role} 
              onChange={(value) => handleEditFormChange('role', value)} 
            />

            <ActiveCheckbox 
              checked={editFormData.isActive} 
              onChange={(checked) => handleEditFormChange('isActive', checked)} 
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser}>
                Update User
              </Button>
            </div>
          </div>
        </Modal>

        {/* View User Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="User Details"
          size="lg"
        >
          {selectedUser && <UserDetails user={selectedUser} />}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 