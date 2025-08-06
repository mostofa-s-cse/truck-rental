'use client';

import { useState, useEffect, useCallback } from 'react'; 
import DashboardLayout from '@/components/ui/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  StarIcon,
  UserCircleIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

interface Review {
  id: string;
  bookingId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  booking: {
    source: string;
    destination: string;
    date: string;
    fare: number;
  };
}

export default function DriverReviewsPage() {
  const { errorToast } = useSweetAlert();
  
  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filterRating, setFilterRating] = useState<string>('');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    fiveStarReviews: 0,
    fourStarReviews: 0,
    threeStarReviews: 0,
    twoStarReviews: 0,
    oneStarReviews: 0
  });

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock data (replace with real API call)
      const mockReviews: Review[] = [
        {
          id: '1',
          bookingId: 'BK001',
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: undefined
          },
          rating: 5,
          comment: 'Excellent service! The driver was very professional and arrived on time. The truck was clean and well-maintained. Highly recommended!',
          createdAt: '2024-01-15T10:30:00Z',
          booking: {
            source: 'Downtown Area',
            destination: 'Industrial Zone',
            date: '2024-01-15',
            fare: 85
          }
        },
        {
          id: '2',
          bookingId: 'BK002',
          user: {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            avatar: undefined
          },
          rating: 4,
          comment: 'Good service overall. Driver was friendly and handled the delivery carefully. Would use again.',
          createdAt: '2024-01-14T15:45:00Z',
          booking: {
            source: 'Residential Area',
            destination: 'Business District',
            date: '2024-01-14',
            fare: 120
          }
        },
        {
          id: '3',
          bookingId: 'BK003',
          user: {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            avatar: undefined
          },
          rating: 5,
          comment: 'Outstanding experience! The driver was punctual, professional, and the delivery was completed perfectly. Will definitely book again.',
          createdAt: '2024-01-13T09:15:00Z',
          booking: {
            source: 'Warehouse District',
            destination: 'Retail Center',
            date: '2024-01-13',
            fare: 95
          }
        },
        {
          id: '4',
          bookingId: 'BK004',
          user: {
            id: '4',
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            avatar: undefined
          },
          rating: 3,
          comment: 'Service was okay. Driver arrived a bit late but the delivery was completed. Could be improved.',
          createdAt: '2024-01-12T14:20:00Z',
          booking: {
            source: 'Office Complex',
            destination: 'Storage Facility',
            date: '2024-01-12',
            fare: 75
          }
        },
        {
          id: '5',
          bookingId: 'BK005',
          user: {
            id: '5',
            name: 'David Brown',
            email: 'david@example.com',
            avatar: undefined
          },
          rating: 5,
          comment: 'Excellent driver! Very professional, on time, and handled everything perfectly. Highly recommend!',
          createdAt: '2024-01-11T11:30:00Z',
          booking: {
            source: 'Shopping Mall',
            destination: 'Distribution Center',
            date: '2024-01-11',
            fare: 110
          }
        }
      ];

      // Filter reviews based on search query and rating filter
      let filteredReviews = mockReviews;
      
      if (searchQuery) {
        filteredReviews = filteredReviews.filter(review =>
          review.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (filterRating) {
        filteredReviews = filteredReviews.filter(review =>
          review.rating === parseInt(filterRating)
        );
      }

      // Calculate pagination
      const totalPages = Math.ceil(filteredReviews.length / pageSize);
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

      // Calculate stats
      const totalReviewsCount = mockReviews.length;
      const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviewsCount;
      const fiveStarReviews = mockReviews.filter(review => review.rating === 5).length;
      const fourStarReviews = mockReviews.filter(review => review.rating === 4).length;
      const threeStarReviews = mockReviews.filter(review => review.rating === 3).length;
      const twoStarReviews = mockReviews.filter(review => review.rating === 2).length;
      const oneStarReviews = mockReviews.filter(review => review.rating === 1).length;

      setStats({
        totalReviews: totalReviewsCount,
        averageRating,
        fiveStarReviews,
        fourStarReviews,
        threeStarReviews,
        twoStarReviews,
        oneStarReviews
      });

      setReviews(paginatedReviews);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      errorToast('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, filterRating, errorToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Table columns
  const columns: Column<Review>[] = [
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
      key: 'rating',
      header: 'Rating',
      render: (value) => renderStars(value as number)
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 truncate">{value as string}</p>
        </div>
      )
    },
    {
      key: 'booking.source',
      header: 'Trip',
      render: (value, row) => (
        <div className="text-sm">
          <div className="text-gray-900">{row.booking.source}</div>
          <div className="text-gray-500">→ {row.booking.destination}</div>
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (value) => new Date(value as string).toLocaleDateString()
    }
  ];

  return (
    <ProtectedRoute requiredRole="DRIVER">
      <DashboardLayout title="Customer Reviews" subtitle="View and manage customer feedback">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChatBubbleLeftIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <StarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                    <div className="ml-2">
                      {renderStars(Math.round(stats.averageRating))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <StarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">5-Star Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.fiveStarReviews}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <StarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">4-Star Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.fourStarReviews}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = rating === 5 ? stats.fiveStarReviews :
                             rating === 4 ? stats.fourStarReviews :
                             rating === 3 ? stats.threeStarReviews :
                             rating === 2 ? stats.twoStarReviews : stats.oneStarReviews;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center">
                    <div className="flex items-center w-16">
                      <span className="text-sm font-medium text-gray-600">{rating}</span>
                      <StarIcon className="h-4 w-4 text-yellow-400 ml-1" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Reviews</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
            </div>

            <DataTable
              data={reviews}
              columns={columns}
              loading={loading}
              pagination={{
                page: currentPage,
                limit: pageSize,
                total: reviews.length,
                totalPages: totalPages
              }}
              onPageChange={handlePageChange}
              onLimitChange={handlePageSizeChange}
              onSearch={handleSearch}
              searchPlaceholder="Search reviews by customer name or comment..."
              actions={{
                view: handleViewReview
              }}
              emptyMessage="No reviews found"
            />
          </div>
        </div>

        {/* View Review Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Review Details"
          size="xl"
        >
          {selectedReview && (
            <div className="space-y-6">
              {/* Review Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Review #{selectedReview.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedReview.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  {renderStars(selectedReview.rating)}
                  <p className={`text-sm font-medium ${getRatingColor(selectedReview.rating)}`}>
                    {selectedReview.rating} out of 5 stars
                  </p>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h4>
                <div className="flex items-center">
                  <UserCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedReview.user.name}</p>
                    <p className="text-sm text-gray-500">{selectedReview.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Trip Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Trip Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                    <p className="text-sm text-gray-900">#{selectedReview.bookingId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trip Date</label>
                    <p className="text-sm text-gray-900">{new Date(selectedReview.booking.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">From</label>
                    <p className="text-sm text-gray-900">{selectedReview.booking.source}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">To</label>
                    <p className="text-sm text-gray-900">{selectedReview.booking.destination}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fare</label>
                    <p className="text-sm font-medium text-gray-900">${selectedReview.booking.fare}</p>
                  </div>
                </div>
              </div>

              {/* Review Comment */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Comment</h4>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-sm text-gray-900 leading-relaxed">{selectedReview.comment}</p>
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