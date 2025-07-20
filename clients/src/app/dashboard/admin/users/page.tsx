'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function AdminUsersPage() {
  const { successToast, errorToast, withConfirmation } = useSweetAlert();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial state from URL params
  const getInitialState = () => {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    
    console.log('Initial state from URL:', { page, limit, search, role });
    return { page, limit, search, role };
  };
  
  // Initialize state from URL params
  const initialState = getInitialState();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialState.search);
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [pageSize, setPageSize] = useState(initialState.limit);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterRole, setFilterRole] = useState<string>(initialState.role);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form data
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'USER',
    isActive: true,
    avatar: ''
  });

  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'USER',
    isActive: true,
    avatar: ''
  });

  // Update URL with current state
  const updateURL = (page: number, limit: number, search: string, role: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (limit !== 10) params.set('limit', limit.toString());
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    const fullURL = `/dashboard/admin/users${newURL}`;
    console.log('Updating URL:', fullURL, 'Current state:', { page, limit, search, role });
    
    // Use push instead of replace to ensure proper browser history
    router.push(fullURL, { scroll: false });
  };

  // Sync state with URL changes (for browser back/forward)
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlLimit = parseInt(searchParams.get('limit') || '10');
    const urlSearch = searchParams.get('search') || '';
    const urlRole = searchParams.get('role') || '';
    
    // Only update if URL params are different from current state
    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (urlLimit !== pageSize) setPageSize(urlLimit);
    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
    if (urlRole !== filterRole) setFilterRole(urlRole);
  }, [searchParams]);

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchQuery, filterRole]);

  // Update URL when state changes (separate effect to avoid race conditions)
  useEffect(() => {
    updateURL(currentPage, pageSize, searchQuery, filterRole);
  }, [currentPage, pageSize, searchQuery, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers(currentPage, pageSize, searchQuery, filterRole);
      setUsers(response.data);
      setTotalUsers(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
      errorToast('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    console.log('Page change requested:', page);
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      await adminApi.updateUser(selectedUser.id, editFormData);
      successToast('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      setEditFormData({ name: '', email: '', phone: '', role: 'USER', isActive: true, avatar: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      errorToast('Failed to update user');
    }
  };

  const handleDeleteUser = async (user: User) => {
    await withConfirmation(
      async () => {
        await adminApi.deleteUser(user.id);
        successToast('User deleted successfully');
        fetchUsers();
      },
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      'Delete User'
    );
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleCreateUser = async () => {
    try {
      // Mock API call for creating user (replace with real API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      successToast('User created successfully');
      setShowCreateModal(false);
      setCreateFormData({ name: '', email: '', phone: '', password: '', role: 'USER', isActive: true, avatar: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      errorToast('Failed to create user');
    }
  };

  const handleEditUserClick = (user: User) => {
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
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>, isCreate: boolean = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const avatarUrl = e.target?.result as string;
      if (isCreate) {
        setCreateFormData(prev => ({ ...prev, avatar: avatarUrl }));
      } else {
        setEditFormData(prev => ({ ...prev, avatar: avatarUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'DRIVER': return 'bg-green-100 text-green-800';
      case 'USER': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Table columns
  const columns: Column<User>[] = [
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
    {
      key: 'phone',
      header: 'Phone',
      render: (value) => (value as string) || '-'
    },
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
      render: (value) => (
        <div className="text-sm text-gray-900">{value as number || 0}</div>
      )
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      render: (value) => (
        <div className="text-sm font-medium text-green-600">
          ${((value as number) || 0).toFixed(2)}
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (value) => formatDate(value as string)
    }
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="User Management" subtitle="Manage all user accounts">
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Role:</label>
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="DRIVER">Driver</option>
                <option value="USER">User</option>
              </select>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            key={`${currentPage}-${pageSize}-${searchQuery}-${filterRole}`}
            data={users}
            columns={columns}
            loading={loading}
            pagination={{
              page: currentPage,
              limit: pageSize,
              total: totalUsers,
              totalPages: totalPages
            }}
            onPageChange={handlePageChange}
            onLimitChange={handlePageSizeChange}
            onSearch={handleSearch}
            searchPlaceholder="Search users by name or email..."
            showAddButton={true}
            addButtonText="Create User"
            onAdd={() => setShowCreateModal(true)}
            actions={{
              view: handleViewUser,
              edit: handleEditUserClick,
              delete: handleDeleteUser
            }}
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
            {/* Avatar Upload */}
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 relative">
                {createFormData.avatar ? (
                  <img 
                    src={createFormData.avatar} 
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
                    onChange={(e) => handleAvatarUpload(e, true)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={createFormData.password}
                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={createFormData.phone}
                onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={createFormData.role}
                onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USER">User</option>
                <option value="DRIVER">Driver</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="createIsActive"
                checked={createFormData.isActive}
                onChange={(e) => setCreateFormData({ ...createFormData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="createIsActive" className="ml-2 text-sm text-gray-700">
                Active Account
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
              >
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
            {/* Avatar Upload */}
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 relative">
                {editFormData.avatar ? (
                  <img 
                    src={editFormData.avatar} 
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
                    onChange={(e) => handleAvatarUpload(e, false)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USER">User</option>
                <option value="DRIVER">Driver</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={editFormData.isActive}
                onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active Account
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditUser}
              >
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
          {selectedUser && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserCircleIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{selectedUser.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">Joined {formatDate(selectedUser.createdAt)}</span>
                  </div>
                  {selectedUser.lastLogin && (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">Last login {formatDate(selectedUser.lastLogin)}</span>
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
                    <span className="text-sm font-medium text-gray-900">{selectedUser.totalBookings || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Spent</span>
                    <span className="text-sm font-medium text-green-600">${(selectedUser.totalSpent || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Status</span>
                    <span className={`text-sm ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 