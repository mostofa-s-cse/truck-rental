# Map Component Documentation

## Overview

The `Map` component is a React wrapper around Leaflet.js that provides an interactive map for displaying locations and routes. It uses OpenStreetMap tiles and supports both simple marker display and complex route visualization.

## Features

- 🗺️ **Interactive Map**: Pan, zoom, and interact with the map
- 📍 **Location Markers**: Display pickup and destination points
- 🛣️ **Route Visualization**: Show actual route paths using GeoJSON geometry
- 🎨 **Customizable Styling**: Flexible CSS classes for different layouts
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Fallback Support**: Graceful degradation if route geometry fails

## Installation

The Map component requires Leaflet.js dependencies:

```bash
npm install leaflet react-leaflet @types/leaflet
```

## Basic Usage

### Simple Map with Markers

```tsx
import Map from '@/components/ui/Map';

function MyComponent() {
  return (
    <Map
      sourceLat={23.7937}
      sourceLng={90.4066}
      destLat={23.8700}
      destLng={90.3700}
      className="h-64 w-full"
    />
  );
}
```

### Map with Route Geometry

```tsx
import Map from '@/components/ui/Map';

function MyComponent() {
  const routeGeometry = JSON.stringify({
    type: 'LineString',
    coordinates: [
      [90.4066, 23.7937], // Source
      [90.3700, 23.8700]  // Destination
    ]
  });

  return (
    <Map
      sourceLat={23.7937}
      sourceLng={90.4066}
      destLat={23.8700}
      destLng={90.3700}
      routeGeometry={routeGeometry}
      className="h-96 w-full rounded-lg"
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sourceLat` | `number` | No | Latitude of pickup location |
| `sourceLng` | `number` | No | Longitude of pickup location |
| `destLat` | `number` | No | Latitude of destination |
| `destLng` | `number` | No | Longitude of destination |
| `routeGeometry` | `string` | No | GeoJSON string for route path |
| `className` | `string` | No | CSS classes for styling (default: "h-64 w-full") |

## Route Geometry Format

The `routeGeometry` prop expects a GeoJSON LineString string:

```json
{
  "type": "LineString",
  "coordinates": [
    [longitude1, latitude1],
    [longitude2, latitude2],
    [longitude3, latitude3]
  ]
}
```

## Styling Examples

### Compact Map
```tsx
<Map
  sourceLat={23.7937}
  sourceLng={90.4066}
  destLat={23.8700}
  destLng={90.3700}
  className="h-48 w-full rounded-lg border"
/>
```

### Large Map
```tsx
<Map
  sourceLat={23.7937}
  sourceLng={90.4066}
  destLat={23.8700}
  destLng={90.3700}
  className="h-96 w-full rounded-xl shadow-lg"
/>
```

### Responsive Map
```tsx
<Map
  sourceLat={23.7937}
  sourceLng={90.4066}
  destLat={23.8700}
  destLng={90.3700}
  className="h-64 md:h-96 w-full rounded-lg"
/>
```

## Integration with BookingModal

The Map component is integrated into the BookingModal to show route previews:

```tsx
// In BookingModal.tsx
{selectedSourceArea && selectedDestinationArea && (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-700 mb-2">Route Preview</h4>
    <Map
      sourceLat={selectedSourceArea.latitude}
      sourceLng={selectedSourceArea.longitude}
      destLat={selectedDestinationArea.latitude}
      destLng={selectedDestinationArea.longitude}
      routeGeometry={routeDetails?.routeGeometry}
      className="h-48 w-full rounded-md"
    />
    {routeDetails && (
      <div className="mt-2 text-sm text-gray-600">
        <p>Distance: {routeDetails.distance.toFixed(1)} km</p>
        <p>Estimated Time: {Math.round(routeDetails.duration)} minutes</p>
      </div>
    )}
  </div>
)}
```

## API Integration

The Map component works with the fare calculation API to get route details:

```tsx
// Fetch route details from API
const response = await apiClient.getRouteDetails(source, destination);
if (response.success && response.data) {
  setRouteDetails(response.data);
}

// Use in Map component
<Map
  sourceLat={source.latitude}
  sourceLng={source.longitude}
  destLat={destination.latitude}
  destLng={destination.longitude}
  routeGeometry={routeDetails?.routeGeometry}
/>
```

## Customization

### Custom Markers
The component uses default Leaflet markers. To customize:

```tsx
// In Map.tsx, you can modify the marker creation:
const sourceMarker = L.marker([sourceLat, sourceLng], {
  icon: L.icon({
    iconUrl: '/custom-marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })
}).addTo(map);
```

### Custom Route Styling
Modify the route line appearance:

```tsx
// In Map.tsx, change the polyline options:
const routeLine = L.polyline(routeCoords, {
  color: '#3B82F6', // Custom color
  weight: 4,        // Thicker line
  opacity: 0.8,     // More opaque
  dashArray: '10, 5' // Dashed line
}).addTo(map);
```

## Error Handling

The component includes fallback mechanisms:

1. **Route Geometry Parsing**: If GeoJSON parsing fails, falls back to simple straight line
2. **Missing Coordinates**: Map still renders even if some coordinates are missing
3. **API Failures**: Gracefully handles API errors and shows basic map

## Performance Considerations

- The map is initialized only when the component mounts
- Route geometry is parsed only when it changes
- Markers and routes are cleared and recreated on prop changes
- The component uses `useRef` to maintain map instance

## Browser Compatibility

- Modern browsers with ES6+ support
- Requires Leaflet.js CSS and JavaScript
- Mobile-friendly with touch support
- Responsive design with flexible sizing

## Troubleshooting

### Map Not Loading
- Check if Leaflet CSS is imported
- Verify coordinates are valid numbers
- Ensure the container has proper dimensions

### Route Not Displaying
- Verify GeoJSON format is correct
- Check if coordinates are in [lng, lat] format
- Ensure routeGeometry is a valid JSON string

### Performance Issues
- Limit the number of route waypoints
- Use appropriate map zoom levels
- Consider lazy loading for multiple maps 