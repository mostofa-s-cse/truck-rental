import { useAppDispatch, useAppSelector } from './redux';
import {
  setFilters,
  clearFilters,
  setSearchQuery,
  setSearchResults,
  setCurrentPage,
  setItemsPerPage,
  setLoading,
  setError,
  clearSearch,
} from '@/store/slices/searchSlice';

// Import the SearchResult type from the slice
interface SearchFilters {
  truckType?: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  capacity?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  rating?: number;
  availability?: boolean;
  verified?: boolean;
  quality?: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

// Define SearchResult to match the slice interface
interface SearchResult {
  id: string;
  name: string;
  type: string;
  rating: number;
  location: string;
  price: number;
  available: boolean;
}

export const useSearch = () => {
  const dispatch = useAppDispatch();
  const {
    filters,
    searchQuery,
    searchResults,
    totalResults,
    currentPage,
    itemsPerPage,
    isLoading,
    error,
  } = useAppSelector((state) => state.search);

  const setSearchFilters = (newFilters: Partial<SearchFilters>) => {
    dispatch(setFilters(newFilters));
  };

  const clearSearchFilters = () => {
    dispatch(clearFilters());
  };

  const setSearchQueryText = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const setSearchResultsData = (results: SearchResult[], total: number) => {
    dispatch(setSearchResults({ results, total }));
  };

  const setSearchCurrentPage = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const setSearchItemsPerPage = (itemsPerPage: number) => {
    dispatch(setItemsPerPage(itemsPerPage));
  };

  const setSearchLoading = (loading: boolean) => {
    dispatch(setLoading(loading));
  };

  const setSearchError = (error: string | null) => {
    dispatch(setError(error));
  };

  const clearSearchData = () => {
    dispatch(clearSearch());
  };

  return {
    // State
    filters,
    searchQuery,
    searchResults,
    totalResults,
    currentPage,
    itemsPerPage,
    isLoading,
    error,
    
    // Actions
    setFilters: setSearchFilters,
    clearFilters: clearSearchFilters,
    setSearchQuery: setSearchQueryText,
    setSearchResults: setSearchResultsData,
    setCurrentPage: setSearchCurrentPage,
    setItemsPerPage: setSearchItemsPerPage,
    setLoading: setSearchLoading,
    setError: setSearchError,
    clearSearch: clearSearchData,
  };
}; 