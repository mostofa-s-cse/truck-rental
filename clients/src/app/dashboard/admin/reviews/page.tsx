'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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

// Utility functions
const formatDate = (date: string) => new Date(date).toLocaleDateString();

const formatDateTime = (date: string) => new Date(date).toLocaleString();

const getRatingColor = (rating: number) => {
  if (rating >= 4) return 'text-green-600';
  if (rating >= 3) return 'text-yellow-600';
  return 'text-red-600';
};

// Sub-components
const ReviewDetails = ({ review }: { review: Review }) => (
  <div className="space-y-6">
    {/* Review Header */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Review #{review.id.slice(-8).toUpperCase()}
        </h3>
        <p className="text-sm text-gray-500">
          Created on {formatDate(review.createdAt)}
        </p>
      </div>
      <div className="text-right">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`h-5 w-5 ${
                star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
          <span className={`ml-2 text-sm font-medium ${getRatingColor(review.rating)}`}>
            ({review.rating}/5)
          </span>
        </div>
      </div>
    </div>

    {/* Customer and Driver Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h4>
        <div className="flex items-center mb-3">
          <UserCircleIcon className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">{review.user.name}</p>
            <p className="text-sm text-gray-500">{review.user.email}</p>
            {review.user.phone && (
              <p className="text-sm text-gray-500">{review.user.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Driver Information</h4>
        <div className="flex items-center mb-3">
          <TruckIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">{review.driver.user.name}</p>
            <p className="text-sm text-gray-500">{review.driver.user.email}</p>
            <p className="text-sm text-gray-500">{review.driver.truckType.replace('_', ' ')}</p>
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
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${
                    star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className={`ml-2 text-sm font-medium ${getRatingColor(review.rating)}`}>
                {review.rating} out of 5 stars
              </span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Comment</label>
          {review.comment ? (
            <div className="mt-1 p-3 bg-white rounded-md border">
              <div className="flex items-start">
                <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-900">{review.comment}</p>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-500">No comment provided</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Booking ID</label>
            <p className="text-sm text-gray-900">#{review.bookingId.slice(-8).toUpperCase()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Created At</label>
            <p className="text-sm text-gray-900">{formatDateTime(review.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main component
function AdminReviewsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { successToast, errorToast, withConfirmation } = useSweetAlert();

  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterRating, setFilterRating] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [pendingFilterChange, setPendingFilterChange] = useState<{ ratingFilter: string; shouldResetPage: boolean } | null>(null);
  const [pendingURLUpdate, setPendingURLUpdate] = useState<{ page: number; limit: number; search: string; rating: string } | null>(null);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Handle pending filter changes
  useEffect(() => {
    if (pendingFilterChange) {
      setFilterRating(pendingFilterChange.ratingFilter);
      if (pendingFilterChange.shouldResetPage) {
        setCurrentPage(1);
      }
      setPendingFilterChange(null);
    }
  }, [pendingFilterChange]);

  // Handle pending URL updates
  useEffect(() => {
    if (pendingURLUpdate) {
      const { page, limit, search, rating } = pendingURLUpdate;
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (limit !== 10) params.set('limit', limit.toString());
      if (search) params.set('search', search);
      if (rating) params.set('rating', rating);
      const query = params.toString() ? `?${params.toString()}` : '';
      router.push(`${pathname}${query}`, { scroll: false });
      setPendingURLUpdate(null);
    }
  }, [pendingURLUpdate, router, pathname]);

  // Update URL function - now schedules updates instead of immediate execution
  const updateURL = useCallback((page: number, limit: number, search: string, rating: string) => {
    setPendingURLUpdate({ page, limit, search, rating });
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
    const rating = searchParams.get('rating') || '';

    setCurrentPage(page);
    setPageSize(limit);
    setSearchQuery(search);
    setFilterRating(rating);
  }, [searchParams, isClient]);

  // Fetch reviews when dependencies change
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getReviews(currentPage, pageSize, searchQuery, filterRating || undefined);
      setReviews(response.data);
      setTotalReviews(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      errorToast('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, filterRating, errorToast]);

  // Fetch reviews when dependencies change
  useEffect(() => {
    if (!isClient) return;
    fetchReviews();
  }, [currentPage, pageSize, searchQuery, filterRating, isClient, fetchReviews]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL(1, pageSize, query, filterRating);
  }, [pageSize, filterRating, updateURL]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateURL(page, pageSize, searchQuery, filterRating);
  }, [pageSize, searchQuery, filterRating, updateURL]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    updateURL(1, size, searchQuery, filterRating);
  }, [searchQuery, filterRating, updateURL]);

  const handleFilterChange = useCallback((filters: Record<string, string | boolean>) => {
    try {
      console.log('Reviews page handleFilterChange called:', filters);
      
      // Extract rating filter from the filters object
      const ratingFilter = filters.rating as string || '';
      
      console.log('Extracted rating filter:', ratingFilter);
      
      // Update URL with new filters immediately
      updateURL(1, pageSize, searchQuery, ratingFilter);
      
      // Schedule state updates for next render cycle
      setPendingFilterChange({ ratingFilter, shouldResetPage: true });
      
      console.log('Filter changes applied successfully');
      
    } catch (error) {
      console.error('Error in handleFilterChange:', error);
    }
  }, [pageSize, searchQuery, updateURL]);

  const handleDeleteReview = useCallback(async (review: Review) => {
    await withConfirmation(
      async () => {
        await adminApi.deleteReview(review.id);
        successToast('Review deleted successfully');
        // Trigger a refetch by updating a dependency
        setCurrentPage(prev => prev);
      },
      `Are you sure you want to delete this review? This action cannot be undone.`,
      'Delete Review'
    );
  }, [withConfirmation, successToast]);

  const handleViewReview = useCallback((review: Review) => {
    setSelectedReview(review);
    setShowViewModal(true);
  }, []);

  const renderStars = useCallback((rating: number) => {
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
        <span className={`ml-2 text-sm ${getRatingColor(rating)}`}>({rating})</span>
      </div>
    );
  }, []);

  // Memoized values
  const columns = useMemo((): Column<Review>[] => [
    {
      key: 'id',
      header: 'Review ID',
      render: (value) => `#${(value as string).slice(-8).toUpperCase()}`
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
      render: (value) => renderStars(value as number)
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (value) => (
        <div className="max-w-xs">
          {value ? (
            <div className="flex items-start">
              <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-900 truncate">{value as string}</span>
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
      render: (value) => formatDate(value as string)
    }
  ], [renderStars]);

  const pagination = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    total: totalReviews,
    totalPages: totalPages
  }), [currentPage, pageSize, totalReviews, totalPages]);

  const actions = useMemo(() => ({
    view: handleViewReview,
    delete: handleDeleteReview
  }), [handleViewReview, handleDeleteReview]);

  const averageRating = useMemo(() => 
    reviews.length > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : '0.0',
    [reviews]
  );

  // Don't render until client is ready to prevent hydration issues
  if (!isClient) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout title="Review Management" subtitle="Manage all reviews in the system">
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
      <DashboardLayout title="Review Management" subtitle="Manage all reviews in the system">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review Management</h2>
              <p className="text-sm text-gray-500 mt-2">Manage all reviews in the system</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={reviews}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handlePageSizeChange}
            onSearch={handleSearch}
            onFilter={handleFilterChange}
            searchPlaceholder="Search by Review ID, Customer name/email, Driver name/email, or Comment..."
            showSearch={true}
            showFilters={true}
            filterOptions={[
              {
                key: 'rating',
                label: 'Rating',
                type: 'select',
                options: [
                  { value: '5', label: '5 Stars' },
                  { value: '4', label: '4 Stars' },
                  { value: '3', label: '3 Stars' },
                  { value: '2', label: '2 Stars' },
                  { value: '1', label: '1 Star' }
                ],
                placeholder: 'Select rating'
              }
            ]}
            actions={actions}
            emptyMessage="No reviews found"
            initialSearchQuery={searchQuery}
          />
        </div>

        {/* View Review Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Review Details"
          size="lg"
        >
          {selectedReview && <ReviewDetails review={selectedReview} />}
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowViewModal(false)}
            >
              Close
            </Button>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Loading component for Suspense fallback
function AdminReviewsLoading() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout title="Review Management" subtitle="Manage all reviews in the system">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Main export with Suspense wrapper
export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<AdminReviewsLoading />}>
      <AdminReviewsContent />
    </Suspense>
  );
}