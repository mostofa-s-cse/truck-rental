import { User } from '@/types';

export const getDashboardRoute = (user: User | null): string => {
  if (!user) return '/login';
  
  switch (user.role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'DRIVER':
      return '/dashboard/driver';
    case 'USER':
      return '/dashboard/user';
    default:
      return '/dashboard';
  }
};

export const getRoleBasedRoutes = (user: User | null) => {
  if (!user) {
    return {
      navigation: [
        { name: 'Home', href: '/' },
        { name: 'Search Trucks', href: '/search' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' }
      ],
      userMenu: []
    };
  }
  
  switch (user.role) {
    case 'ADMIN':
      return {
        navigation: [
          { name: 'Dashboard', href: '/dashboard/admin' },
          { name: 'Users', href: '/dashboard/admin/users' },
          { name: 'Drivers', href: '/dashboard/admin/drivers' },
          { name: 'Bookings', href: '/dashboard/admin/bookings' },
          { name: 'Reports', href: '/dashboard/admin/reports' }
        ],
        userMenu: [
          { name: 'Admin Dashboard', href: '/dashboard/admin' },
          { name: 'User Management', href: '/dashboard/admin/users' },
          { name: 'Driver Management', href: '/dashboard/admin/drivers' },
          { name: 'System Settings', href: '/dashboard/admin/settings' },
          { name: 'Profile', href: '/profile' }
        ]
      };
      
    case 'DRIVER':
      return {
        navigation: [
          { name: 'Dashboard', href: '/dashboard/driver' },
          { name: 'Bookings', href: '/dashboard/driver/bookings' },
          { name: 'Earnings', href: '/dashboard/driver/earnings' },
          { name: 'Profile', href: '/dashboard/driver/profile' }
        ],
        userMenu: [
          { name: 'Driver Dashboard', href: '/dashboard/driver' },
          { name: 'My Bookings', href: '/dashboard/driver/bookings' },
          { name: 'Earnings', href: '/dashboard/driver/earnings' },
          { name: 'Profile', href: '/dashboard/driver/profile' },
          { name: 'Settings', href: '/dashboard/driver/settings' }
        ]
      };
      
    case 'USER':
      return {
        navigation: [
          { name: 'Dashboard', href: '/dashboard/user' },
          { name: 'Search', href: '/search' },
          { name: 'Bookings', href: '/dashboard/user/bookings' },
          { name: 'Profile', href: '/dashboard/user/profile' }
        ],
        userMenu: [
          { name: 'User Dashboard', href: '/dashboard/user' },
          { name: 'My Bookings', href: '/dashboard/user/bookings' },
          { name: 'Favorites', href: '/dashboard/user/favorites' },
          { name: 'Profile', href: '/dashboard/user/profile' },
          { name: 'Settings', href: '/dashboard/user/settings' }
        ]
      };
      
    default:
      return {
        navigation: [
          { name: 'Home', href: '/' },
          { name: 'Search Trucks', href: '/search' },
          { name: 'About', href: '/about' },
          { name: 'Contact', href: '/contact' }
        ],
        userMenu: [
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Profile', href: '/profile' },
          { name: 'Settings', href: '/settings' }
        ]
      };
  }
};

export const canAccessRoute = (user: User | null, route: string): boolean => {
  if (!user) return false;
  
  // Admin routes
  if (route.startsWith('/dashboard/admin')) {
    return user.role === 'ADMIN';
  }
  
  // Driver routes
  if (route.startsWith('/dashboard/driver')) {
    return user.role === 'DRIVER';
  }
  
  // User routes
  if (route.startsWith('/dashboard/user')) {
    return user.role === 'USER';
  }
  
  // General dashboard route
  if (route.startsWith('/dashboard')) {
    return true;
  }
  
  return true;
};

export const getRedirectUrl = (user: User | null, currentPath: string): string => {
  // If user is not authenticated, redirect to login
  if (!user) {
    return `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
  
  // If user is accessing a route they can't access, redirect to their dashboard
  if (!canAccessRoute(user, currentPath)) {
    return getDashboardRoute(user);
  }
  
  // If user is accessing login/register while authenticated, redirect to their dashboard
  if (currentPath === '/login' || currentPath === '/register') {
    return getDashboardRoute(user);
  }
  
  return currentPath;
}; 