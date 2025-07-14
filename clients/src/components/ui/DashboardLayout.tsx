'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  HomeIcon, 
  UsersIcon, 
  TruckIcon, 
  CalendarIcon, 
  ChartBarIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MapIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ClipboardIcon,
  StarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  ChartPieIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowRightEndOnRectangleIcon
} from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: MenuItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title = "Dashboard",
  subtitle 
}) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openMenuItems, setOpenMenuItems] = useState<Set<string>>(new Set());

  const getMenuItems = (): MenuItem[] => {
    if (!user) return [];

    switch (user.role) {
      case 'ADMIN':
        return [
          {
            name: 'Overview',
            href: '/admin',
            icon: HomeIcon
          },
          {
            name: 'User Management',
            href: '/admin/users',
            icon: UsersIcon,
            children: [
              { name: 'All Users', href: '/admin/users', icon: UsersIcon },
              { name: 'Drivers', href: '/admin/drivers', icon: TruckIcon },
              { name: 'Customers', href: '/admin/customers', icon: UserCircleIcon }
            ]
          },
          {
            name: 'Truck Management',
            href: '/admin/trucks',
            icon: TruckIcon,
            children: [
              { name: 'All Trucks', href: '/admin/trucks', icon: TruckIcon },
              { name: 'Categories', href: '/admin/truck-categories', icon: BuildingOfficeIcon },
              { name: 'Add Truck', href: '/admin/trucks/add', icon: PlusIcon }
            ]
          },
          {
            name: 'Bookings',
            href: '/admin/bookings',
            icon: CalendarIcon,
            children: [
              { name: 'All Bookings', href: '/admin/bookings', icon: ClipboardIcon },
              { name: 'Pending', href: '/admin/bookings/pending', icon: ClockIcon },
              { name: 'Completed', href: '/admin/bookings/completed', icon: CheckCircleIcon },
              { name: 'Cancelled', href: '/admin/bookings/cancelled', icon: XCircleIcon }
            ]
          },
          {
            name: 'Payments',
            href: '/admin/payments',
            icon: CreditCardIcon,
            children: [
              { name: 'All Payments', href: '/admin/payments', icon: CreditCardIcon },
              { name: 'Pending', href: '/admin/payments/pending', icon: ClockIcon },
              { name: 'Completed', href: '/admin/payments/completed', icon: CheckCircleIcon },
              { name: 'Refunds', href: '/admin/payments/refunds', icon: CurrencyDollarIcon }
            ]
          },
          {
            name: 'Reviews',
            href: '/admin/reviews',
            icon: StarIcon
          },
          {
            name: 'Reports',
            href: '/admin/reports',
            icon: ChartBarIcon,
            children: [
              { name: 'Analytics', href: '/admin/reports/analytics', icon: ChartPieIcon },
              { name: 'Earnings', href: '/admin/reports/earnings', icon: CurrencyDollarIcon },
              { name: 'Bookings', href: '/admin/reports/bookings', icon: CalendarIcon },
              { name: 'Users', href: '/admin/reports/users', icon: UserGroupIcon }
            ]
          },
          {
            name: 'System',
            href: '/admin/system',
            icon: CogIcon,
            children: [
              { name: 'Settings', href: '/admin/system/settings', icon: Cog6ToothIcon },
              { name: 'Areas', href: '/admin/system/areas', icon: MapIcon },
              { name: 'Logs', href: '/admin/system/logs', icon: DocumentTextIcon },
              { name: 'Backups', href: '/admin/system/backups', icon: DocumentDuplicateIcon }
            ]
          }
        ];

      case 'DRIVER':
        return [
          {
            name: 'Dashboard',
            href: '/driver',
            icon: HomeIcon
          },
          {
            name: 'Profile',
            href: '/driver/profile',
            icon: UserCircleIcon,
            children: [
              { name: 'Personal Info', href: '/driver/profile', icon: UserCircleIcon },
              { name: 'Documents', href: '/driver/documents', icon: DocumentTextIcon },
              { name: 'Settings', href: '/driver/settings', icon: CogIcon }
            ]
          },
          {
            name: 'Truck',
            href: '/driver/truck',
            icon: TruckIcon,
            children: [
              { name: 'My Truck', href: '/driver/truck', icon: TruckIcon },
              { name: 'Maintenance', href: '/driver/maintenance', icon: WrenchScrewdriverIcon },
              { name: 'Documents', href: '/driver/truck-documents', icon: DocumentTextIcon }
            ]
          },
          {
            name: 'Bookings',
            href: '/driver/bookings',
            icon: CalendarIcon,
            children: [
              { name: 'Active', href: '/driver/bookings/active', icon: ClockIcon },
              { name: 'Pending', href: '/driver/bookings/pending', icon: InformationCircleIcon },
              { name: 'Completed', href: '/driver/bookings/completed', icon: CheckCircleIcon },
              { name: 'History', href: '/driver/bookings/history', icon: ClipboardDocumentListIcon }
            ]
          },
          {
            name: 'Earnings',
            href: '/driver/earnings',
            icon: CurrencyDollarIcon,
            children: [
              { name: 'Overview', href: '/driver/earnings', icon: ChartBarIcon },
              { name: 'Transactions', href: '/driver/earnings/transactions', icon: CreditCardIcon },
              { name: 'Withdrawals', href: '/driver/earnings/withdrawals', icon: CurrencyDollarIcon },
              { name: 'Tax Documents', href: '/driver/earnings/tax', icon: DocumentTextIcon }
            ]
          },
          {
            name: 'Location',
            href: '/driver/location',
            icon: MapIcon,
            children: [
              { name: 'Live Tracking', href: '/driver/location/tracking', icon: MapPinIcon },
              { name: 'Service Areas', href: '/driver/location/areas', icon: MapIcon },
              { name: 'Availability', href: '/driver/location/availability', icon: ClockIcon }
            ]
          },
          {
            name: 'Support',
            href: '/driver/support',
            icon: PhoneIcon,
            children: [
              { name: 'Help Center', href: '/driver/support/help', icon: InformationCircleIcon },
              { name: 'Contact Support', href: '/driver/support/contact', icon: PhoneIcon },
              { name: 'Emergency', href: '/driver/support/emergency', icon: ExclamationTriangleIcon }
            ]
          }
        ];

      case 'USER':
        return [
          {
            name: 'Dashboard',
            href: '/dashboard',
            icon: HomeIcon
          },
          {
            name: 'Search Trucks',
            href: '/search',
            icon: TruckIcon
          },
          {
            name: 'My Bookings',
            href: '/dashboard/bookings',
            icon: CalendarIcon,
            children: [
              { name: 'Active', href: '/dashboard/bookings/active', icon: ClockIcon },
              { name: 'Upcoming', href: '/dashboard/bookings/upcoming', icon: CalendarIcon },
              { name: 'Completed', href: '/dashboard/bookings/completed', icon: CheckCircleIcon },
              { name: 'Cancelled', href: '/dashboard/bookings/cancelled', icon: XCircleIcon }
            ]
          },
          {
            name: 'Favorites',
            href: '/dashboard/favorites',
            icon: StarIcon
          },
          {
            name: 'Payments',
            href: '/dashboard/payments',
            icon: CreditCardIcon,
            children: [
              { name: 'Payment Methods', href: '/dashboard/payments/methods', icon: CreditCardIcon },
              { name: 'Transaction History', href: '/dashboard/payments/history', icon: ClipboardIcon },
              { name: 'Invoices', href: '/dashboard/payments/invoices', icon: DocumentTextIcon }
            ]
          },
          {
            name: 'Profile',
            href: '/dashboard/profile',
            icon: UserCircleIcon,
            children: [
              { name: 'Personal Info', href: '/dashboard/profile', icon: UserCircleIcon },
              { name: 'Addresses', href: '/dashboard/profile/addresses', icon: MapPinIcon },
              { name: 'Preferences', href: '/dashboard/profile/preferences', icon: CogIcon }
            ]
          },
          {
            name: 'Support',
            href: '/dashboard/support',
            icon: PhoneIcon,
            children: [
              { name: 'Help Center', href: '/dashboard/support/help', icon: InformationCircleIcon },
              { name: 'Contact Support', href: '/dashboard/support/contact', icon: PhoneIcon },
              { name: 'FAQ', href: '/dashboard/support/faq', icon: InformationCircleIcon }
            ]
          }
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const toggleMenuItem = (itemName: string) => {
    setOpenMenuItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenuItems.has(item.name);
    
    return (
      <div key={item.name}>
        <a
          href={item.href}
          className={`
            group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${level === 0 ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-300 pl-6'}
            ${hasChildren ? 'cursor-pointer' : ''}
          `}
          onClick={hasChildren ? (e) => { e.preventDefault(); toggleMenuItem(item.name); } : undefined}
        >
          <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
          <span className="flex-1">{item.name}</span>
          {item.badge && (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDownIcon className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </a>
        {hasChildren && isOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-white">TruckBook</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => renderMenuItem(item))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Topbar */}
        <div className="sticky top-0 z-40 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              {subtitle && (
                <span className="ml-4 text-sm text-gray-500">{subtitle}</span>
              )}
            </div>
            
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <BellIcon className="h-6 w-6" />
              </button>
              
              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <span className="ml-2 text-gray-700">{user?.name || 'User'}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <UserCircleIcon className="mr-3 h-4 w-4" />
                        Profile
                      </a>
                      <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <CogIcon className="mr-3 h-4 w-4" />
                        Settings
                      </a>
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowRightEndOnRectangleIcon className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                © 2024 TruckBook. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                  Terms of Service
                </a>
                <a href="/support" className="text-sm text-gray-500 hover:text-gray-700">
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// ChevronDown icon component
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default DashboardLayout;