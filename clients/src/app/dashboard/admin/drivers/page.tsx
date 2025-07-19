'use client';

import { useState, useEffect } from 'react';
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
  StarIcon
} from '@heroicons/react/24/outline';

export default function AdminDriversPage() {
  const { successToast, errorToast, withConfirmation } = useSweetAlert();
  
  // State
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterVerified, setFilterVerified] = useState<boolean | undefined>(undefined);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<CreateDriverRequest>({
    userId: '',
    truckType: 'MINI_TRUCK',
    capacity: 1.5,
    quality: 'GOOD',
    license: '',
    registration: '',
    location: ''
  });
  
  const [editFormData, setEditFormData] = useState<UpdateDriverRequest>({
    truckType: 'MINI_TRUCK',
    capacity: 1.5,
    quality: 'GOOD',
    license: '',
    registration: '',
    location: '',
    isVerified: false,
    isAvailable: true
  });

  useEffect(() => {
    fetchDrivers();
  }, [currentPage, pageSize, searchQuery, filterVerified]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDrivers(currentPage, pageSize, filterVerified);
      setDrivers(response.data);
      setTotalDrivers(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      errorToast('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleAddDriver = async () => {
    try {
      if (!formData.userId || !formData.license || !formData.registration || !formData.location) {
        errorToast('Please fill in all required fields');
        return;
      }

      await adminApi.createDriver(formData as CreateDriverRequest);
      successToast('Driver created successfully');
      setShowAddModal(false);
      setFormData({
        userId: '',
        truckType: 'MINI_TRUCK',
        capacity: 1.5,
        quality: 'GOOD',
        license: '',
        registration: '',
        location: ''
      });
      fetchDrivers();
    } catch (error) {
      console.error('Error adding driver:', error);
      errorToast('Failed to create driver');
    }
  };

  const handleEditDriver = async () => {
    if (!selectedDriver) return;

    try {
      await adminApi.updateDriver(selectedDriver.id, editFormData);
      successToast('Driver updated successfully');
      setShowEditModal(false);
      setSelectedDriver(null);
      setEditFormData({
        truckType: 'MINI_TRUCK',
        capacity: 1.5,
        quality: 'GOOD',
        license: '',
        registration: '',
        location: '',
        isVerified: false,
        isAvailable: true
      });
      fetchDrivers();
    } catch (error) {
      console.error('Error updating driver:', error);
      errorToast('Failed to update driver');
    }
  };

  const handleDeleteDriver = async (driver: Driver) => {
    await withConfirmation(
      async () => {
        await adminApi.deleteDriver(driver.id);
        successToast('Driver deleted successfully');
        fetchDrivers();
      },
      `Are you sure you want to delete ${driver.user.name}? This action cannot be undone.`,
      'Delete Driver'
    );
  };

  const handleVerifyDriver = async (driver: Driver) => {
    try {
      await adminApi.verifyDriver(driver.id);
      successToast('Driver verified successfully');
      fetchDrivers();
    } catch (error) {
      console.error('Error verifying driver:', error);
      errorToast('Failed to verify driver');
    }
  };

  const handleUnverifyDriver = async (driver: Driver) => {
    try {
      await adminApi.unverifyDriver(driver.id);
      successToast('Driver unverified successfully');
      fetchDrivers();
    } catch (error) {
      console.error('Error unverifying driver:', error);
      errorToast('Failed to unverify driver');
    }
  };

  const handleViewDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowViewModal(true);
  };

  const handleEditDriverClick = (driver: Driver) => {
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
  };

  // Table columns
  const columns: Column<Driver>[] = [
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
      render: (value) => value.replace('_', ' ')
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (value) => `${value} tons`
    },
    {
      key: 'location',
      header: 'Location',
      render: (value) => (
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (value) => (
        <div className="flex items-center">
          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
          <span className="text-sm text-gray-900">{value.toFixed(1)}</span>
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
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="Driver Management" subtitle="Manage all drivers in the system">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filterVerified === true}
                  onChange={(e) => setFilterVerified(e.target.checked ? true : undefined)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified Only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filterVerified === false}
                  onChange={(e) => setFilterVerified(e.target.checked ? false : undefined)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Pending Only</span>
              </label>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={drivers}
            columns={columns}
            loading={loading}
            pagination={{
              page: currentPage,
              limit: pageSize,
              total: totalDrivers,
              totalPages: totalPages
            }}
            onPageChange={handlePageChange}
            onLimitChange={handlePageSizeChange}
            onSearch={handleSearch}
            searchPlaceholder="Search drivers by name, email, or location..."
            showAddButton={true}
            addButtonText="Add Driver"
            onAdd={() => setShowAddModal(true)}
            actions={{
              view: handleViewDriver,
              edit: handleEditDriverClick,
              delete: handleDeleteDriver,
              verify: handleVerifyDriver,
              unverify: handleUnverifyDriver
            }}
            emptyMessage="No drivers found"
          />
        </div>

        {/* Add Driver Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Driver"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID *
              </label>
              <input
                type="text"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Truck Type *
              </label>
              <select
                value={formData.truckType}
                onChange={(e) => setFormData({ ...formData, truckType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="MINI_TRUCK">Mini Truck</option>
                <option value="PICKUP">Pickup</option>
                <option value="LORRY">Lorry</option>
                <option value="TRUCK">Truck</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (tons) *
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter capacity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality *
              </label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="AVERAGE">Average</option>
                <option value="POOR">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number *
              </label>
              <input
                type="text"
                value={formData.license}
                onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter license number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                value={formData.registration}
                onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter registration number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter location"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddDriver}>
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
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Truck Type
              </label>
              <select
                value={editFormData.truckType}
                onChange={(e) => setEditFormData({ ...editFormData, truckType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="MINI_TRUCK">Mini Truck</option>
                <option value="PICKUP">Pickup</option>
                <option value="LORRY">Lorry</option>
                <option value="TRUCK">Truck</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (tons)
              </label>
              <input
                type="number"
                step="0.1"
                value={editFormData.capacity}
                onChange={(e) => setEditFormData({ ...editFormData, capacity: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter capacity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality
              </label>
              <select
                value={editFormData.quality}
                onChange={(e) => setEditFormData({ ...editFormData, quality: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="AVERAGE">Average</option>
                <option value="POOR">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <input
                type="text"
                value={editFormData.license}
                onChange={(e) => setEditFormData({ ...editFormData, license: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter license number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={editFormData.registration}
                onChange={(e) => setEditFormData({ ...editFormData, registration: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter registration number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter location"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editFormData.isVerified}
                  onChange={(e) => setEditFormData({ ...editFormData, isVerified: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editFormData.isAvailable}
                  onChange={(e) => setEditFormData({ ...editFormData, isAvailable: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Available</span>
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
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
          {selectedDriver && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserCircleIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedDriver.user.name}</h3>
                  <p className="text-sm text-gray-500">{selectedDriver.user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Truck Type</label>
                  <p className="text-sm text-gray-900">{selectedDriver.truckType.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <p className="text-sm text-gray-900">{selectedDriver.capacity} tons</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quality</label>
                  <p className="text-sm text-gray-900">{selectedDriver.quality}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License</label>
                  <p className="text-sm text-gray-900">{selectedDriver.license}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration</label>
                  <p className="text-sm text-gray-900">{selectedDriver.registration}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="text-sm text-gray-900">{selectedDriver.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-900">{selectedDriver.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Trips</label>
                  <p className="text-sm text-gray-900">{selectedDriver.totalTrips}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Earnings</label>
                  <p className="text-sm text-gray-900">${selectedDriver.totalEarnings.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="space-y-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedDriver.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedDriver.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                    <br />
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedDriver.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDriver.isAvailable ? 'Available' : 'Busy'}
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