'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  HomeIcon, 
  TruckIcon, 
  CalendarIcon, 
  CogIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  CreditCardIcon,
  StarIcon,
  ArrowRightEndOnRectangleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { logoutUser } from '@/store/slices/authSlice';
import Image from 'next/image';
import NotificationDropdown from './NotificationDropdown';

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
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const { successToast } = useSweetAlert();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [openMenuItems, setOpenMenuItems] = useState<Set<string>>(new Set());

  const handleLogout = () => {
    dispatch(logoutUser());
    successToast('Signed out successfully');
    router.push('/login');
  };

  const getMenuItems = useCallback((): MenuItem[] => {
    // Admin-specific menu items
    if (user?.role === 'ADMIN') {
      return [
        {
          name: 'Dashboard',
          href: '/dashboard/admin',
          icon: HomeIcon
        },
        {
          name: 'User Management',
          href: '/dashboard/admin/users',
          icon: UserCircleIcon
        },
        {
          name: 'Driver Management',
          href: '/dashboard/admin/drivers',
          icon: TruckIcon
        },
        {
          name: 'Booking Management',
          href: '/dashboard/admin/bookings',
          icon: CalendarIcon
        },
        {
          name: 'Payment Management',
          href: '/dashboard/admin/payments',
          icon: CreditCardIcon
        },
        {
          name: 'Review Management',
          href: '/dashboard/admin/reviews',
          icon: StarIcon
        },
        {
          name: 'Analytics',
          href: '/dashboard/admin/analytics',
          icon: ChartBarIcon,
          children: [
            { name: 'Booking Analytics', href: '/dashboard/admin/analytics/bookings', icon: ChartBarIcon },
            { name: 'Revenue Reports', href: '/dashboard/admin/analytics/revenue', icon: CurrencyDollarIcon },
            { name: 'Driver Analytics', href: '/dashboard/admin/analytics/drivers', icon: TruckIcon }
          ]
        },
        {
          name: 'System Settings',
          href: '/dashboard/admin/settings',
          icon: CogIcon
        }
      ];
    }

    // Driver-specific menu items
    if (user?.role === 'DRIVER') {
      return [
        {
          name: 'Dashboard',
          href: '/dashboard/driver',
          icon: HomeIcon
        },
        {
          name: 'My Bookings',
          href: '/dashboard/driver/bookings',
          icon: CalendarIcon,
        },
        {
          name: 'Earnings',
          href: '/dashboard/driver/earnings',
          icon: CurrencyDollarIcon,
        },
        {
          name: 'Reviews',
          href: '/dashboard/driver/reviews',
          icon: StarIcon,
        },
        {
          name: 'Profile',
          href: '/dashboard/driver/profile',
          icon: UserCircleIcon,
        }
      ];
    }

    // Regular user menu items
    return [
      {
        name: 'Dashboard',
        href: '/dashboard/user',
        icon: HomeIcon
      },
      {
        name: 'My Bookings',
        href: '/dashboard/user/bookings',
        icon: CalendarIcon,
      },
      {
        name: 'Payments',
        href: '/dashboard/user/payments',
        icon: CreditCardIcon,
      },
      {
        name: 'Profile',
        href: '/dashboard/user/profile',
        icon: UserCircleIcon,
      },
    ];
  }, [user?.role]);

  const menuItems = useMemo(() => getMenuItems(), [getMenuItems]);

  useEffect(() => {
    const activeMenuItem = menuItems.find(item => 
      item.href === pathname || 
      item.children?.some(child => child.href === pathname)
    );

    if (activeMenuItem) {
      setOpenMenuItems(prev => {
        const newSet = new Set(prev);
        newSet.add(activeMenuItem.name);
        return newSet;
      });
    }
  }, [pathname, menuItems]);

  const isActiveMenuItem = (href: string): boolean => {
    if (!pathname) return false;
    if (href === pathname) return true;

    // For top-level dashboard entries, only exact match should be active
    const isTopDashboard = href === '/dashboard/user' || href === '/dashboard/admin' || href === '/dashboard/driver';
    if (isTopDashboard) return false;

    // Treat non-top-level items as active if the current path starts with their href (for nested routes)
    if (pathname.startsWith(href + '/')) return true;

    // For parent menu items with children, check if any child is active (supports nested)
    const menuItem = menuItems.find(item => item.href === href);
    if (menuItem?.children) {
      return menuItem.children.some(child => pathname === child.href || pathname.startsWith(child.href + '/'));
    }

    return false;
  };

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
    const isActive = isActiveMenuItem(item.href);
    
    return (
      <div key={item.name}>
        <Link
          href={item.href}
          className={`
            group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${level === 0 
              ? isActive 
                ? 'text-white bg-blue-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
              : isActive
                ? 'text-white bg-gray-700'
                : 'text-gray-400 hover:text-gray-300 pl-6'
            }
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
        </Link>
        {hasChildren && isOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Fixed Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 bg-gray-900">
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
        
        <div className="flex-1 overflow-hidden">
          <nav className="h-full px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => renderMenuItem(item))}
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Fixed Topbar */}
        <div className="flex-shrink-0 flex h-16 bg-white shadow z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <Link href="/" className="text-sm font-semibold text-blue-500 flex items-center">Visit Site <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" /></Link>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <NotificationDropdown 
                isOpen={notificationOpen}
                userRole={user?.role || 'USER'}
                onToggle={() => setNotificationOpen(!notificationOpen)}
                unreadCount={unreadCount}
              />
              
              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {user?.avatar ? (
                    <Image src={user.avatar} alt="User Avatar" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  )}
                  
                  <span className="ml-2 text-gray-700">{user?.name}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link href={user?.role === 'ADMIN' ? '/dashboard/admin/profile' : user?.role === 'DRIVER' ? '/dashboard/driver/profile' : '/dashboard/user/profile'} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <UserCircleIcon className="mr-3 h-4 w-4" />
                        Profile
                      </Link>
                      {user?.role === 'ADMIN' ? <>
                        <Link href='/dashboard/admin/settings' className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <CogIcon className="mr-3 h-4 w-4" />
                        Settings
                      </Link>
                      </> : user?.role === 'DRIVER' ? '' : ''}
                      
                      <button
                        onClick={handleLogout}
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

        {/* Scrollable Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>

        {/* Fixed Footer */}
        <footer className="flex-shrink-0 bg-white border-t border-gray-200">
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