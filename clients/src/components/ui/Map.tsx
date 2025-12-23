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
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);
  const LRef = useRef<typeof import('leaflet') | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize the map only once
  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        const L = (await import('leaflet')).default;
        LRef.current = L;

        // Fix default Leaflet marker paths
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (cancelled || !mapRef.current) return;

        const map = L.map(mapRef.current).setView([23.8103, 90.4125], 10);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Group for overlays (markers/routes) so we can clear safely later
        overlayGroupRef.current = L.layerGroup().addTo(map);

        // Ensure size is correct if container was hidden initially
        setTimeout(() => {
          if (!cancelled) map.invalidateSize();
        }, 0);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isClient]);

  // Update overlays (markers/route) when inputs change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    const group = overlayGroupRef.current;
    if (!isClient || !map || !L || !group) return;

    try {
      // Clear previous overlays safely
      group.clearLayers();

      const bounds: [number, number][] = [];

      if (typeof sourceLat === 'number' && typeof sourceLng === 'number') {
        const m = L.marker([sourceLat, sourceLng]).bindPopup('Pickup Location');
        group.addLayer(m);
        bounds.push([sourceLat, sourceLng]);
      }

      if (typeof destLat === 'number' && typeof destLng === 'number') {
        const m = L.marker([destLat, destLng]).bindPopup('Destination');
        group.addLayer(m);
        bounds.push([destLat, destLng]);
      }

      // Route
      if (
        typeof sourceLat === 'number' && typeof sourceLng === 'number' &&
        typeof destLat === 'number' && typeof destLng === 'number'
      ) {
        let coords: [number, number][] | null = null;
        if (routeGeometry) {
          try {
            const geometry = JSON.parse(routeGeometry);
            if (geometry?.type === 'LineString' && Array.isArray(geometry.coordinates)) {
              coords = geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            }
          } catch (e) {
            console.warn('Error parsing route geometry, falling back to straight line.', e);
          }
        }
        if (!coords) {
          coords = [
            [sourceLat, sourceLng],
            [destLat, destLng]
          ];
        }
        const route = L.polyline(coords, { color: 'blue', weight: 3, opacity: 0.7 });
        group.addLayer(route);
      }

      // Fit bounds after adding layers
      if (bounds.length > 0) {
        const Llocal = LRef.current;
        if (Llocal) {
          const llBounds = Llocal.latLngBounds(
            bounds.map(([lat, lng]) => Llocal.latLng(lat, lng))
          );
          map.fitBounds(llBounds, { padding: [20, 20] });
        }
      }
    } catch (err) {
      console.error('Error updating map overlays:', err);
    }

    // No cleanup here; we manage layers via the group
  }, [isClient, sourceLat, sourceLng, destLat, destLng, routeGeometry]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      try {
        if (overlayGroupRef.current) {
          overlayGroupRef.current.clearLayers();
          overlayGroupRef.current = null;
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        LRef.current = null;
      } catch (e) {
        // ignore cleanup errors
        console.warn('Error during map cleanup:', e);
      }
    };
  }, []);

  // Keep map sized correctly when container size/visibility changes (e.g., modals)
  useEffect(() => {
    if (!isClient || !mapRef.current) return;
    const el = mapRef.current;
    const ro = new ResizeObserver(() => {
      const map = mapInstanceRef.current;
      if (!map) return;
      // Defer to next frame to allow layout to settle
      requestAnimationFrame(() => {
        try {
          map.invalidateSize(false);
        } catch {
          // ignore
        }
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isClient]);

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