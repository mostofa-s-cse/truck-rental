'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { adminApi, Review } from '@/lib/adminApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  StarIcon, 
  UserCircleIcon,
  TruckIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

export default function AdminReviewsPage() {
  const { successToast, errorToast, withConfirmation } = useSweetAlert();
  
  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [currentPage, pageSize, searchQuery]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getReviews(currentPage, pageSize, searchQuery);
      setReviews(response.data);
      setTotalReviews(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      errorToast('Failed to fetch reviews');
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

  const handleDeleteReview = async (review: Review) => {
    await withConfirmation(
      async () => {
        await adminApi.deleteReview(review.id);
        successToast('Review deleted successfully');
        fetchReviews();
      },
      `Are you sure you want to delete this review? This action cannot be undone.`,
      'Delete Review'
    );
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setShowViewModal(true);
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

  // Table columns
  const columns: Column<Review>[] = [
    {
      key: 'id',
      header: 'Review ID',
      render: (value) => `#${value.slice(-8).toUpperCase()}`
    },
    {
      key: 'user.name',
      header: 'Customer',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <UserCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{row.user.name}</div>
            <div className="text-sm text-gray-500">{row.user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'driver.user.name',
      header: 'Driver',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <TruckIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{row.driver.user.name}</div>
            <div className="text-sm text-gray-500">{row.driver.truckType.replace('_', ' ')}</div>
          </div>
        </div>
      )
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (value) => renderStars(value)
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (value) => (
        <div className="max-w-xs">
          {value ? (
            <div className="flex items-start">
              <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-900 truncate">{value}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">No comment</span>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="Review Management" subtitle="Manage all reviews in the system">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <StarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <StarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reviews.length > 0 
                      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={reviews}
            columns={columns}
            loading={loading}
            pagination={{
              page: currentPage,
              limit: pageSize,
              total: totalReviews,
              totalPages: totalPages
            }}
            onPageChange={handlePageChange}
            onLimitChange={handlePageSizeChange}
            onSearch={handleSearch}
            searchPlaceholder="Search reviews by customer or driver name..."
            showAddButton={false}
            actions={{
              view: handleViewReview,
              delete: handleDeleteReview
            }}
            emptyMessage="No reviews found"
          />
        </div>

        {/* View Review Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Review Details"
          size="lg"
        >
          {selectedReview && (
            <div className="space-y-6">
              {/* Review Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Review #{selectedReview.id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created on {new Date(selectedReview.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  {renderStars(selectedReview.rating)}
                </div>
              </div>

              {/* Customer and Driver Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h4>
                  <div className="flex items-center mb-3">
                    <UserCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedReview.user.name}</p>
                      <p className="text-sm text-gray-500">{selectedReview.user.email}</p>
                      {selectedReview.user.phone && (
                        <p className="text-sm text-gray-500">{selectedReview.user.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Driver Information</h4>
                  <div className="flex items-center mb-3">
                    <TruckIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedReview.driver.user.name}</p>
                      <p className="text-sm text-gray-500">{selectedReview.driver.user.email}</p>
                      <p className="text-sm text-gray-500">{selectedReview.driver.truckType.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Review Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <div className="mt-1">
                      {renderStars(selectedReview.rating)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Comment</label>
                    {selectedReview.comment ? (
                      <div className="mt-1 p-3 bg-white rounded-md border">
                        <div className="flex items-start">
                          <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-900">{selectedReview.comment}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">No comment provided</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                      <p className="text-sm text-gray-900">#{selectedReview.bookingId.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created At</label>
                      <p className="text-sm text-gray-900">{new Date(selectedReview.createdAt).toLocaleString()}</p>
                    </div>
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