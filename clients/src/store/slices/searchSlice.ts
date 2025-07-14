import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface SearchState {
  filters: SearchFilters;
  searchQuery: string;
  searchResults: any[];
  totalResults: number;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  filters: {},
  searchQuery: '',
  searchResults: [],
  totalResults: 0,
  currentPage: 1,
  itemsPerPage: 10,
  isLoading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<{ results: any[]; total: number }>) => {
      state.searchResults = action.payload.results;
      state.totalResults = action.payload.total;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when items per page changes
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.totalResults = 0;
      state.currentPage = 1;
      state.error = null;
    },
  },
});

export const {
  setFilters,
  clearFilters,
  setSearchQuery,
  setSearchResults,
  setCurrentPage,
  setItemsPerPage,
  setLoading,
  setError,
  clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer; 