'use client';

import { useState, useEffect, useCallback } from 'react';
import { Truck, MapPin, Star, Search, Phone, MessageCircle, Loader2, Filter, X, TrendingUp, LogIn } from 'lucide-react';
import Button from '@/components/ui/Button';
import BookingModal from '@/components/BookingModal';
import { apiClient } from '@/lib/api';
import { Driver, SearchFilters } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  
  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;
  
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

  // Booking modal state
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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

  const handleBookNow = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsBookingModalOpen(true);
  };

  const handleLoginRedirect = () => {
    // Redirect to login page
    router.push('/login');
  };

  const handleBookingComplete = () => {
    // Refresh the search results or show success message
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Find Your Perfect Truck
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-blue-100 px-4">
              Connect with verified drivers across Bangladesh
            </p>
            
            {/* Hero Search Bar */}
            <div className="max-w-3xl mx-auto px-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location or truck type..."
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black placeholder-gray-500 bg-white shadow-lg"
                />
                {isLoading && (
                  <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-4 sm:top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-4 sm:space-y-6`}>
                {/* Truck Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Truck Type
                  </label>
                  <select
                    value={selectedTruckType || ''}
                    onChange={(e) => setSelectedTruckType(e.target.value as SearchFilters['truckType'] || undefined)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm sm:text-base"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500 bg-white"
                    />
                    <input
                      type="number"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(e.target.value)}
                      placeholder="Max"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500 bg-white"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500 bg-white"
                    />
                    <input
                      type="number"
                      value={maxRating}
                      onChange={(e) => setMaxRating(e.target.value)}
                      placeholder="Max"
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500 bg-white"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500 bg-white"
                    />
                    <input
                      type="number"
                      value={maxTrips}
                      onChange={(e) => setMaxTrips(e.target.value)}
                      placeholder="Max"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500 bg-white"
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
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Available Trucks
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {totalResults} trucks found
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="text-xs sm:text-sm text-green-600 font-medium">Live Updates</span>
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
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-600">Searching for trucks...</p>
                </div>
              </div>
            )}

            {/* Results */}
            {!isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
                {drivers.map((driver) => (
                  <div key={driver.id} className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden">
                    {/* Driver Header */}
                    <div className="p-4 sm:p-6 border-b border-gray-100">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {driver.user.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{driver.location}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 mb-1">
                            {renderStars(driver.rating)}
                            <span className="ml-1 text-xs sm:text-sm text-gray-600">
                              {driver.rating.toFixed(1)}
                            </span>
                          </div>
                          {driver.isVerified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Driver Details */}
                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500">Truck Type</span>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{driver.truckType.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500">Capacity</span>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{driver.capacity} tons</p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500">Quality</span>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{driver.quality}</p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500">Trips</span>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{driver.totalTrips}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
                        {driver.isAvailable ? (
                          <span className="bg-green-100 text-green-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
                            Available Now
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
                            Currently Busy
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button 
                          onClick={isAuthenticated ? () => handleBookNow(driver) : handleLoginRedirect}
                          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-2.5"
                        >
                          {isAuthenticated ? (
                            'Book Now'
                          ) : (
                            <>
                              <LogIn className="w-4 h-4 mr-2" />
                              <span className='text-sm'>Login to Book</span>
                            </>
                          )}
                        </Button>
                        <div className="flex gap-2 sm:gap-3">
                          <Button variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Call</span>
                          </Button>
                          <Button variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Message</span>
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
              <div className="text-center py-8 sm:py-12">
                <Truck className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No trucks found</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Try adjusting your search criteria
                </p>
              </div>
            )}

            {/* Load More Button */}
            {!isLoading && hasMore && (
              <div className="flex justify-center mt-6 sm:mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <span className="sm:hidden">Load More</span>
                      <span className="hidden sm:inline">Load More ({totalResults - drivers.length} remaining)</span>
                    </>
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

      {/* Booking Modal */}
      <BookingModal
        driver={selectedDriver}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
}  