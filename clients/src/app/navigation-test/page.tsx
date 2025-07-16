'use client';

import { useAppSelector } from '@/hooks/redux';
import Link from 'next/link';

export default function NavigationTestPage() {
  const { user, loading } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧭 Navigation Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Navigation Behavior:</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Authentication Status:</h3>
              <p className="text-gray-600">
                {loading ? 'Loading...' : user ? `Logged in as ${user.name} (${user.role})` : 'Not logged in'}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Navigation Menu:</h3>
              {user ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-800 font-medium">✅ Public Menu + User Menu</p>
                  <p className="text-green-700 text-sm mt-1">
                    Since you're logged in, you should see both public navigation links 
                    (Home, Search Trucks, About, Contact) and the user menu dropdown with your name.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-blue-800 font-medium">✅ Public Menu + Auth Buttons</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Since you're not logged in, you should see public navigation links 
                    (Home, Search Trucks, About, Contact) and Sign in/Sign up buttons.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Navigation:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Public Pages (Always Accessible)</h3>
              <div className="space-y-2">
                <Link href="/" className="block text-blue-600 hover:text-blue-800">Home</Link>
                <Link href="/search" className="block text-blue-600 hover:text-blue-800">Search Trucks</Link>
                <Link href="/about" className="block text-blue-600 hover:text-blue-800">About</Link>
                <Link href="/contact" className="block text-blue-600 hover:text-blue-800">Contact</Link>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Dashboard Pages (Login Required)</h3>
              <div className="space-y-2">
                <Link href="/dashboard/user" className="block text-blue-600 hover:text-blue-800">User Dashboard</Link>
                <Link href="/dashboard/admin" className="block text-blue-600 hover:text-blue-800">Admin Dashboard</Link>
                <Link href="/dashboard/driver" className="block text-blue-600 hover:text-blue-800">Driver Dashboard</Link>
                <Link href="/test-dashboard" className="block text-blue-600 hover:text-blue-800">Test Dashboard</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expected Behavior:</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900">When NOT Logged In:</h3>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Navigation shows: Home, Search Trucks, About, Contact</li>
                <li>Right side shows: Sign in, Sign up buttons</li>
                <li>No user menu dropdown</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">When Logged In:</h3>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Navigation shows: Home, Search Trucks, About, Contact</li>
                <li>Right side shows: User menu dropdown with name and role</li>
                <li>User menu contains: Dashboard, Profile, Settings, Sign out</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">💡 How to Test:</h2>
          <ol className="list-decimal list-inside text-yellow-800 space-y-2">
            <li>Look at the navigation bar at the top of this page</li>
            <li>If you're not logged in, you should see public menu items + Sign in/Sign up</li>
            <li>If you're logged in, you should see public menu items + user menu dropdown</li>
            <li>Try logging in/out to see the navigation change</li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 