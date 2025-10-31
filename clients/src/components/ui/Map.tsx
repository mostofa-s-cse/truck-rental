'use client';

import { useEffect, useRef, useState } from 'react';

interface MapProps {
  sourceLat?: number;
  sourceLng?: number;
  destLat?: number;
  destLng?: number;
  routeGeometry?: string;
  className?: string;
}

export default function Map({ sourceLat, sourceLng, destLat, destLng, routeGeometry, className = "h-64 w-full" }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    const initMap = async () => {
      try {
        // Dynamically import Leaflet only on client side
        const L = (await import('leaflet')).default;
        // CSS is loaded via CDN in the HTML head

        // Fix default Leaflet marker paths
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Initialize map
        const map = L.map(mapRef.current!).setView([23.8103, 90.4125], 10); // Default to Dhaka
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Clear existing markers and routes
        map.eachLayer((layer: L.Layer) => {
          if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer);
          }
        });

        const markers: L.Marker[] = [];
        const bounds: L.LatLng[] = [];

        // Add source marker
        if (sourceLat && sourceLng) {
          const sourceMarker = L.marker([sourceLat, sourceLng])
            .addTo(map)
            .bindPopup('Pickup Location');
          markers.push(sourceMarker);
          bounds.push(L.latLng(sourceLat, sourceLng));
        }

        // Add destination marker
        if (destLat && destLng) {
          const destMarker = L.marker([destLat, destLng])
            .addTo(map)
            .bindPopup('Destination');
          markers.push(destMarker);
          bounds.push(L.latLng(destLat, destLng));
        }

        // Fit map to show all markers
        if (bounds.length > 0) {
          const boundsArray = bounds.map(latlng => [latlng.lat, latlng.lng] as [number, number]);
          map.fitBounds(boundsArray, { padding: [20, 20] });
        }

        // Draw route using geometry if available, otherwise simple line
        if (sourceLat && sourceLng && destLat && destLng) {
          if (routeGeometry) {
            try {
              const geometry = JSON.parse(routeGeometry);
              if (geometry.type === 'LineString' && geometry.coordinates) {
                const routeCoords = geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const routeLine = L.polyline(routeCoords, {
                  color: 'blue',
                  weight: 3,
                  opacity: 0.7
                }).addTo(map);
              }
            } catch (error) {
              console.warn('Error parsing route geometry, using simple line:', error);
              // Fallback to simple line
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const routeLine = L.polyline([
                [sourceLat, sourceLng],
                [destLat, destLng]
              ], {
                color: 'blue',
                weight: 3,
                opacity: 0.7
              }).addTo(map);
            }
          } else {
            // Simple straight line
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const routeLine = L.polyline([
              [sourceLat, sourceLng],
              [destLat, destLng]
            ], {
              color: 'blue',
              weight: 3,
              opacity: 0.7
            }).addTo(map);
          }
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, sourceLat, sourceLng, destLat, destLng, routeGeometry]);

  if (!isClient) {
    return (
      <div 
        className={`${className} bg-gray-100 flex items-center justify-center border border-gray-300 rounded-lg`}
        style={{ zIndex: 1 }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={className}
      style={{ zIndex: 1 }}
    />
  );
} 