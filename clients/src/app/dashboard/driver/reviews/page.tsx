'use client';

import { useState, useEffect } from 'react'; 
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
  const [totalReviews, setTotalReviews] = useState(0);
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

  useEffect(() => {
    fetchReviews();
  }, [currentPage, pageSize, searchQuery, filterRating]);

  const fetchReviews = async () => {
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
            destination: 'Shopping Center',
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
          comment: 'Outstanding experience! The driver went above and beyond to ensure my goods were transported safely. Very reliable service.',
          createdAt: '2024-01-13T09:20:00Z',
          booking: {
            source: 'Warehouse District',
            destination: 'Port Area',
            date: '2024-01-13',
            fare: 150
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
          comment: 'Service was okay. Driver was a bit late but the delivery was completed. Room for improvement.',
          createdAt: '2024-01-12T14:15:00Z',
          booking: {
            source: 'Office Complex',
            destination: 'Residential Area',
            date: '2024-01-12',
            fare: 95
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
          comment: 'Perfect service! The driver was extremely professional, the truck was spotless, and everything was delivered on time. Five stars!',
          createdAt: '2024-01-11T11:30:00Z',
          booking: {
            source: 'Shopping Mall',
            destination: 'Business District',
            date: '2024-01-11',
            fare: 110
          }
        }
      ];

      // Calculate stats
      const totalReviews = mockReviews.length;
      const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      const fiveStarReviews = mockReviews.filter(review => review.rating === 5).length;
      const fourStarReviews = mockReviews.filter(review => review.rating === 4).length;
      const threeStarReviews = mockReviews.filter(review => review.rating === 3).length;
      const twoStarReviews = mockReviews.filter(review => review.rating === 2).length;
      const oneStarReviews = mockReviews.filter(review => review.rating === 1).length;

      setStats({
        totalReviews,
        averageRating,
        fiveStarReviews,
        fourStarReviews,
        threeStarReviews,
        twoStarReviews,
        oneStarReviews
      });

      setReviews(mockReviews);
      setTotalReviews(totalReviews);
      setTotalPages(Math.ceil(totalReviews / pageSize));
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
      render: (value) => renderStars(value)
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 truncate">{value}</p>
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
      render: (value) => new Date(value).toLocaleDateString()
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
                  <StarIcon className="h-6 w-6 text-blue-600" />
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
                    {renderStars(Math.round(stats.averageRating))}
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
                  <p className="text-sm text-gray-500">{((stats.fiveStarReviews / stats.totalReviews) * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ChatBubbleLeftIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">4-Star Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.fourStarReviews}</p>
                  <p className="text-sm text-gray-500">{((stats.fourStarReviews / stats.totalReviews) * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[
                { stars: 5, count: stats.fiveStarReviews, color: 'bg-green-500' },
                { stars: 4, count: stats.fourStarReviews, color: 'bg-blue-500' },
                { stars: 3, count: stats.threeStarReviews, color: 'bg-yellow-500' },
                { stars: 2, count: stats.twoStarReviews, color: 'bg-orange-500' },
                { stars: 1, count: stats.oneStarReviews, color: 'bg-red-500' }
              ].map((rating) => (
                <div key={rating.stars} className="flex items-center">
                  <div className="flex items-center w-16">
                    <span className="text-sm font-medium text-gray-600">{rating.stars} stars</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${rating.color} h-2 rounded-full`}
                        style={{ width: `${(rating.count / stats.totalReviews) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm text-gray-600">{rating.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Rating:</label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
            searchPlaceholder="Search reviews by customer name or comment..."
            showAddButton={false}
            actions={{
              view: handleViewReview
            }}
            emptyMessage="No reviews found"
          />
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