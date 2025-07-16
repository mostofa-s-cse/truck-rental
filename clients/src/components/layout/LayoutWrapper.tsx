'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import Notification from '@/components/ui/Notification';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Check if current path is a dashboard route
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  // Check if current path is a landing page (public pages)
  const isLandingPage = ['/', '/login', '/register', '/about', '/contact', '/search'].includes(pathname) || 
                       pathname.startsWith('/sweetalert');

  // For dashboard routes, don't wrap with Navigation/Footer
  if (isDashboardRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
        <Notification />
      </div>
    );
  }

  // For landing pages, show Navigation and Footer
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Notification />
    </div>
  );
} 