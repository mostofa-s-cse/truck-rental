'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { adminApi, Payment } from '@/lib/adminApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  CreditCardIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function AdminPaymentsPage() {
  const { successToast, errorToast } = useSweetAlert();
  
  // State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>('');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, pageSize, searchQuery, filterStatus, filterMethod]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPayments(currentPage, pageSize, searchQuery, filterStatus || undefined);
      setPayments(response.data);
      setTotalPayments(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching payments:', error);
      errorToast('Failed to fetch payments');
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

  const handleUpdateStatus = async (payment: Payment, newStatus: string) => {
    try {
      await adminApi.updatePayment(payment.id, { status: newStatus });
      successToast('Payment status updated successfully');
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
      errorToast('Failed to update payment status');
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  // Table columns
  const columns: Column<Payment>[] = [
    {
      key: 'id',
      header: 'Payment ID',
      render: (value) => `#${value.slice(-8).toUpperCase()}`
    },
    {
      key: 'bookingId',
      header: 'Booking ID',
      render: (value) => `#${value.slice(-8).toUpperCase()}`
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value) => (
        <div className="flex items-center">
          <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm font-medium text-gray-900">${value}</span>
        </div>
      )
    },
    {
      key: 'method',
      header: 'Method',
      render: (value) => {
        const methodIcons = {
          'CASH': '💵',
          'CARD': '💳',
          'MOBILE_MONEY': '📱'
        };
        return (
          <div className="flex items-center">
            <span className="mr-2">{methodIcons[value as keyof typeof methodIcons] || '💳'}</span>
            <span className="text-sm text-gray-900">{value ? value.replace('_', ' ') : 'Unknown'}</span>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const statusConfig = {
          'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
          'COMPLETED': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
          'FAILED': { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
          'REFUNDED': { color: 'bg-gray-100 text-gray-800', icon: ExclamationTriangleIcon }
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        const Icon = config?.icon || ClockIcon;
        
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
            <Icon className="h-3 w-3 mr-1" />
            {value}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="Payment Management" subtitle="Manage all payments in the system">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCardIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
              
              <label className="text-sm font-medium text-gray-700">Filter by Method:</label>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Methods</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
              </select>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={payments}
            columns={columns}
            loading={loading}
            pagination={{
              page: currentPage,
              limit: pageSize,
              total: totalPayments,
              totalPages: totalPages
            }}
            onPageChange={handlePageChange}
            onLimitChange={handlePageSizeChange}
            onSearch={handleSearch}
            searchPlaceholder="Search payments by ID or transaction ID..."
            showAddButton={false}
            actions={{
              view: handleViewPayment
            }}
            emptyMessage="No payments found"
          />
        </div>

        {/* View Payment Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Payment Details"
          size="lg"
        >
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Payment #{selectedPayment.id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created on {new Date(selectedPayment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedPayment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  selectedPayment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  selectedPayment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedPayment.status}
                </span>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                    <p className="text-sm text-gray-900">#{selectedPayment.bookingId.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-sm font-medium text-gray-900">${selectedPayment.amount}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <p className="text-sm text-gray-900">{selectedPayment.method.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="text-sm text-gray-900">{selectedPayment.transactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-sm text-gray-900">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Updated At</label>
                    <p className="text-sm text-gray-900">{new Date(selectedPayment.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              {selectedPayment.status === 'PENDING' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Update Status</h4>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedPayment, 'COMPLETED')}
                    >
                      Mark as Completed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedPayment, 'FAILED')}
                    >
                      Mark as Failed
                    </Button>
                  </div>
                </div>
              )}

              {selectedPayment.status === 'COMPLETED' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Update Status</h4>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedPayment, 'REFUNDED')}
                    >
                      Mark as Refunded
                    </Button>
                  </div>
                </div>
              )}

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