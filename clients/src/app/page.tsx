'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Truck, MapPin, Star, Users, Shield, Clock, Phone, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: <Truck className="w-8 h-8 text-blue-600" />,
      title: 'Wide Range of Trucks',
      description: 'From mini trucks to heavy lorries, find the perfect vehicle for your needs.'
    },
    {
      icon: <MapPin className="w-8 h-8 text-green-600" />,
      title: 'Real-time Tracking',
      description: 'Track your shipment in real-time with our advanced GPS tracking system.'
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      title: 'Verified Drivers',
      description: 'All our drivers are verified and rated by customers for your safety.'
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: 'Secure Payments',
      description: 'Safe and secure payment options with multiple payment methods.'
    },
    {
      icon: <Clock className="w-8 h-8 text-red-600" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you anytime, anywhere.'
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: 'Trusted by Thousands',
      description: 'Join thousands of satisfied customers who trust us for their transportation needs.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Customers' },
    { number: '500+', label: 'Verified Drivers' },
    { number: '50+', label: 'Cities Covered' },
    { number: '99%', label: 'Satisfaction Rate' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find the Perfect Truck
              <span className="block text-blue-200">for Your Cargo</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect with verified drivers and reliable trucks for all your transportation needs. 
              Fast, secure, and affordable shipping solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link href="/search">
                    <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                      Find Trucks
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold">
                      Join as Driver
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/search">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                    Find Trucks
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the most reliable and efficient truck rental service with advanced features 
              to make your shipping experience seamless.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your cargo delivered in just a few simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Search & Book
              </h3>
              <p className="text-gray-600">
                Search for available trucks in your area and book the one that fits your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Track & Monitor
              </h3>
              <p className="text-gray-600">
                Track your shipment in real-time and stay updated on delivery progress.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Safe Delivery
              </h3>
              <p className="text-gray-600">
                Your cargo is safely delivered and you can rate the driver&apos;s service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Ship Your Cargo?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust us for their transportation needs. 
            Start your journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Find Trucks Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold">
                Contact Us
                <Phone className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
