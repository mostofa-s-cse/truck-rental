'use client';

import { Users, Target, Globe, Heart, Shield, Zap, Truck, Award, Clock, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function AboutPage() {
  const values = [
    {
      icon: <Shield className="w-10 h-10 text-white" />,
      title: 'Safety First',
      description: 'We prioritize the safety of our drivers, customers, and cargo above everything else.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Heart className="w-10 h-10 text-white" />,
      title: 'Customer Focus',
      description: 'Our customers are at the heart of everything we do. We strive to exceed expectations.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: <Zap className="w-10 h-10 text-white" />,
      title: 'Innovation',
      description: 'We continuously innovate to provide the best technology and service experience.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: <Globe className="w-10 h-10 text-white" />,
      title: 'Sustainability',
      description: 'We\'re committed to reducing our environmental impact through efficient operations.',
      color: 'from-green-500 to-green-600'
    }
  ];

  const team = [
    {
      name: 'Ahmed Hossain',
      role: 'CEO & Founder',
      bio: 'Visionary leader with 15+ years in logistics and technology.',
      initial: 'A',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Fatima Rahman',
      role: 'Chief Technology Officer',
      bio: 'Tech expert building scalable platforms for Bangladesh.',
      initial: 'F',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Karim Khan',
      role: 'Head of Operations',
      bio: 'Operations specialist focused on driver excellence.',
      initial: 'K',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Nadia Islam',
      role: 'Customer Success Lead',
      bio: 'Dedicated to ensuring customer satisfaction.',
      initial: 'N',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-700"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center bg-blue-500/30 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <Truck className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">About TruckBook</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Transforming Transportation
              <span className="block text-blue-200 mt-2">Across Bangladesh</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Connecting reliable drivers with customers who need transportation solutions. 
              We're building the future of logistics, one delivery at a time.
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-10 rounded-3xl shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <Target className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold ml-4">
                  Our Mission
                </h2>
              </div>
              <p className="text-lg text-blue-50 mb-6 leading-relaxed">
                To revolutionize the truck rental industry by creating a seamless, transparent, 
                and efficient platform that connects verified drivers with customers who need 
                reliable transportation solutions.
              </p>
              <p className="text-lg text-blue-50 leading-relaxed">
                We believe that every delivery matters, and we're committed to making the 
                process as smooth and reliable as possible for both drivers and customers.
              </p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-xl border-2 border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4">
                  <Globe className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 ml-4">Our Vision</h3>
              </div>
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                To become Bangladesh's leading platform for truck rentals, setting industry standards 
                for safety, reliability, and customer satisfaction.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  <span className="text-gray-700 font-medium">National reach with local expertise</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Technology-driven solutions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Sustainable transportation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Community-driven growth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-2 mb-4">
              <Heart className="w-5 h-5 mr-2 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Our Core Values</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What We Stand For
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-transparent overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                  <div className={`bg-gradient-to-br ${value.color} rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-purple-100 rounded-full px-4 py-2 mb-4">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">Our Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet the Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate people behind TruckBook
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-blue-500">
                <div className={`h-48 bg-gradient-to-br ${member.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative text-white text-6xl font-bold">
                    {member.initial}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-semibold mb-3 text-sm">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">Our Impact</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Numbers That Matter
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Making a difference in Bangladesh's transportation industry
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-5xl md:text-6xl font-bold mb-3">10K+</div>
              <div className="text-blue-100 text-lg">Happy Customers</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-5xl md:text-6xl font-bold mb-3">5K+</div>
              <div className="text-blue-100 text-lg">Verified Drivers</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-5xl md:text-6xl font-bold mb-3">50+</div>
              <div className="text-blue-100 text-lg">Cities Served</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-5xl md:text-6xl font-bold mb-3">99%</div>
              <div className="text-blue-100 text-lg">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We're Different */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-green-100 rounded-full px-4 py-2 mb-4">
                <Award className="w-5 h-5 mr-2 text-green-600" />
                <span className="text-sm font-semibold text-green-600">What Makes Us Different</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Built for Bangladesh
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Unlike generic platforms, TruckBook is designed specifically for the unique 
                needs of Bangladesh's transportation industry. We understand local routes, 
                pricing dynamics, and customer expectations.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Local Expertise</h4>
                    <p className="text-gray-600">Deep understanding of Bangladesh's transportation landscape</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Verified Network</h4>
                    <p className="text-gray-600">Every driver undergoes rigorous verification processes</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Fair Pricing</h4>
                    <p className="text-gray-600">Transparent rates in Taka (৳) with no hidden charges</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-8 rounded-2xl text-center">
                <Truck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-blue-900 mb-2">4+</div>
                <div className="text-blue-700 font-medium">Truck Types</div>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-8 rounded-2xl text-center">
                <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-green-900 mb-2">24/7</div>
                <div className="text-green-700 font-medium">Availability</div>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-8 rounded-2xl text-center">
                <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-purple-900 mb-2">100%</div>
                <div className="text-purple-700 font-medium">Verified</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-8 rounded-2xl text-center">
                <Award className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-yellow-900 mb-2">Top</div>
                <div className="text-yellow-700 font-medium">Rated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Transportation?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Whether you're a driver looking to grow your business or a customer in need of 
              reliable transportation, we're here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all">
                  Become a Driver
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all">
                  Find Trucks
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
