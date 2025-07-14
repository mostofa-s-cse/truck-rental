'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { useUI } from '@/hooks/useUI';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { apiClient } from '@/lib/api';
import { SearchFilters } from '@/types';
import { Truck, MapPin, Star, Filter, Search, Phone, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function SearchPage() {
  const {
    filters,
    searchResults,
    totalResults,
    currentPage,
    itemsPerPage,
    isLoading,
    error,
    setFilters,
    clearFilters,
    setSearchResults,
    setCurrentPage,
    setLoading,
    setError
  } = useSearch();

  const { showNotification } = useUI();
  const { error: showErrorAlert } = useSweetAlert();

  const [searchQuery, setSearchQueryLocal] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTruckType, setSelectedTruckType] = useState<SearchFilters['truckType']>(undefined);
  const [selectedQuality, setSelectedQuality] = useState<SearchFilters['quality']>(undefined);
  const [minCapacity, setMinCapacity] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'totalTrips'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [minTrips, setMinTrips] = useState('');
  const [maxTrips, setMaxTrips] = useState('');
  const [searchStats, setSearchStats] = useState<{
    totalDrivers: number;
    availableDrivers: number;
    verifiedDrivers: number;
    averageRating: number;
    availabilityRate: string;
    verificationRate: string;
  } | null>(null);
  const [truckTypeStats, setTruckTypeStats] = useState<Array<{
    truckType: string;
    count: number;
  }>>([]);

  // Load initial data
  useEffect(() => {
    loadPopularTrucks();
    loadSearchStats();
    loadTruckTypeStats();
  }, []);

  const loadPopularTrucks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPopularTrucks(10);
      if (response.success && response.data) {
        setSearchResults(response.data as unknown as Record<string, unknown>[], response.data.length);
      }
    } catch (error) {
      console.error('Error loading popular trucks:', error);
      showErrorAlert('Failed to load trucks');
    } finally {
      setLoading(false);
    }
  };

  const loadSearchStats = async () => {
    try {
      const response = await apiClient.getSearchStats();
      if (response.success && response.data) {
        setSearchStats(response.data);
      }
    } catch (error) {
      console.error('Error loading search stats:', error);
    }
  };

  const loadTruckTypeStats = async () => {
    try {
      const response = await apiClient.getTruckTypeStats();
      if (response.success && response.data) {
        setTruckTypeStats(response.data);
      }
    } catch (error) {
      console.error('Error loading truck type stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showNotification('Please enter a search query', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      const filters: SearchFilters = {
        location: searchQuery.trim(),
        truckType: selectedTruckType,
        quality: selectedQuality,
        capacity: minCapacity ? parseFloat(minCapacity) : undefined,
        rating: minRating ? parseFloat(minRating) : undefined,
      };
      
      const response = await apiClient.searchTrucks(filters, currentPage, itemsPerPage);
      if (response.success && response.data) {
        setSearchResults(response.data.drivers as unknown as Record<string, unknown>[], response.data.total);
        showNotification(`Found ${response.data.total} trucks`, 'success');
      } else {
        setError(response.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      showErrorAlert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async () => {
    try {
      setLoading(true);
      const filters: SearchFilters & {
        sortBy?: 'rating' | 'distance' | 'totalTrips';
        sortOrder?: 'asc' | 'desc';
        minTrips?: number;
        maxTrips?: number;
      } = {
        location: searchQuery.trim(),
        truckType: selectedTruckType,
        quality: selectedQuality,
        capacity: minCapacity ? parseFloat(minCapacity) : undefined,
        rating: minRating ? parseFloat(minRating) : undefined,
        sortBy,
        sortOrder,
        minTrips: minTrips ? parseInt(minTrips) : undefined,
        maxTrips: maxTrips ? parseInt(maxTrips) : undefined,
      };
      
      const response = await apiClient.getAdvancedSearch(filters);
      if (response.success && response.data) {
        setSearchResults(response.data.drivers as unknown as Record<string, unknown>[], response.data.total);
        showNotification(`Advanced search found ${response.data.total} trucks`, 'success');
      } else {
        setError(response.message || 'Advanced search failed');
      }
    } catch (error) {
      console.error('Advanced search error:', error);
      showErrorAlert('Advanced search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async () => {
    try {
      setLoading(true);
      const newFilters: SearchFilters = {
        ...filters,
        truckType: selectedTruckType,
        quality: selectedQuality,
        capacity: minCapacity ? parseFloat(minCapacity) : undefined,
        rating: minRating ? parseFloat(minRating) : undefined,
      };
      
      setFilters(newFilters);
      
      const response = await apiClient.searchTrucks(newFilters, currentPage, itemsPerPage);
      if (response.success && response.data) {
        setSearchResults(response.data.drivers as unknown as Record<string, unknown>[], response.data.total);
        showNotification(`Found ${response.data.total} trucks with filters`, 'success');
      } else {
        setError(response.message || 'Filter search failed');
      }
    } catch (error) {
      console.error('Filter search error:', error);
      showErrorAlert('Filter search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSelectedTruckType(undefined);
    setSelectedQuality(undefined);
    setMinCapacity('');
    setMinRating('');
    clearFilters();
    loadPopularTrucks();
    showNotification('Filters cleared', 'info');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Trucks</h1>
          <p className="text-gray-600">Search for available trucks in your area</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
                {/* Truck Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Truck Type
                  </label>
                  <select
                    value={selectedTruckType || ''}
                    onChange={(e) => setSelectedTruckType(e.target.value as SearchFilters['truckType'] || undefined)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="MINI_TRUCK">Mini Truck</option>
                    <option value="PICKUP">Pickup</option>
                    <option value="LORRY">Lorry</option>
                    <option value="TRUCK">Truck</option>
                  </select>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                  </label>
                  <select
                    value={selectedQuality || ''}
                    onChange={(e) => setSelectedQuality(e.target.value as SearchFilters['quality'] || undefined)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Qualities</option>
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="AVERAGE">Average</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Capacity (tons)
                  </label>
                  <input
                    type="number"
                    value={minCapacity}
                    onChange={(e) => setMinCapacity(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <input
                    type="number"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Trip Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minTrips}
                      onChange={(e) => setMinTrips(e.target.value)}
                      placeholder="Min trips"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={maxTrips}
                      onChange={(e) => setMaxTrips(e.target.value)}
                      placeholder="Max trips"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'rating' | 'distance' | 'totalTrips')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rating">Rating</option>
                    <option value="distance">Distance</option>
                    <option value="totalTrips">Total Trips</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                {/* Apply Filters */}
                <Button
                  onClick={handleFilterChange}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Apply Filters
                </Button>

                {/* Advanced Search */}
                <Button
                  onClick={handleAdvancedSearch}
                  className="w-full bg-purple-600 text-white hover:bg-purple-700"
                >
                  Advanced Search
                </Button>

                {/* Clear Filters */}
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="w-full"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQueryLocal(e.target.value)}
                      placeholder="Search by location or truck type..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-8"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Available Trucks
                </h2>
                <p className="text-gray-600">
                  {totalResults} trucks found
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option>Distance</option>
                  <option>Rating</option>
                  <option>Price</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Results */}
            {!isLoading && !error && (
              <div className="space-y-6">
                {searchResults.map((driver) => (
                  <div key={driver.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Truck className="w-8 h-8 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {driver.user.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              {driver.location}
                              {driver.distance && (
                                <span className="text-blue-600">
                                  ({driver.distance.toFixed(1)} km away)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-500">Truck Type</span>
                            <p className="font-medium">{driver.truckType.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Capacity</span>
                            <p className="font-medium">{driver.capacity} tons</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Quality</span>
                            <p className="font-medium">{driver.quality}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Trips</span>
                            <p className="font-medium">{driver.totalTrips}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            {renderStars(driver.rating)}
                            <span className="ml-1 text-sm text-gray-600">
                              {driver.rating.toFixed(1)}
                            </span>
                          </div>
                          {driver.isVerified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Verified
                            </span>
                          )}
                          {driver.isAvailable && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Available
                            </span>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Button className="bg-blue-600 text-white hover:bg-blue-700">
                            Book Now
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Call
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && searchResults.length === 0 && (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trucks found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalResults > itemsPerPage && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage * itemsPerPage >= totalResults}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 