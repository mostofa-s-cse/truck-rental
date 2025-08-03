'use client';

import { useState, useMemo, useCallback } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
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
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showAddButton?: boolean;
  addButtonText?: string;
  onAdd?: () => void;
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="relative flex">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSearch) {
            onSearch(value);
          }
        }}
        className="pl-10 pr-20 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
      />
      {onSearch && (
        <button
          onClick={() => onSearch(value)}
          className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
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
  
  return (
    <button
      onClick={() => action(row)}
      className={config.color}
      title={config.title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};

const LoadingRow = ({ colSpan }: { colSpan: number }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-12 text-center">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    </td>
  </tr>
);

const EmptyRow = ({ colSpan, message }: { colSpan: number; message: string }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-12 text-center">
      <div className="text-gray-500">
        <div className="text-lg font-medium mb-2">{message}</div>
        <p className="text-sm">No data available to display</p>
      </div>
    </td>
  </tr>
);

const PaginationInfo = ({ pagination }: { pagination: NonNullable<DataTableProps<unknown>['pagination']> }) => (
  <span className="text-sm text-gray-700">
    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
    {pagination.total} results
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
    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
}) => (
  <div className="flex items-center space-x-2">
    <button
      onClick={() => onPageChange?.(pagination.page - 1)}
      disabled={pagination.page <= 1}
      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-900 bg-white"
    >
      <ChevronLeftIcon className="h-4 w-4" />
    </button>
    <span className="text-sm text-gray-700">
      Page {pagination.page} of {pagination.totalPages}
    </span>
    <button
      onClick={() => onPageChange?.(pagination.page + 1)}
      disabled={pagination.page >= pagination.totalPages}
      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-900 bg-white"
    >
      <ChevronRightIcon className="h-4 w-4" />
    </button>
  </div>
);

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
  searchPlaceholder = 'Search...',
  showSearch = true,
  showFilters = false,
  showAddButton = false,
  addButtonText = 'Add New',
  onAdd,
  actions,
  emptyMessage = 'No data found',
  className = '',
  initialSearchQuery = ''
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showSearch && (
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={onSearch}
                placeholder={searchPlaceholder}
              />
            )}
            {showFilters && (
              <Button variant="outline" size="sm">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </Button>
            )}
          </div>
          {showAddButton && onAdd && (
            <Button onClick={onAdd} size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.width || ''}`}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && sortKey === column.key && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {hasActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                    <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCell(column, row)}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
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

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <PaginationInfo pagination={pagination} />
              {onLimitChange && (
                <PageSizeSelector value={pagination.limit} onChange={onLimitChange} />
              )}
            </div>
            <PaginationControls pagination={pagination} onPageChange={onPageChange} />
          </div>
        </div>
      )}
    </div>
  );
} 