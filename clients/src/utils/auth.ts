// Authentication utility functions

// Cookie utilities
export const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Authentication storage utilities
export const setAuthData = (user: any, token: string) => {
  // Store in localStorage for client-side access
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Store in cookies for middleware access
  setCookie('authToken', token, 7);
  setCookie('userRole', user.role, 7);
};

export const getAuthData = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { user, token };
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  
  return null;
};

export const clearAuthData = () => {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Clear cookies
  deleteCookie('authToken');
  deleteCookie('userRole');
};

// Role-based access utilities
export const hasRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const getDashboardPath = (role: string): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'DRIVER':
      return '/driver';
    case 'USER':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

// Authentication check utilities
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getUserRole = (): string | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.role;
    } catch (error) {
      return null;
    }
  }
  return null;
}; 