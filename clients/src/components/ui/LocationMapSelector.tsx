'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import Button from './Button';

interface LocationMapSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  title: string;
  placeholder: string;
}

interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    district?: string;
    state?: string;
    country?: string;
  };
}

export default function LocationMapSelector({ 
  isOpen, 
  onClose, 
  onLocationSelect, 
  title, 
  placeholder 
}: LocationMapSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (isOpen && mapRef.current && !mapInstanceRef.current) {
      // Dynamically import Leaflet
      import('leaflet').then((L) => {
        // Import Leaflet CSS
        import('leaflet/dist/leaflet.css');

        // Create map centered on Bangladesh
        const map = L.map(mapRef.current!).setView([23.6850, 90.3563], 7);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Search locations using OpenStreetMap Nominatim
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1&countrycodes=bd`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      searchLocations(value);
    } else {
      setSearchResults([]);
    }
  };

  // Handle location selection
  const handleLocationSelect = (location: SearchResult) => {
    setSelectedLocation(location);
    setSearchQuery(location.display_name);
    setSearchResults([]);

    // Update map marker
    if (mapInstanceRef.current) {
      const L = require('leaflet');
      
      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      // Add new marker
      const marker = L.marker([parseFloat(location.lat), parseFloat(location.lon)])
        .addTo(mapInstanceRef.current)
        .bindPopup(location.display_name);

      markerRef.current = marker;

      // Center map on selected location
      mapInstanceRef.current.setView([parseFloat(location.lat), parseFloat(location.lon)], 12);
    }
  };

  // Handle map click
  const handleMapClick = async (e: any) => {
    if (mapInstanceRef.current) {
      const L = require('leaflet');
      const { lat, lng } = e.latlng;

      try {
        // Reverse geocode the clicked location
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          const location: SearchResult = {
            place_id: data.place_id,
            display_name: data.display_name,
            lat: data.lat,
            lon: data.lon,
            address: data.address || {}
          };

          setSelectedLocation(location);
          setSearchQuery(location.display_name);

          // Update marker
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
          }

          const marker = L.marker([lat, lng])
            .addTo(mapInstanceRef.current)
            .bindPopup(location.display_name);

          markerRef.current = marker;
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
    }
  };

  // Add map click listener
  useEffect(() => {
    if (mapInstanceRef.current) {
      const L = require('leaflet');
      mapInstanceRef.current.on('click', handleMapClick);
    }
  }, [mapInstanceRef.current]);

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedLocation) {
      const city = selectedLocation.address.city || 
                   selectedLocation.address.town || 
                   selectedLocation.address.district || 
                   'Unknown';
      const state = selectedLocation.address.state || 'Bangladesh';

      onLocationSelect({
        name: selectedLocation.display_name.split(',')[0] || 'Unknown',
        latitude: parseFloat(selectedLocation.lat),
        longitude: parseFloat(selectedLocation.lon),
        address: selectedLocation.display_name
      });

      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Search Panel */}
          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Results */}
            <div className="space-y-2">
              {isSearching && (
                <div className="text-center py-4 text-gray-500">
                  Searching...
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-1">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => handleLocationSelect(result)}
                      className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <div className="font-medium text-gray-900">
                        {result.display_name.split(',')[0]}
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.display_name.split(',').slice(1, 3).join(',')}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No locations found
                </div>
              )}

              {!isSearching && !searchQuery && (
                <div className="text-center py-4 text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Search for a location or click on the map</p>
                </div>
              )}
            </div>

            {/* Selected Location */}
            {selectedLocation && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-medium text-blue-900 mb-1">Selected Location:</h3>
                <p className="text-sm text-blue-800">{selectedLocation.display_name}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {parseFloat(selectedLocation.lat).toFixed(4)}, {parseFloat(selectedLocation.lon).toFixed(4)}
                </p>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="w-2/3">
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedLocation}
          >
            Select Location
          </Button>
        </div>
      </div>
    </div>
  );
} 