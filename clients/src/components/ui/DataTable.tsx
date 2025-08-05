'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Button from './Button';

// Types
export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'checkbox' | 'date' | 'text';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSearch?: (query: string) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, string | boolean>) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  filterOptions?: FilterOption[];
  actions?: {
    view?: (row: T) => void;
    edit?: (row: T) => void;
    delete?: (row: T) => void;
    activate?: (row: T) => void;
    deactivate?: (row: T) => void;
    verify?: (row: T) => void;
    unverify?: (row: T) => void;
  };
  emptyMessage?: string;
  className?: string;
  initialSearchQuery?: string;
}

// Action button configuration
const ACTION_CONFIG = {
  view: { icon: EyeIcon, color: 'text-blue-600 hover:text-blue-900', title: 'View' },
  edit: { icon: PencilIcon, color: 'text-green-600 hover:text-green-900', title: 'Edit' },
  activate: { icon: CheckCircleIcon, color: 'text-green-600 hover:text-green-900', title: 'Activate' },
  deactivate: { icon: XCircleIcon, color: 'text-yellow-600 hover:text-yellow-900', title: 'Deactivate' },
  verify: { icon: CheckCircleIcon, color: 'text-green-600 hover:text-green-900', title: 'Verify' },
  unverify: { icon: XCircleIcon, color: 'text-yellow-600 hover:text-yellow-900', title: 'Unverify' },
  delete: { icon: TrashIcon, color: 'text-red-600 hover:text-red-900', title: 'Delete' }
} as const;

// Utility functions
const getNestedValue = (obj: unknown, path: string): unknown => {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return current;
};

const formatValue = (value: unknown): React.ReactNode => {
  if (typeof value === 'boolean') {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value ? 'Yes' : 'No'}
      </span>
    );
  }

  if (typeof value === 'string' && value.includes('T')) {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  }

  return value?.toString() || '-';
};

// Sub-components
const SearchInput = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  onSearch?: (query: string) => void; 
  placeholder: string; 
}) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  }, [onSearch, value]);

  const handleSearchClick = useCallback(() => {
    onSearch?.(value);
  }, [onSearch, value]);

  return (
    <div className="relative flex w-full">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-16 sm:pr-20 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white text-sm"
        aria-label="Search"
      />
      {onSearch && (
        <button
          onClick={handleSearchClick}
          className="px-2 sm:px-3 md:px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm transition-colors"
          aria-label="Search"
        >
          <span className="hidden sm:inline">Search</span>
          <MagnifyingGlassIcon className="sm:hidden h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const FilterPanel = ({ 
  filterOptions, 
  filters, 
  onFilterChange, 
  onClearFilters 
}: { 
  filterOptions: FilterOption[];
  filters: Record<string, string | boolean>;
  onFilterChange: (key: string, value: string | boolean) => void;
  onClearFilters: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClearAndClose = useCallback(() => {
    onClearFilters();
    setIsOpen(false);
  }, [onClearFilters]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const renderFilterInput = useCallback((option: FilterOption) => {
    const value = filters[option.key] || '';

    const handleChange = (newValue: string | boolean) => {
      onFilterChange(option.key, newValue);
    };

    switch (option.type) {
      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            aria-label={option.label}
          >
            <option value="">{option.placeholder || `Select ${option.label}`}</option>
            {option.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => handleChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-label={option.label}
            />
            <span className="ml-2 text-sm text-gray-700">{option.label}</span>
          </label>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            aria-label={option.label}
          />
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={option.placeholder || `Enter ${option.label}`}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            aria-label={option.label}
          />
        );
    }
  }, [filters, onFilterChange]);

  const activeFiltersCount = useMemo(() => 
    Object.values(filters).filter(v => v !== '' && v !== false).length, 
    [filters]
  );

  return (
    <div className="relative filter-panel">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleToggle}
        className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
        aria-label={`Filters${activeFiltersCount > 0 ? ` (${activeFiltersCount} active)` : ''}`}
      >
        <FunnelIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Filters</span>
        <span className="sm:hidden">Filter</span>
        {activeFiltersCount > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-[16px] sm:min-w-[20px] text-center">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 md:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 filter-panel">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAndClose}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-800 transition-colors"
                  aria-label="Clear all filters"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {filterOptions.map((option) => (
                <div key={option.key}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {option.label}
                  </label>
                  {renderFilterInput(option)}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="text-xs sm:text-sm"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ActionButton = <T,>({ 
  action, 
  row, 
  type 
}: { 
  action: (row: T) => void; 
  row: T; 
  type: keyof typeof ACTION_CONFIG; 
}) => {
  const config = ACTION_CONFIG[type];
  const Icon = config.icon;
  
  const handleClick = useCallback(() => {
    action(row);
  }, [action, row]);
  
  return (
    <button
      onClick={handleClick}
      className={`${config.color} p-1.5 sm:p-1 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
      title={config.title}
      aria-label={config.title}
    >
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </button>
  );
};

const LoadingRow = ({ colSpan }: { colSpan: number }) => (
  <tr>
    <td colSpan={colSpan} className="px-2 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 text-center">
      <div className="flex items-center justify-center">
        <ArrowPathIcon className="animate-spin h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600" />
        <span className="ml-2 text-xs sm:text-sm text-gray-600">Loading...</span>
      </div>
    </td>
  </tr>
);

const EmptyRow = ({ colSpan, message }: { colSpan: number; message: string }) => (
  <tr>
    <td colSpan={colSpan} className="px-2 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 text-center">
      <div className="text-gray-500">
        <div className="text-sm sm:text-base md:text-lg font-medium mb-2">{message}</div>
        <p className="text-xs sm:text-sm">No data available to display</p>
      </div>
    </td>
  </tr>
);

const PaginationInfo = ({ pagination }: { pagination: NonNullable<DataTableProps<unknown>['pagination']> }) => (
  <span className="text-xs sm:text-sm text-gray-700">
    <span className="hidden sm:inline">
      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
      {pagination.total} results
    </span>
    <span className="sm:hidden">
      {pagination.total} results
    </span>
  </span>
);

const PageSizeSelector = ({ 
  value, 
  onChange 
}: { 
  value: number; 
  onChange: (value: number) => void; 
}) => (
  <select
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white transition-colors"
    aria-label="Items per page"
  >
    <option value={10}>10</option>
    <option value={25}>25</option>
    <option value={50}>50</option>
    <option value={100}>100</option>
  </select>
);

const PaginationControls = ({ 
  pagination, 
  onPageChange 
}: { 
  pagination: NonNullable<DataTableProps<unknown>['pagination']>; 
  onPageChange?: (page: number) => void; 
}) => {
  const handlePrevPage = useCallback(() => {
    onPageChange?.(pagination.page - 1);
  }, [onPageChange, pagination.page]);

  const handleNextPage = useCallback(() => {
    onPageChange?.(pagination.page + 1);
  }, [onPageChange, pagination.page]);

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <button
        onClick={handlePrevPage}
        disabled={pagination.page <= 1}
        className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-900 bg-white transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
      <span className="text-xs sm:text-sm text-gray-700 min-w-[60px] sm:min-w-auto text-center">
        <span className="hidden sm:inline">Page {pagination.page} of {pagination.totalPages}</span>
        <span className="sm:hidden">{pagination.page}/{pagination.totalPages}</span>
      </span>
      <button
        onClick={handleNextPage}
        disabled={pagination.page >= pagination.totalPages}
        className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-900 bg-white transition-colors"
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
    </div>
  );
};

// Main component
export default function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  pagination,
  onPageChange,
  onLimitChange,
  onSearch,
  onSort,
  onFilter,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showFilters = false,
  filterOptions = [],
  actions,
  emptyMessage = 'No data found',
  className = '',
  initialSearchQuery = ''
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string | boolean>>({});
  const [pendingFilterUpdate, setPendingFilterUpdate] = useState<Record<string, string | boolean> | null>(null);

  // Handle pending filter updates
  useEffect(() => {
    if (pendingFilterUpdate !== null) {
      onFilter?.(pendingFilterUpdate);
      setPendingFilterUpdate(null);
    }
  }, [pendingFilterUpdate, onFilter]);

  // Close filter panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.filter-panel')) {
        const filterPanels = document.querySelectorAll('.filter-panel');
        filterPanels.forEach(panel => {
          const button = panel.querySelector('button');
          if (button) {
            button.setAttribute('data-open', 'false');
          }
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Memoized values
  const hasActions = useMemo(() => actions && Object.keys(actions).length > 0, [actions]);
  const colSpan = useMemo(() => columns.length + (hasActions ? 1 : 0), [columns.length, hasActions]);
  const availableActions = useMemo(() => {
    if (!actions) return [];
    return Object.entries(actions).filter(([, handler]) => handler !== undefined);
  }, [actions]);

  // Callbacks
  const handleSort = useCallback((key: string) => {
    if (!onSort) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort(key, newDirection);
  }, [onSort, sortKey, sortDirection]);

  const handleFilterChange = useCallback((key: string, value: string | boolean) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // Schedule filter update for next render cycle
      setPendingFilterUpdate(newFilters);
      return newFilters;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    // Schedule filter update for next render cycle
    setPendingFilterUpdate({});
  }, []);

  const renderCell = useCallback((column: Column<T>, row: T) => {
    let value: unknown;
    
    if (typeof column.key === 'string' && column.key.includes('.')) {
      value = getNestedValue(row, column.key);
    } else {
      value = row[column.key as keyof T];
    }

    if (column.render) {
      return column.render(value, row);
    }

    return formatValue(value);
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          
          {showFilters && filterOptions.length > 0 && (
            <FilterPanel
              filterOptions={filterOptions}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          )}

          <div className="flex items-center space-x-2">
            {showSearch && (
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={onSearch}
                placeholder={searchPlaceholder}
              />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className={`px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                        column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      } ${column.width || 'min-w-[100px] sm:min-w-[120px]'}`}
                      onClick={() => column.sortable && handleSort(String(column.key))}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-xs truncate">{column.header}</span>
                        {column.sortable && sortKey === column.key && (
                          <span className="text-blue-600 text-xs flex-shrink-0">
                            {sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  {hasActions && (
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 sm:w-20 whitespace-nowrap">
                      <span className="hidden sm:inline">Actions</span>
                      <span className="sm:hidden">...</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <LoadingRow colSpan={colSpan} />
                ) : data.length === 0 ? (
                  <EmptyRow colSpan={colSpan} message={emptyMessage} />
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={String(column.key)} className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                          <div className="max-w-[100px] sm:max-w-[120px] md:max-w-none truncate">
                            {renderCell(column, row)}
                          </div>
                        </td>
                      ))}
                      {hasActions && (
                        <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm font-medium whitespace-nowrap">
                          <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
                            {availableActions.map(([type, action]) => (
                              <ActionButton
                                key={type}
                                action={action}
                                row={row}
                                type={type as keyof typeof ACTION_CONFIG}
                              />
                            ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-4 sm:px-6 py-3 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <PaginationInfo pagination={pagination} />
              {onLimitChange && (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Show:</span>
                  <PageSizeSelector value={pagination.limit} onChange={onLimitChange} />
                </div>
              )}
            </div>
            <PaginationControls pagination={pagination} onPageChange={onPageChange} />
          </div>
        </div>
      )}
    </div>
  );
} 