'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
  ExclamationTriangleIcon,
  UserCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Utility functions
const formatDate = (date: string) => new Date(date).toLocaleDateString();

const formatDateTime = (date: string) => new Date(date).toLocaleString();

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'FAILED': return 'bg-red-100 text-red-800';
    case 'REFUNDED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getMethodIcon = (method: string | undefined) => {
  if (!method) return '💳';
  switch (method) {
    case 'CASH': return '💵';
    case 'CARD': return '💳';
    case 'MOBILE_MONEY': return '📱';
    default: return '💳';
  }
};

// Sub-components
const PaymentDetails = ({ payment }: { payment: Payment }) => (
  <div className="space-y-6">
    {/* Payment Header */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Payment #{payment.id.slice(-8).toUpperCase()}
        </h3>
        <p className="text-sm text-gray-500">
          Created on {formatDate(payment.createdAt)}
        </p>
      </div>
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
        {payment.status}
      </span>
    </div>

    {/* Payment Information */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Booking ID</label>
          <p className="text-sm text-gray-900">#{payment.bookingId.slice(-8).toUpperCase()}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <p className="text-sm font-medium text-gray-900">${payment.amount}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <div className="flex items-center">
            <span className="mr-2">{getMethodIcon(payment.method)}</span>
            <p className="text-sm text-gray-900">{payment.method.replace('_', ' ')}</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
          <p className="text-sm text-gray-900">{payment.transactionId || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Created At</label>
          <p className="text-sm text-gray-900">{formatDateTime(payment.createdAt)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Updated At</label>
          <p className="text-sm text-gray-900">{formatDateTime(payment.updatedAt)}</p>
        </div>
        {payment.processedAt && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Processed At</label>
            <p className="text-sm text-gray-900">{formatDateTime(payment.processedAt)}</p>
          </div>
        )}
      </div>
    </div>

    {/* Customer Information */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h4>
      <div className="flex items-center">
        <UserCircleIcon className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <p className="text-sm font-medium text-gray-900">{payment.user.name}</p>
          <p className="text-sm text-gray-500">{payment.user.email}</p>
        </div>
      </div>
    </div>
  </div>
);

// Main component
export default function AdminPaymentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { successToast, errorToast } = useSweetAlert();

  // State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [pendingFilterChange, setPendingFilterChange] = useState<{ statusFilter: string; methodFilter: string; shouldResetPage: boolean } | null>(null);
  const [pendingURLUpdate, setPendingURLUpdate] = useState<{ page: number; limit: number; search: string; status: string; method: string } | null>(null);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Handle pending filter changes
  useEffect(() => {
    if (pendingFilterChange) {
      setFilterStatus(pendingFilterChange.statusFilter);
      setFilterMethod(pendingFilterChange.methodFilter);
      if (pendingFilterChange.shouldResetPage) {
        setCurrentPage(1);
      }
      setPendingFilterChange(null);
    }
  }, [pendingFilterChange]);

  // Handle pending URL updates
  useEffect(() => {
    if (pendingURLUpdate) {
      const { page, limit, search, status, method } = pendingURLUpdate;
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (limit !== 10) params.set('limit', limit.toString());
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (method) params.set('method', method);
      const query = params.toString() ? `?${params.toString()}` : '';
      router.push(`${pathname}${query}`, { scroll: false });
      setPendingURLUpdate(null);
    }
  }, [pendingURLUpdate, router, pathname]);

  // Update URL function - now schedules updates instead of immediate execution
  const updateURL = useCallback((page: number, limit: number, search: string, status: string, method: string) => {
    setPendingURLUpdate({ page, limit, search, status, method });
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
    const status = searchParams.get('status') || '';
    const method = searchParams.get('method') || '';

    setCurrentPage(page);
    setPageSize(limit);
    setSearchQuery(search);
    setFilterStatus(status);
    setFilterMethod(method);
  }, [searchParams, isClient]);

  // Fetch payments when dependencies change
  useEffect(() => {
    if (!isClient) return;
    fetchPayments();
  }, [currentPage, pageSize, searchQuery, filterStatus, filterMethod, isClient]);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPayments(currentPage, pageSize, searchQuery, filterStatus || undefined);
      setPayments(response.data);
      setTotalPayments(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching payments:', err);
      errorToast('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, filterStatus, filterMethod, errorToast]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL(1, pageSize, query, filterStatus, filterMethod);
  }, [pageSize, filterStatus, filterMethod, updateURL]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateURL(page, pageSize, searchQuery, filterStatus, filterMethod);
  }, [pageSize, searchQuery, filterStatus, filterMethod, updateURL]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    updateURL(1, size, searchQuery, filterStatus, filterMethod);
  }, [searchQuery, filterStatus, filterMethod, updateURL]);

  const handleFilterChange = useCallback((filters: Record<string, string | boolean>) => {
    try {
      console.log('Payments page handleFilterChange called:', filters);
      
      // Extract filters from the filters object
      const statusFilter = filters.status as string || '';
      const methodFilter = filters.method as string || '';
      
      console.log('Extracted filters:', { statusFilter, methodFilter });
      
      // Update URL with new filters immediately
      updateURL(1, pageSize, searchQuery, statusFilter, methodFilter);
      
      // Schedule state updates for next render cycle
      setPendingFilterChange({ statusFilter, methodFilter, shouldResetPage: true });
      
      console.log('Filter changes applied successfully');
      
    } catch (error) {
      console.error('Error in handleFilterChange:', error);
    }
  }, [pageSize, searchQuery, updateURL]);

  const handleUpdateStatus = useCallback(async (payment: Payment, newStatus: string) => {
    try {
      await adminApi.updatePayment(payment.id, { status: newStatus });
      successToast('Payment status updated successfully');
      // Trigger a refetch by updating a dependency
      setCurrentPage(prev => prev);
    } catch (error) {
      console.error('Error updating payment status:', error);
      errorToast('Failed to update payment status');
    }
  }, [successToast, errorToast]);

  const handleViewPayment = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  }, []);

  // Memoized values
  const columns = useMemo((): Column<Payment>[] => [
    {
      key: 'id',
      header: 'Payment ID',
      render: (value) => `#${(value as string).slice(-8).toUpperCase()}`
    },
    {
      key: 'bookingId',
      header: 'Booking ID',
      render: (value) => `#${(value as string).slice(-8).toUpperCase()}`
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value) => (
        <div className="flex items-center">
          <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm font-medium text-gray-900">${value as number}</span>
        </div>
      )
    },
    {
      key: 'method',
      header: 'Method',
      render: (value) => {
        const method = value as string;
        return (
          <div className="flex items-center">
            <span className="mr-2">{getMethodIcon(method)}</span>
            <span className="text-sm text-gray-900">{method?.replace('_', ' ') || 'Unknown'}</span>
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
            {value as string}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value) => formatDate(value as string)
    }
  ], []);

  const pagination = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    total: totalPayments,
    totalPages: totalPages
  }), [currentPage, pageSize, totalPayments, totalPages]);

  const actions = useMemo(() => ({
    view: handleViewPayment
  }), [handleViewPayment]);

  const totalRevenue = useMemo(() => 
    payments.reduce((sum, payment) => sum + payment.amount, 0), 
    [payments]
  );

  // Don't render until client is ready to prevent hydration issues
  if (!isClient) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="Payment Management" subtitle="Manage all payments in the system">
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
      <DashboardLayout title="Payment Management" subtitle="Manage all payments in the system">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
              <p className="text-sm text-gray-500 mt-2">Manage all payments in the system</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={payments}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handlePageSizeChange}
            onSearch={handleSearch}
            onFilter={handleFilterChange}
            searchPlaceholder="Search by Payment ID, Booking ID, Transaction ID, or Customer name/email..."
            showSearch={true}
            showFilters={true}
            filterOptions={[
              {
                key: 'status',
                label: 'Payment Status',
                type: 'select',
                options: [
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'FAILED', label: 'Failed' },
                  { value: 'REFUNDED', label: 'Refunded' }
                ],
                placeholder: 'Select payment status'
              },
              {
                key: 'method',
                label: 'Payment Method',
                type: 'select',
                options: [
                  { value: 'CASH', label: 'Cash' },
                  { value: 'CARD', label: 'Card' },
                  { value: 'MOBILE_MONEY', label: 'Mobile Money' }
                ],
                placeholder: 'Select payment method'
              }
            ]}
            actions={actions}
            emptyMessage="No payments found"
            initialSearchQuery={searchQuery}
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
              <PaymentDetails payment={selectedPayment} />

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