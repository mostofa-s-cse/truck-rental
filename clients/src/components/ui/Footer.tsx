import Link from 'next/link';
import { Truck, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Footer() {

  return (
    <div className="bg-gray-900 text-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <div className="lg:col-span-1">
          <div className="flex items-center mb-4">
            <Truck className="w-8 h-8 text-blue-400 mr-2" />
            <h3 className="text-2xl font-bold">Truck Lagbe</h3>
          </div>
          <p className="text-gray-400 mb-4 leading-relaxed">
            Bangladesh&apos;s #1 platform for truck rentals and logistics solutions. 
            Connecting customers with verified drivers across the country.
          </p>
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <span className="text-white font-semibold">F</span>
            </div>
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors">
              <span className="text-white font-semibold">T</span>
            </div>
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
              <span className="text-white font-semibold">I</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
          <ul className="space-y-3">
            <li><Link href="/search" className="text-gray-400 hover:text-white transition-colors">Find Trucks</Link></li>
            <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
            <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">Become a Driver</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Our Services</h4>
          <ul className="space-y-3">
            <li className="text-gray-400">Mini Truck Rental</li>
            <li className="text-gray-400">Pickup Services</li>
            <li className="text-gray-400">Lorry Transport</li>
            <li className="text-gray-400">Heavy Truck Rental</li>
            <li className="text-gray-400">Express Delivery</li>
            <li className="text-gray-400">Warehouse Services</li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Contact Info</h4>
          <div className="space-y-3">
            <div className="flex items-center text-gray-400">
              <Phone className="w-4 h-4 mr-3 text-blue-400" />
              <span>+880 1234-567890</span>
            </div>
            <div className="flex items-center text-gray-400">
              <MessageCircle className="w-4 h-4 mr-3 text-blue-400" />
              <span>support@trucklagbe.com</span>
            </div>
            <div className="flex items-center text-gray-400">
              <MapPin className="w-4 h-4 mr-3 text-blue-400" />
              <span>Dhaka, Bangladesh</span>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-500">Available 24/7</p>
              <p className="text-sm text-gray-500">Emergency Support</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-800 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; 2024 Truck Lagbe. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
} 