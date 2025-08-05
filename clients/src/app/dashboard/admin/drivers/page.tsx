'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { adminApi, Driver } from '@/lib/adminApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  TruckIcon, 
  UserCircleIcon,
  MapPinIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

// Types for form data
interface CreateDriverFormData {
  userId: string;
  truckType: string;
  capacity: number;
  quality: string;
  license: string;
  registration: string;
  location: string;
}

interface UpdateDriverFormData {
  truckType: string;
  capacity: number;
  quality: string;
  license: string;
  registration: string;
  location: string;
  isVerified: boolean;
  isAvailable: boolean;
}

// Utility functions
const formatDate = (date: string) => new Date(date).toLocaleDateString();

const getTruckTypeColor = (truckType: string) => {
  switch (truckType) {
    case 'MINI_TRUCK': return 'bg-blue-100 text-blue-800';
    case 'PICKUP': return 'bg-green-100 text-green-800';
    case 'LORRY': return 'bg-yellow-100 text-yellow-800';
    case 'TRUCK': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getQualityColor = (quality: string) => {
  switch (quality) {
    case 'EXCELLENT': return 'bg-green-100 text-green-800';
    case 'GOOD': return 'bg-blue-100 text-blue-800';
    case 'AVERAGE': return 'bg-yellow-100 text-yellow-800';
    case 'POOR': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getInitialCreateFormData = (): CreateDriverFormData => ({
  userId: '',
  truckType: 'MINI_TRUCK',
  capacity: 1.5,
  quality: 'GOOD',
  license: '',
  registration: '',
  location: ''
});

const getInitialUpdateFormData = (): UpdateDriverFormData => ({
  truckType: 'MINI_TRUCK',
  capacity: 1.5,
  quality: 'GOOD',
  license: '',
  registration: '',
  location: '',
  isVerified: false,
  isAvailable: true
});

// Sub-components
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
  value: string | number; 
  onChange: (value: string | number) => void; 
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
      onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

const TruckTypeSelect = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void; 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Truck Type
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="MINI_TRUCK">Mini Truck</option>
      <option value="PICKUP">Pickup</option>
      <option value="LORRY">Lorry</option>
      <option value="TRUCK">Truck</option>
    </select>
  </div>
);

const QualitySelect = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void; 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Quality
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="EXCELLENT">Excellent</option>
      <option value="GOOD">Good</option>
      <option value="AVERAGE">Average</option>
      <option value="POOR">Poor</option>
    </select>
  </div>
);

const StatusCheckbox = ({ 
  label,
  checked, 
  onChange 
}: { 
  label: string;
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
      {label}
    </label>
  </div>
);

const DriverDetails = ({ driver }: { driver: Driver }) => (
  <div className="space-y-6">
    {/* Driver Header */}
    <div className="flex items-center">
      <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
        <TruckIcon className="h-8 w-8 text-blue-600" />
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-gray-900">{driver.user.name}</h3>
        <p className="text-sm text-gray-500">{driver.user.email}</p>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTruckTypeColor(driver.truckType)}`}>
          {driver.truckType.replace('_', ' ')}
        </span>
      </div>
    </div>

    {/* Driver Information */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">{driver.user.email}</span>
        </div>
        {driver.user.phone && (
          <div className="flex items-center">
            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">{driver.user.phone}</span>
          </div>
        )}
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">{driver.location}</span>
        </div>
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">Joined {formatDate(driver.createdAt)}</span>
        </div>
      </div>
    </div>

    {/* Vehicle Information */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Vehicle Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Truck Type</span>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${getTruckTypeColor(driver.truckType)}`}>
            {driver.truckType.replace('_', ' ')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Capacity</span>
          <span className="text-sm font-medium text-gray-900">{driver.capacity} tons</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Quality</span>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${getQualityColor(driver.quality)}`}>
            {driver.quality}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">License</span>
          <span className="text-sm font-medium text-gray-900">{driver.license}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Registration</span>
          <span className="text-sm font-medium text-gray-900">{driver.registration}</span>
        </div>
      </div>
    </div>

    {/* Driver Statistics */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Driver Statistics</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Rating</span>
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium text-gray-900">{driver.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total Trips</span>
          <span className="text-sm font-medium text-gray-900">{driver.totalTrips}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total Bookings</span>
          <span className="text-sm font-medium text-gray-900">{driver.totalBookings}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Completed Bookings</span>
          <span className="text-sm font-medium text-gray-900">{driver.completedBookings}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total Revenue</span>
          <span className="text-sm font-medium text-green-600">${driver.totalRevenue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <div className="space-y-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              driver.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {driver.isVerified ? 'Verified' : 'Pending'}
            </span>
            <br />
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              driver.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {driver.isAvailable ? 'Available' : 'Busy'}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main component
export default function AdminDriversPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { successToast, errorToast, withConfirmation } = useSweetAlert();

  // State
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterVerified, setFilterVerified] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [pendingFilterChange, setPendingFilterChange] = useState<{ verifiedFilter: string; shouldResetPage: boolean } | null>(null);
  const [pendingURLUpdate, setPendingURLUpdate] = useState<{ page: number; limit: number; search: string; verified: string } | null>(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Form data
  const [editFormData, setEditFormData] = useState<UpdateDriverFormData>(getInitialUpdateFormData());
  const [createFormData, setCreateFormData] = useState<CreateDriverFormData>(getInitialCreateFormData());

  // Handle pending filter changes
  useEffect(() => {
    if (pendingFilterChange) {
      setFilterVerified(pendingFilterChange.verifiedFilter);
      if (pendingFilterChange.shouldResetPage) {
        setCurrentPage(1);
      }
      setPendingFilterChange(null);
    }
  }, [pendingFilterChange]);

  // Handle pending URL updates
  useEffect(() => {
    if (pendingURLUpdate) {
      const { page, limit, search, verified } = pendingURLUpdate;
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (limit !== 10) params.set('limit', limit.toString());
      if (search) params.set('search', search);
      if (verified) params.set('verified', verified);
      const query = params.toString() ? `?${params.toString()}` : '';
      router.push(`${pathname}${query}`, { scroll: false });
      setPendingURLUpdate(null);
    }
  }, [pendingURLUpdate, router, pathname]);

  // Update URL function - now schedules updates instead of immediate execution
  const updateURL = useCallback((page: number, limit: number, search: string, verified: string) => {
    setPendingURLUpdate({ page, limit, search, verified });
  }, []);

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync local state with URL params
  useEffect(() => {
    if (!isClient) return;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const verified = searchParams.get('verified') || '';

    setCurrentPage(page);
    setPageSize(limit);
    setSearchQuery(search);
    setFilterVerified(verified);
  }, [searchParams, isClient]);

  // Fetch drivers when dependencies change
  useEffect(() => {
    if (!isClient) return;
    fetchDrivers();
  }, [currentPage, pageSize, searchQuery, filterVerified, isClient]);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDrivers(currentPage, pageSize, searchQuery, filterVerified);
      setDrivers(response.data);
      setTotalDrivers(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      errorToast('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, filterVerified, errorToast]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL(1, pageSize, query, filterVerified);
  }, [pageSize, filterVerified, updateURL]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateURL(page, pageSize, searchQuery, filterVerified);
  }, [pageSize, searchQuery, filterVerified, updateURL]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    updateURL(1, size, searchQuery, filterVerified);
  }, [searchQuery, filterVerified, updateURL]);

  const handleFilterChange = useCallback((filters: Record<string, string | boolean>) => {
    try {
      console.log('Drivers page handleFilterChange called:', filters);
      
      // Extract verified filter from the filters object
      const verifiedFilter = filters.verified as string || '';
      
      console.log('Extracted verified filter:', verifiedFilter);
      
      // Update URL with new filters immediately
      updateURL(1, pageSize, searchQuery, verifiedFilter);
      
      // Schedule state updates for next render cycle
      setPendingFilterChange({ verifiedFilter, shouldResetPage: true });
      
      console.log('Filter changes applied successfully');
      
    } catch (error) {
      console.error('Error in handleFilterChange:', error);
    }
  }, [pageSize, searchQuery, updateURL]);

  const handleEditDriver = useCallback(async () => {
    if (!selectedDriver) return;
    try {
      await adminApi.updateDriver(selectedDriver.id, editFormData);
      successToast('Driver updated successfully');
      setShowEditModal(false);
      setSelectedDriver(null);
      setEditFormData(getInitialUpdateFormData());
      // Trigger a refetch by updating a dependency
      setCurrentPage(prev => prev);
    } catch (error) {
      console.error('Error updating driver:', error);
      errorToast('Failed to update driver');
    }
  }, [selectedDriver, editFormData, successToast, errorToast]);

  const handleDeleteDriver = useCallback(async (driver: Driver) => {
    await withConfirmation(
      async () => {
        await adminApi.deleteDriver(driver.id);
        successToast('Driver deleted successfully');
        // Trigger a refetch by updating a dependency
        setCurrentPage(prev => prev);
      },
      `Are you sure you want to delete ${driver.user.name}? This action cannot be undone.`,
      'Delete Driver'
    );
  }, [withConfirmation, successToast]);

  const handleCreateDriver = useCallback(async () => {
    try {
      if (!createFormData.userId || !createFormData.license || !createFormData.registration || !createFormData.location) {
        errorToast('Please fill in all required fields');
        return;
      }

      await adminApi.createDriver(createFormData);
      successToast('Driver created successfully');
      setShowCreateModal(false);
      setCreateFormData(getInitialCreateFormData());
      // Trigger a refetch by updating a dependency
      setCurrentPage(prev => prev);
    } catch (err) {
      console.error('Error creating driver:', err);
      errorToast('Failed to create driver');
    }
  }, [createFormData, successToast, errorToast]);

  const handleVerifyDriver = useCallback(async (driver: Driver) => {
    try {
      await adminApi.verifyDriver(driver.id, true);
      successToast('Driver verified successfully');
      // Trigger a refetch by updating a dependency
      setCurrentPage(prev => prev);
    } catch (error) {
      console.error('Error verifying driver:', error);
      errorToast('Failed to verify driver');
    }
  }, [successToast, errorToast]);

  const handleUnverifyDriver = useCallback(async (driver: Driver) => {
    try {
      await adminApi.verifyDriver(driver.id, false);
      successToast('Driver unverified successfully');
      // Trigger a refetch by updating a dependency
      setCurrentPage(prev => prev);
    } catch (error) {
      console.error('Error unverifying driver:', error);
      errorToast('Failed to unverify driver');
    }
  }, [successToast, errorToast]);

  const handleEditDriverClick = useCallback((driver: Driver) => {
    setSelectedDriver(driver);
    setEditFormData({
      truckType: driver.truckType,
      capacity: driver.capacity,
      quality: driver.quality,
      license: driver.license,
      registration: driver.registration,
      location: driver.location,
      isVerified: driver.isVerified,
      isAvailable: driver.isAvailable
    });
    setShowEditModal(true);
  }, []);

  const handleViewDriver = useCallback((driver: Driver) => {
    setSelectedDriver(driver);
    setShowViewModal(true);
  }, []);

  const handleEditFormChange = useCallback((field: keyof UpdateDriverFormData, value: string | number | boolean) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateFormChange = useCallback((field: keyof CreateDriverFormData, value: string | number) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Memoized values
  const columns = useMemo((): Column<Driver>[] => [
    {
      key: 'user.name',
      header: 'Driver',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <UserCircleIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{row.user.name}</div>
            <div className="text-sm text-gray-500">{row.user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'truckType',
      header: 'Truck Type',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTruckTypeColor(value as string)}`}>
          {(value as string).replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (value) => <div className="text-sm text-gray-900">{value as number} tons</div>
    },
    {
      key: 'location',
      header: 'Location',
      render: (value) => (
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">{value as string}</span>
        </div>
      )
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (value) => (
        <div className="flex items-center">
          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
          <span className="text-sm text-gray-900">{(value as number).toFixed(1)}</span>
        </div>
      )
    },
    {
      key: 'isVerified',
      header: 'Verified',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value ? 'Verified' : 'Pending'}
        </span>
      )
    },
    {
      key: 'isAvailable',
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Available' : 'Busy'}
        </span>
      )
    }
  ], []);

  const pagination = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    total: totalDrivers,
    totalPages: totalPages
  }), [currentPage, pageSize, totalDrivers, totalPages]);

  const actions = useMemo(() => ({
    view: handleViewDriver,
    edit: handleEditDriverClick,
    delete: handleDeleteDriver,
    verify: handleVerifyDriver,
    unverify: handleUnverifyDriver
  }), [handleViewDriver, handleEditDriverClick, handleDeleteDriver, handleVerifyDriver, handleUnverifyDriver]);

  // Don't render until client is ready to prevent hydration issues
  if (!isClient) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="Driver Management" subtitle="Manage all drivers in the system">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="Driver Management" subtitle="Manage all drivers in the system">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="flex items-start justify-between">
            <div>
            <h2 className="text-2xl font-bold text-gray-900">Driver Management</h2>
            <p className="text-sm text-gray-500 mt-2">Manage all drivers in the system</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDrivers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={drivers}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handlePageSizeChange}
            onSearch={handleSearch}
            onFilter={handleFilterChange}
            searchPlaceholder="Search drivers by name, email, or location..."
            showSearch={true}
            showFilters={true}
            filterOptions={[
              {
                key: 'verified',
                label: 'Verification Status',
                type: 'select',
                options: [
                  { value: 'verified', label: 'Verified Only' },
                  { value: 'pending', label: 'Pending Only' }
                ],
                placeholder: 'Select verification status'
              }
            ]}
            actions={actions}
            emptyMessage="No drivers found"
            initialSearchQuery={searchQuery}
          />
        </div>

        {/* Create Driver Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Driver"
          size="md"
        >
          <div className="space-y-4">
            <FormField
              label="User ID"
              value={createFormData.userId}
              onChange={(value) => handleCreateFormChange('userId', value as string)}
              placeholder="Enter user ID"
              required
            />

            <TruckTypeSelect 
              value={createFormData.truckType} 
              onChange={(value) => handleCreateFormChange('truckType', value)} 
            />

            <FormField
              label="Capacity (tons)"
              type="number"
              value={createFormData.capacity}
              onChange={(value) => handleCreateFormChange('capacity', value as number)}
              placeholder="Enter capacity"
              required
            />

            <QualitySelect 
              value={createFormData.quality} 
              onChange={(value) => handleCreateFormChange('quality', value)} 
            />

            <FormField
              label="License Number"
              value={createFormData.license}
              onChange={(value) => handleCreateFormChange('license', value as string)}
              placeholder="Enter license number"
              required
            />

            <FormField
              label="Registration Number"
              value={createFormData.registration}
              onChange={(value) => handleCreateFormChange('registration', value as string)}
              placeholder="Enter registration number"
              required
            />

            <FormField
              label="Location"
              value={createFormData.location}
              onChange={(value) => handleCreateFormChange('location', value as string)}
              placeholder="Enter location"
              required
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDriver}>
                Create Driver
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Driver Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Driver"
          size="md"
        >
          <div className="space-y-4">
            <TruckTypeSelect 
              value={editFormData.truckType} 
              onChange={(value) => handleEditFormChange('truckType', value)} 
            />

            <FormField
              label="Capacity (tons)"
              type="number"
              value={editFormData.capacity}
              onChange={(value) => handleEditFormChange('capacity', value as number)}
              placeholder="Enter capacity"
            />

            <QualitySelect 
              value={editFormData.quality} 
              onChange={(value) => handleEditFormChange('quality', value)} 
            />

            <FormField
              label="License Number"
              value={editFormData.license}
              onChange={(value) => handleEditFormChange('license', value as string)}
              placeholder="Enter license number"
            />

            <FormField
              label="Registration Number"
              value={editFormData.registration}
              onChange={(value) => handleEditFormChange('registration', value as string)}
              placeholder="Enter registration number"
            />

            <FormField
              label="Location"
              value={editFormData.location}
              onChange={(value) => handleEditFormChange('location', value as string)}
              placeholder="Enter location"
            />

            <StatusCheckbox 
              label="Verified"
              checked={editFormData.isVerified} 
              onChange={(checked) => handleEditFormChange('isVerified', checked)} 
            />

            <StatusCheckbox 
              label="Available"
              checked={editFormData.isAvailable} 
              onChange={(checked) => handleEditFormChange('isAvailable', checked)} 
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditDriver}>
                Update Driver
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Driver Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Driver Details"
          size="lg"
        >
          {selectedDriver && <DriverDetails driver={selectedDriver} />}
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