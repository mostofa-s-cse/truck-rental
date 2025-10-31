import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - TruckRental',
  description: 'Manage your truck rental dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 