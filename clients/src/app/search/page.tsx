'use client';

import { useState, useEffect, useCallback } from 'react';
import { Truck, MapPin, Star, Search, Phone, MessageCircle, Loader2, Filter, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { Driver, SearchFilters } from '@/types';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [selectedTruckType, setSelectedTruckType] = useState<SearchFilters['truckType']>();
  const [selectedQuality, setSelectedQuality] = useState<SearchFilters['quality']>();
  const [minCapacity, setMinCapacity] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');
  const [minTrips, setMinTrips] = useState('');
  const [maxTrips, setMaxTrips] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');

  const hasActiveFilters = selectedTruckType || selectedQuality || minCapacity || maxCapacity || 
                          minRating || maxRating || minTrips || maxTrips || availabilityFilter || verificationFilter;

  const buildSearchFilters = useCallback((): SearchFilters => {
    const filters: SearchFilters = {};
    
    // Parse search query for location and truck type
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      // Check if query contains truck type (check longer phrases first)
      const truckTypes = ['mini truck', 'pickup', 'lorry', 'truck'];
      let foundTruckType: string | undefined;
      
      // Check for "mini truck" first (longer phrase)
      if (query.includes('mini truck')) {
        foundTruckType = 'mini truck';
      } else {
        // Check other truck types
        foundTruckType = truckTypes.find(type => query.includes(type));
      }
      
      if (foundTruckType) {
        // Map display names to API values
        const truckTypeMap: Record<string, SearchFilters['truckType']> = {
          'mini truck': 'MINI_TRUCK',
          'pickup': 'PICKUP',
          'lorry': 'LORRY',
          'truck': 'TRUCK'
        };
        filters.truckType = truckTypeMap[foundTruckType];
        
        // Extract location by removing truck type from query
        let locationQuery = query.replace(foundTruckType, '').trim();
        
        // Clean up any extra spaces or punctuation
        locationQuery = locationQuery.replace(/\s+/g, ' ').trim();
        
        if (locationQuery) {
          filters.location = locationQuery;
        }
      } else {
        // If no truck type found, treat as location search
        filters.location = searchQuery;
      }
    }
    
    // Apply other filters (these override search query filters if set)
    if (selectedTruckType) filters.truckType = selectedTruckType;
    if (selectedQuality) filters.quality = selectedQuality;
    if (minCapacity) filters.capacity = parseFloat(minCapacity);
    if (minRating) filters.rating = parseFloat(minRating);
    if (availabilityFilter === 'available') filters.availability = true;
    if (availabilityFilter === 'busy') filters.availability = false;
    if (verificationFilter === 'verified') filters.verified = true;
    if (verificationFilter === 'unverified') filters.verified = false;
    
    return filters;
  }, [searchQuery, selectedTruckType, selectedQuality, minCapacity, minRating, availabilityFilter, verificationFilter]);

  // Apply additional frontend filters that aren't supported by the API
  const applyFrontendFilters = useCallback((drivers: Driver[]): Driver[] => {
    return drivers.filter(driver => {
      // Max capacity filter
      if (maxCapacity && driver.capacity > parseFloat(maxCapacity)) {
        return false;
      }
      
      // Max rating filter
      if (maxRating && driver.rating > parseFloat(maxRating)) {
        return false;
      }
      
      // Min trips filter
      if (minTrips && driver.totalTrips < parseInt(minTrips)) {
        return false;
      }
      
      // Max trips filter
      if (maxTrips && driver.totalTrips > parseInt(maxTrips)) {
        return false;
      }
      
      return true;
    });
  }, [maxCapacity, maxRating, minTrips, maxTrips]);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading initial data...');
      
      const response = await apiClient.getPopularTrucks(itemsPerPage);
      console.log('Initial data response:', response);
      
      if (response.success && response.data) {
        const drivers = response.data as Driver[];
        console.log('Setting initial drivers:', drivers.length);
        setDrivers(drivers);
        setTotalResults(drivers.length);
        setHasMore(drivers.length >= itemsPerPage);
      } else {
        console.error('Failed to load initial data:', response.message);
        setError(response.message || 'Failed to load trucks');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to load trucks: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  const handleSearch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Searching with filters:', buildSearchFilters());
      
      const filters = buildSearchFilters();
      const response = await apiClient.searchTrucks(filters, 1, itemsPerPage);
      console.log('Search response:', response);
      
      if (response.success && response.data) {
        // The API returns SearchResult with drivers array
        const searchData = response.data as { drivers: Driver[]; total: number };
        const drivers = searchData.drivers || [];
        
        // Apply additional frontend filters that aren't supported by the API
        const filteredDrivers = applyFrontendFilters(drivers);
        
        console.log('Setting search results:', filteredDrivers.length);
        setDrivers(filteredDrivers);
        setTotalResults(filteredDrivers.length); // Use filtered count for accurate pagination
        setHasMore(filteredDrivers.length >= itemsPerPage);
        setCurrentPage(1);
      } else {
        console.error('Search failed:', response.message);
        setError(response.message || 'Search failed');
      }
    } catch (error) {
      console.error('Error during search:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Search failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, buildSearchFilters, applyFrontendFilters]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Auto-search when search query changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        console.log('Auto-searching for:', searchQuery);
        handleSearch();
      } else if (!hasActiveFilters) {
        // If search is empty and no active filters, load initial data
        console.log('Search empty, loading initial data');
        loadInitialData();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch, loadInitialData, hasActiveFilters]);

  // Auto-search when filters change
  useEffect(() => {
    if (hasActiveFilters) {
      handleSearch();
    } else if (!searchQuery.trim()) {
      // If no active filters and no search query, load initial data
      loadInitialData();
    }
  }, [selectedTruckType, selectedQuality, minCapacity, maxCapacity, minRating, maxRating, minTrips, maxTrips, availabilityFilter, verificationFilter, handleSearch, loadInitialData, searchQuery, hasActiveFilters]);

  const handleLoadMore = async () => {
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      
      const filters = buildSearchFilters();
      const response = await apiClient.searchTrucks(filters, nextPage, itemsPerPage);
      
      if (response.success && response.data) {
        // The searchTrucks API returns SearchResult with drivers array
        const searchData = response.data as { drivers: Driver[]; total: number };
        let newDrivers = searchData.drivers || [];
        
        // Apply additional frontend filters
        newDrivers = applyFrontendFilters(newDrivers);
        
        setDrivers(prev => [...prev, ...newDrivers]);
        setCurrentPage(nextPage);
        setHasMore(newDrivers.length >= itemsPerPage);
      } else {
        setError(response.message || 'Failed to load more trucks');
      }
    } catch (error) {
      console.error('Load more error:', error);
      setError('Failed to load more trucks. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const clearAllFilters = () => {
    setSelectedTruckType(undefined);
    setSelectedQuality(undefined);
    setMinCapacity('');
    setMaxCapacity('');
    setMinRating('');
    setMaxRating('');
    setMinTrips('');
    setMaxTrips('');
    setAvailabilityFilter('');
    setVerificationFilter('');
    setSearchQuery('');
    setCurrentPage(1);
    setError(null);
    loadInitialData();
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
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Trucks</h1>
          <p className="text-gray-600">Search and browse available trucks in your area</p>
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">All Qualities</option>
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="AVERAGE">Average</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>

                {/* Capacity Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (tons)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minCapacity}
                      onChange={(e) => setMinCapacity(e.target.value)}
                      placeholder="Min"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    />
                    <input
                      type="number"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(e.target.value)}
                      placeholder="Max"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                </div>

                {/* Rating Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minRating}
                      onChange={(e) => setMinRating(e.target.value)}
                      placeholder="Min"
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    />
                    <input
                      type="number"
                      value={maxRating}
                      onChange={(e) => setMaxRating(e.target.value)}
                      placeholder="Max"
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                </div>

                {/* Trip Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Trips
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minTrips}
                      onChange={(e) => setMinTrips(e.target.value)}
                      placeholder="Min"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    />
                    <input
                      type="number"
                      value={maxTrips}
                      onChange={(e) => setMaxTrips(e.target.value)}
                      placeholder="Max"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">All</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>

                {/* Verification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification
                  </label>
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">All</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm p-3 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location or truck type (e.g., Dhaka pickup, mini truck)..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-blue-600" />
                )}
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
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Searching for trucks...</p>
                </div>
              </div>
            )}

            {/* Results */}
            {!isLoading && (
              <div className="space-y-6">
                {drivers.map((driver) => (
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
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-500">Truck Type</span>
                            <p className="font-medium text-gray-900">{driver.truckType.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Capacity</span>
                            <p className="font-medium text-gray-900">{driver.capacity} tons</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Quality</span>
                            <p className="font-medium text-gray-900">{driver.quality}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Trips</span>
                            <p className="font-medium text-gray-900">{driver.totalTrips}</p>
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
                          {driver.isAvailable ? (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Available
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              Busy
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
            {!isLoading && drivers.length === 0 && (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trucks found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria
                </p>
              </div>
            )}

            {/* Load More Button */}
            {!isLoading && hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  className="px-8 py-3"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Load More (${totalResults - drivers.length} remaining)`
                  )}
                </Button>
              </div>
            )}

            {/* End of Results */}
            {!isLoading && !hasMore && drivers.length > 0 && (
              <div className="text-center mt-8 py-4">
                <p className="text-gray-500 text-sm">
                  You&apos;ve reached the end of the results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 