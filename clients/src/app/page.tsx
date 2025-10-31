'use client';

import { useState } from 'react';
import { Truck, MapPin, Star, Shield, Clock, Award, Users, ArrowRight, CheckCircle, TrendingUp, Package } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Enhanced Design */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              {/* Logo Badge */}
              <div className="inline-flex items-center bg-blue-500/30 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Truck className="w-5 h-5 mr-2" />
                <span className="text-sm font-semibold">Bangladesh's #1 Truck Rental Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                TruckBook
                <span className="block text-blue-200 mt-2">Fast. Safe. Reliable.</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl">
                Connect with verified truck drivers instantly. Book trucks for any destination across Bangladesh with transparent pricing.
              </p>
              
              {/* Hero Search Bar */}
              <div className="mb-8">
                <div className="relative bg-white rounded-2xl shadow-2xl p-2">
                  <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search trucks... (e.g., Dhaka to Chittagong)"
                    className="w-full pl-14 pr-36 py-5 text-lg border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  />
                  <Button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-8 py-3 rounded-xl shadow-lg font-semibold"
                  >
                    Find Trucks
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  <span>Verified Drivers</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Right: Stats Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <TrendingUp className="w-10 h-10 mb-3 text-green-300" />
                <div className="text-4xl font-bold mb-1">10K+</div>
                <div className="text-blue-100">Happy Customers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <Users className="w-10 h-10 mb-3 text-blue-300" />
                <div className="text-4xl font-bold mb-1">5K+</div>
                <div className="text-blue-100">Verified Drivers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <Package className="w-10 h-10 mb-3 text-yellow-300" />
                <div className="text-4xl font-bold mb-1">50K+</div>
                <div className="text-blue-100">Successful Trips</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <Clock className="w-10 h-10 mb-3 text-purple-300" />
                <div className="text-4xl font-bold mb-1">24/7</div>
                <div className="text-blue-100">Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Why Choose TruckBook?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The most trusted and reliable platform for truck rentals in Bangladesh
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center group hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-500 cursor-pointer transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Drivers</h3>
              <p className="text-gray-600">All drivers are thoroughly verified with background checks and document validation</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center group hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-500 cursor-pointer transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Service</h3>
              <p className="text-gray-600">Book trucks anytime, anywhere. Our platform never sleeps</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center group hover:shadow-2xl transition-all border-2 border-transparent hover:border-yellow-500 cursor-pointer transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Best Prices</h3>
              <p className="text-gray-600">Competitive rates with transparent pricing. No hidden fees</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center group hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-500 cursor-pointer transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trusted Platform</h3>
              <p className="text-gray-600">Used by thousands of customers across Bangladesh</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-purple-100 rounded-full px-4 py-2 mb-4">
              <Star className="w-5 h-5 mr-2 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">Simple Process</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get your truck in 3 simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all border-2 border-blue-100">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Search & Compare</h3>
                <p className="text-gray-600 text-lg">Enter your location and requirements. Browse available trucks and compare prices.</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all border-2 border-green-100">
                <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Book & Pay</h3>
                <p className="text-gray-600 text-lg">Choose your preferred driver and book instantly. Secure payment through our platform.</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all border-2 border-purple-100">
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Track & Complete</h3>
                <p className="text-gray-600 text-lg">Track your shipment in real-time. Rate your experience after completion.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Truck Types Section with Enhanced Visuals */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-2 mb-4">
              <Truck className="w-5 h-5 mr-2 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Our Fleet</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Available Truck Types</h2>
            <p className="text-xl text-gray-600">Choose the perfect truck for your transportation needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Mini Truck */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 hover:shadow-2xl transition-all border-2 border-blue-200 hover:border-blue-500 cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mini Truck</h3>
                <div className="bg-blue-600 text-white rounded-full px-4 py-1 inline-block mb-4 text-sm font-semibold">
                  Up to 1 ton
                </div>
                <p className="text-gray-700 mb-4 font-medium">Perfect for small moves</p>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    Local deliveries
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    Small furniture
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    Quick transport
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Pickup */}
            <div className="group relative bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 hover:shadow-2xl transition-all border-2 border-green-200 hover:border-green-500 cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pickup</h3>
                <div className="bg-green-600 text-white rounded-full px-4 py-1 inline-block mb-4 text-sm font-semibold">
                  Up to 2 tons
                </div>
                <p className="text-gray-700 mb-4 font-medium">Ideal for medium loads</p>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Construction materials
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Appliances
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Office equipment
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Lorry */}
            <div className="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl p-8 hover:shadow-2xl transition-all border-2 border-yellow-200 hover:border-yellow-500 cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Lorry</h3>
                <div className="bg-yellow-600 text-white rounded-full px-4 py-1 inline-block mb-4 text-sm font-semibold">
                  Up to 5 tons
                </div>
                <p className="text-gray-700 mb-4 font-medium">Commercial transport</p>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-yellow-600" />
                    Bulk goods
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-yellow-600" />
                    Retail supplies
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-yellow-600" />
                    Long distance
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Heavy Truck */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 hover:shadow-2xl transition-all border-2 border-purple-200 hover:border-purple-500 cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Heavy Truck</h3>
                <div className="bg-purple-600 text-white rounded-full px-4 py-1 inline-block mb-4 text-sm font-semibold">
                  Up to 10+ tons
                </div>
                <p className="text-gray-700 mb-4 font-medium">Industrial strength</p>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
                    Heavy machinery
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
                    Industrial goods
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
                    Interstate cargo
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <Link href="/search">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                Browse All Trucks
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-b from-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-yellow-100 rounded-full px-4 py-2 mb-4">
              <Star className="w-5 h-5 mr-2 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-600">Testimonials</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Real reviews from satisfied customers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-l-4 border-blue-500">
              <div className="flex items-center mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg italic">
                &quot;Excellent service! Found a truck within minutes and the driver was very professional. Highly recommended!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">Ahmed Khan</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Dhaka
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-l-4 border-green-500">
              <div className="flex items-center mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg italic">
                &quot;Very reliable platform. The pricing is transparent and the drivers are verified. Will use again!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">Sarah Rahman</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Chittagong
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-l-4 border-purple-500">
              <div className="flex items-center mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg italic">
                &quot;Fast booking process and great customer support. The driver arrived on time and handled everything professionally.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">Mohammad Ali</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Sylhet
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-24 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
            Join thousands of customers who trust TruckBook for their transportation needs
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/search">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all font-semibold">
                Find Trucks Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all font-semibold">
                Sign Up Free
              </Button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap gap-8 justify-center text-sm">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              <span>100% Secure Platform</span>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-400" />
              <span>Award Winning Service</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-300" />
              <span>10,000+ Happy Customers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
