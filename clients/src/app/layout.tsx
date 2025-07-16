import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import ReduxProvider from '@/providers/ReduxProvider';
import LayoutWrapper from '@/components/layout/LayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TruckRental - Find Reliable Trucks for Your Cargo',
  description: 'Connect with verified drivers and reliable trucks for all your transportation needs. Fast, secure, and affordable shipping solutions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}
