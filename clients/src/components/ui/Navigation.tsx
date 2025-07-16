'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logoutUser } from '@/store/slices/authSlice';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { 
  Bars3Icon, 
  XMarkIcon,
  TruckIcon,
  UserCircleIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

const Navigation = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { successToast } = useSweetAlert();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    dispatch(logoutUser());
    successToast('Logged out successfully');
    router.push('/login');
  };



  const getRoleBasedNavigation = () => {
    // Show public navigation for all users (logged in or not)
    return [
      { name: 'Home', href: '/', icon: HomeIcon },
      { name: 'Search Trucks', href: '/search', icon: MagnifyingGlassIcon },
      { name: 'About', href: '/about', icon: InformationCircleIcon },
      { name: 'Contact', href: '/contact', icon: PhoneIcon }
    ];
  };

  const getRoleBasedUserMenu = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'ADMIN':
        return [
          { name: 'Admin Dashboard', href: '/dashboard/admin' },
          { name: 'User Management', href: '/dashboard/admin/users' },
          { name: 'Driver Management', href: '/dashboard/admin/drivers' },
          { name: 'System Settings', href: '/dashboard/admin/settings' },
          { name: 'Profile', href: '/profile' },
          { name: 'Sign out', action: handleLogout, isAction: true }
        ];
      case 'DRIVER':
        return [
          { name: 'Driver Dashboard', href: '/dashboard/driver' },
          { name: 'My Bookings', href: '/dashboard/driver/bookings' },
          { name: 'Earnings', href: '/dashboard/driver/earnings' },
          { name: 'Profile', href: '/dashboard/driver/profile' },
          { name: 'Settings', href: '/dashboard/driver/settings' },
          { name: 'Sign out', action: handleLogout, isAction: true }
        ];
      case 'USER':
        return [
          { name: 'User Dashboard', href: '/dashboard/user' },
          { name: 'My Bookings', href: '/dashboard/user/bookings' },
          { name: 'Favorites', href: '/dashboard/user/favorites' },
          { name: 'Profile', href: '/dashboard/user/profile' },
          { name: 'Settings', href: '/dashboard/user/settings' },
          { name: 'Sign out', action: handleLogout, isAction: true }
        ];
      default:
        return [
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Profile', href: '/profile' },
          { name: 'Settings', href: '/settings' },
          { name: 'Sign out', action: handleLogout, isAction: true }
        ];
    }
  };

  const navigation = getRoleBasedNavigation();
  const userMenu = getRoleBasedUserMenu();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Don't render until auth state is determined to prevent hydration mismatch
  if (loading) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="ml-2 h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <TruckIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TruckBook</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <item.icon className="h-4 w-4 mr-1" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                    <UserCircleIcon className="h-5 w-5 mr-1" />
                    {user.name}
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'DRIVER' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {userMenu.map((item, index) => (
                      <div key={index}>
                        {item.isAction ? (
                          <button
                            onClick={item.action}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {item.name}
                          </button>
                                                 ) : (
                           <Link
                             href={item.href || '#'}
                             className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                               isActive(item.href || '') ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                             }`}
                           >
                             {item.name}
                           </Link>
                         )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/login')
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/register')
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
            
            {user && (
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-500">
                  {user.name} ({user.role})
                </div>
                {userMenu.map((item, index) => (
                  <div key={index}>
                    {item.isAction ? (
                      <button
                        onClick={() => {
                          item.action();
                          setIsMenuOpen(false);
                        }}
                        className="text-gray-700 hover:text-blue-600 block w-full text-left px-3 py-2 text-base font-medium transition-colors"
                      >
                        {item.name}
                      </button>
                    ) : (
                                             <Link
                         href={item.href || '#'}
                         className={`flex items-center px-3 py-2 text-base font-medium transition-colors ${
                           isActive(item.href || '')
                             ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                             : 'text-gray-700 hover:text-blue-600'
                         }`}
                         onClick={() => setIsMenuOpen(false)}
                       >
                         {item.name}
                       </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {!user && (
              <>
                <Link
                  href="/login"
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActive('/login')
                      ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive('/register')
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 