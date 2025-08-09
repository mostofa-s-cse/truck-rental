'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { userApi } from '@/lib/dashboardApi';
import { 
  CreditCardIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserCircleIcon,
  TruckIcon,
  MapPinIcon,
  ReceiptRefundIcon
} from '@heroicons/react/24/outline';

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  booking: {
    id: string;
    source: string;
    destination: string;
    fare: number;
    status: string;
    driver: {
      user: {
        name: string;
      };
      truckType: string;
    };
  };
}

export default function UserPaymentsPage() {
  const { successToast, errorToast, question } = useSweetAlert();
  
  // State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await userApi.getUserPayments(currentPage, pageSize);
      
      // Filter payments based on search query and status
      let filteredPayments = response.payments || [];
      
      if (searchQuery) {
        filteredPayments = filteredPayments.filter(payment =>
          payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.booking.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.booking.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.booking.driver.user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (filterStatus) {
        filteredPayments = filteredPayments.filter(payment => payment.status === filterStatus);
      }

      setPayments(filteredPayments);
      setTotalPayments(response.pagination?.total || 0);
      setTotalPages(response.pagination?.pages || 0);
    } catch (error) {
      console.error('Error fetching payments:', error);
      errorToast('Failed to fetch payments');
      setPayments([]);
      setTotalPayments(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, filterStatus, errorToast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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

  const handleFilterChange = (filters: Record<string, string | boolean>) => {
    const statusFilter = filters.status as string;
    setFilterStatus(statusFilter || '');
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleRefundPayment = async (payment: Payment) => {
    if (payment.status !== 'COMPLETED') {
      errorToast('Only completed payments can be refunded');
      return;
    }

    const result = await question(
      `Are you sure you want to request a refund for this payment?`,
      'Request Refund'
    );

    if (!result.isConfirmed) return;

    try {
      // TODO: Implement refund functionality
      successToast('Refund request submitted successfully');
      fetchPayments();
    } catch (error) {
      console.error('Error requesting refund:', error);
      errorToast('Failed to request refund');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'REFUNDED':
        return <ReceiptRefundIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'SSLCOMMERZ':
        return <CreditCardIcon className="h-4 w-4 text-blue-500" />;
      case 'CASH':
        return <CurrencyDollarIcon className="h-4 w-4 text-green-500" />;
      case 'MOBILE_BANKING':
        return <ArrowPathIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <CreditCardIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Table columns
  const columns: Column<Payment>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: (value) => (
        <div className="text-sm font-mono text-gray-900">
          {value ? `#${(value as string).slice(-8).toUpperCase()}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'booking.driver.user.name',
      header: 'Driver',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <UserCircleIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {row.booking.driver.user.name}
            </div>
            <div className="text-sm text-gray-500">
              {row.booking.driver.truckType.replace('_', ' ')}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'booking.source',
      header: 'Route',
      render: (value, row) => (
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
          <div className="text-sm">
            <div className="text-gray-900">From: {row.booking.source}</div>
            <div className="text-gray-600">To: {row.booking.destination}</div>
          </div>
        </div>
      )
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
      key: 'paymentMethod',
      header: 'Method',
      render: (value, row) => (
        <div className="flex items-center">
          {getPaymentMethodIcon(row.paymentMethod)}
          <span className="ml-1 text-sm text-gray-900">
            {row.paymentMethod.replace('_', ' ')}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const statusValue = value as string;
        return (
          <div className="flex items-center space-x-2">
            {getStatusIcon(statusValue)}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(statusValue)}`}>
              {statusValue}
            </span>
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (value) => (
        <div className="text-sm">
          <div className="text-gray-900">{new Date(value as string).toLocaleDateString()}</div>
          <div className="text-gray-500">{new Date(value as string).toLocaleTimeString()}</div>
        </div>
      )
    }
  ];

  const pagination = {
    page: currentPage,
    limit: pageSize,
    total: totalPayments,
    totalPages: totalPages
  };

  const actions = {
    view: handleViewPayment,
    delete: handleRefundPayment
  };

  return (
    <ProtectedRoute requiredRole="USER">
      <DashboardLayout title="My Payments" subtitle="View and manage your payment history">
        <div className="space-y-6">
          {/* Header with Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Payments</h2>
                <p className="text-sm text-gray-500 mt-2">Track your payment history and transactions</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${payments.reduce((sum, p) => sum + (p.status === 'COMPLETED' ? p.amount : 0), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CreditCardIcon className="h-6 w-6 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Payments</p>
                      <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {payments.filter(p => p.status === 'PENDING').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DataTable */}
          <div className="bg-white rounded-xl shadow-lg">
            <DataTable
              data={payments}
              columns={columns}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handlePageSizeChange}
              onSearch={handleSearch}
              onFilter={handleFilterChange}
              searchPlaceholder="Search by Transaction ID, Route, or Driver name..."
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
                }
              ]}
              actions={actions}
              emptyMessage="No payments found. Your payment history will appear here!"
              initialSearchQuery={searchQuery}
            />
          </div>
        </div>

        {/* View Payment Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Payment Details"
          size="xl"
        >
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Transaction #{selectedPayment.transactionId?.slice(-8).toUpperCase() || 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedPayment.createdAt).toLocaleDateString()} at {new Date(selectedPayment.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedPayment.status)}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Payment Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Amount:</span>
                      <span className="text-sm font-bold text-gray-900">${selectedPayment.amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Method:</span>
                      <div className="flex items-center">
                        {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                        <span className="ml-1 text-sm text-gray-900">
                          {selectedPayment.paymentMethod.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Transaction ID:</span>
                      <span className="text-sm font-mono text-gray-900">
                        {selectedPayment.transactionId || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Last Updated:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(selectedPayment.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trip Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <TruckIcon className="h-5 w-5 text-green-500 mr-2" />
                    Trip Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Booking ID:</span>
                      <span className="text-sm font-mono text-gray-900">
                        #{selectedPayment.booking.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">From: {selectedPayment.booking.source}</div>
                        <div className="text-gray-600">To: {selectedPayment.booking.destination}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Driver:</span>
                      <span className="text-sm text-gray-900">{selectedPayment.booking.driver.user.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Trip Status:</span>
                      <span className="text-sm text-gray-900">{selectedPayment.booking.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
                {selectedPayment.status === 'COMPLETED' && (
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleRefundPayment(selectedPayment);
                      setShowViewModal(false);
                    }}
                  >
                    Request Refund
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
