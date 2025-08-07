# 🚛 Fare Calculation System Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Fare Structure](#fare-structure)
3. [Truck Categories](#truck-categories)
4. [Calculation Formula](#calculation-formula)
5. [API Endpoints](#api-endpoints)
6. [Usage Examples](#usage-examples)
7. [Database Schema](#database-schema)
8. [Implementation Details](#implementation-details)
9. [Testing](#testing)

## 🎯 Overview

The fare calculation system implements the **Truck Lagbe pricing model** for truck rentals in Bangladesh. It provides accurate, location-based pricing with comprehensive breakdowns for different truck types and trip scenarios.

### Key Features
- ✅ **Location-based pricing** (Inside/Outside Dhaka)
- ✅ **Truck-specific rates** (8 different categories)
- ✅ **Real-time calculation** with Google Maps integration
- ✅ **Comprehensive breakdown** (base fare, distance, weight, urgency, tolls)
- ✅ **Market-accurate pricing** based on Truck Lagbe model

## 💰 Fare Structure

### Base Components
1. **Base Fare** - Fixed amount per truck category
2. **Distance Cost** - Per kilometer rate (varies by location)
3. **Weight Surcharge** - For loads exceeding truck capacity
4. **Urgency Surcharge** - For urgent/emergency deliveries
5. **Toll Charges** - Bridge crossings and long-distance fees

### Pricing Zones
- **Inside Dhaka**: Higher per-km rates (35-200 BDT/km)
- **Outside Dhaka**: Lower per-km rates (25-60 BDT/km)

## 🚚 Truck Categories

| Category | Capacity | Length | Base Fare | Inside Dhaka | Outside Dhaka | Description |
|----------|----------|--------|-----------|--------------|---------------|-------------|
| Mini Truck – 0.5T, 6ft | 0.5 tons | 6 ft | 800 BDT | 35 BDT/km | 25 BDT/km | Very small truck for light deliveries |
| Pickup – 1T, 7ft | 1.0 tons | 7 ft | 1,000 BDT | 40 BDT/km | 30 BDT/km | Small pickup truck for local deliveries |
| Pickup – 1.5T, 9ft | 1.5 tons | 9 ft | 1,500 BDT | 40 BDT/km | 35 BDT/km | Medium pickup for construction materials |
| Pickup – 2-3T, 12ft | 2.5 tons | 12 ft | 2,000 BDT | 50 BDT/km | 40 BDT/km | Large pickup for commercial transport |
| Lorry – 3-4T, 13ft | 3.5 tons | 13 ft | 2,500 BDT | 80 BDT/km | 40 BDT/km | Standard lorry for medium loads |
| Truck – 4-5T, 14ft | 4.5 tons | 14 ft | 3,000 BDT | 100 BDT/km | 45 BDT/km | Medium truck for heavy transport |
| Truck – 6-7T, 17ft | 6.5 tons | 17 ft | 4,000 BDT | 200 BDT/km | 55 BDT/km | Large truck for industrial transport |
| Truck – 8-10T, 20ft | 9.0 tons | 20 ft | 5,000 BDT | 200 BDT/km | 60 BDT/km | Heavy-duty truck for maximum capacity |

## 🧮 Calculation Formula

### Main Formula
```
Total Fare = Base Fare + Distance Cost + Weight Cost + Urgency Cost + Tolls
```

### Detailed Breakdown

#### 1. Base Fare
- Fixed amount based on truck category
- Covers basic operational costs

#### 2. Distance Cost
```
Distance Cost = Distance (km) × Rate per km
```
- **Inside Dhaka**: Higher rates (35-200 BDT/km)
- **Outside Dhaka**: Lower rates (25-60 BDT/km)

#### 3. Weight Surcharge
```
Weight Multiplier = calculateWeightMultiplier(loadWeight / truckCapacity)
Weight Cost = Distance Cost × (Weight Multiplier - 1)
```

**Weight Multiplier Scale:**
- ≤ 1.0x capacity: No surcharge
- 1.0-1.5x capacity: 1.2x multiplier
- 1.5-2.0x capacity: 1.5x multiplier
- 2.0-3.0x capacity: 2.0x multiplier
- > 3.0x capacity: 2.5x multiplier

#### 4. Urgency Surcharge
```
Urgency Cost = Distance Cost × (Urgency Multiplier - 1)
```

**Urgency Multipliers:**
- **Normal**: 1.0x (no surcharge)
- **Urgent**: 1.3x (30% surcharge)
- **Emergency**: 1.8x (80% surcharge)

#### 5. Toll Charges
- **Bridge Tolls**: 100 BDT (when crossing major bridges)
- **Long Distance**: 200 BDT (for trips > 50km)

## 🌐 API Endpoints

### 1. Get Truck Categories
```http
GET /api/v1/fare-calculation/categories
```

**Response:**
```json
{
  "success": true,
  "message": "Truck categories retrieved successfully",
  "data": [
    {
      "id": "cme0e7u9k000u36kl83z5zr4a",
      "name": "Pickup – 1T, 7ft",
      "truckType": "PICKUP",
      "capacity": 1.0,
      "length": 7.0,
      "baseFare": 1000,
      "insideDhakaRate": 40,
      "outsideDhakaRate": 30,
      "description": "Small pickup truck suitable for local deliveries",
      "isActive": true
    }
  ]
}
```

### 2. Calculate Fare
```http
POST /api/v1/fare-calculation/calculate
```

**Request Body:**
```json
{
  "source": {
    "latitude": 23.8103,
    "longitude": 90.4125,
    "address": "Dhaka Center"
  },
  "destination": {
    "latitude": 23.7937,
    "longitude": 90.4066,
    "address": "Dhaka Area"
  },
  "truckCategoryId": "cme0e7u9k000u36kl83z5zr4a",
  "truckType": "PICKUP",
  "weight": 1.5,
  "urgency": "NORMAL"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fare calculated successfully",
  "data": {
    "distance": 1.94,
    "duration": 3.88,
    "baseFare": 1000,
    "distanceCost": 78,
    "weightMultiplier": 1,
    "urgencyMultiplier": 1,
    "totalFare": 1178,
    "isInsideDhaka": true,
    "breakdown": {
      "baseFare": 1000,
      "distanceCost": 78,
      "weightCost": 0,
      "urgencyCost": 0,
      "tolls": 100
    }
  }
}
```

### 3. Get Fare History (User Only)
```http
GET /api/v1/fare-calculation/history?page=1&limit=10
```

### 4. Get Fare Analytics (Admin Only)
```http
GET /api/v1/fare-calculation/analytics?startDate=2024-01-01&endDate=2024-12-31
```

## 📝 Usage Examples

### Example 1: Inside Dhaka Trip
**Trip Details:**
- From: Dhaka Center (23.8103, 90.4125)
- To: Dhaka Area (23.7937, 90.4066)
- Truck: Pickup – 1T, 7ft
- Distance: 1.94 km

**Calculation:**
- Base Fare: 1,000 BDT
- Distance Cost: 1.94 × 40 = 77.6 BDT
- Tolls: 100 BDT (bridge)
- **Total: 1,178 BDT**

### Example 2: Outside Dhaka Trip
**Trip Details:**
- From: Dhaka (23.8103, 90.4125)
- To: Chittagong (22.3569, 91.7832)
- Truck: Pickup – 1T, 7ft
- Distance: 214 km

**Calculation:**
- Base Fare: 1,000 BDT
- Distance Cost: 214 × 30 = 6,420 BDT
- Tolls: 200 BDT (long distance)
- **Total: 7,620 BDT**

### Example 3: Overweight Load
**Trip Details:**
- From: Dhaka Center
- To: Dhaka Area
- Truck: Pickup – 1T, 7ft (1 ton capacity)
- Load Weight: 1.5 tons (50% overweight)
- Distance: 2 km

**Calculation:**
- Base Fare: 1,000 BDT
- Distance Cost: 2 × 40 = 80 BDT
- Weight Multiplier: 1.2x (20% surcharge)
- Weight Cost: 80 × 0.2 = 16 BDT
- Tolls: 100 BDT
- **Total: 1,196 BDT**

## 🗄️ Database Schema

### TruckCategory Model
```prisma
model TruckCategory {
  id                    String   @id @default(cuid())
  name                  String   @unique
  truckType             TruckType
  capacity              Float    // in tons
  length                Float    // in feet
  baseFare              Float    // base fare in BDT
  insideDhakaRate       Float    // per km rate inside Dhaka
  outsideDhakaRate      Float    // per km rate outside Dhaka
  description           String?
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@map("truck_categories")
}
```

### TruckType Enum
```prisma
enum TruckType {
  MINI_TRUCK
  PICKUP
  LORRY
  TRUCK
}
```

## 🔧 Implementation Details

### Location Detection
```typescript
private static isInsideDhaka(location: Location): boolean {
  const dhakaBounds = {
    north: 23.85,
    south: 23.70,
    east: 90.45,
    west: 90.30
  };

  return location.latitude >= dhakaBounds.south && 
         location.latitude <= dhakaBounds.north && 
         location.longitude >= dhakaBounds.west && 
         location.longitude <= dhakaBounds.east;
}
```

### Distance Calculation
- **Primary**: Google Maps Distance Matrix API
- **Fallback**: Haversine formula for direct distance
- **Duration**: Estimated based on average speed (30 km/h in city)

### Toll Detection
```typescript
private static calculateTolls(source: Location, destination: Location, distance: number): number {
  let tolls = 0;
  
  // Long distance tolls
  if (distance > 50) {
    tolls += 200;
  }
  
  // Bridge tolls
  if (this.crossesBridge(source, destination)) {
    tolls += 100;
  }
  
  return tolls;
}
```

## 🧪 Testing

### API Testing Commands

#### 1. Get Truck Categories
```bash
curl -X GET "http://localhost:4000/api/v1/fare-calculation/categories" \
  -H "Content-Type: application/json"
```

#### 2. Calculate Inside Dhaka Fare
```bash
curl -X POST "http://localhost:4000/api/v1/fare-calculation/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"latitude": 23.8103, "longitude": 90.4125, "address": "Dhaka Center"},
    "destination": {"latitude": 23.7937, "longitude": 90.4066, "address": "Dhaka Area"},
    "truckType": "PICKUP"
  }'
```

#### 3. Calculate Outside Dhaka Fare
```bash
curl -X POST "http://localhost:4000/api/v1/fare-calculation/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"latitude": 23.8103, "longitude": 90.4125, "address": "Dhaka"},
    "destination": {"latitude": 22.3569, "longitude": 91.7832, "address": "Chittagong"},
    "truckType": "PICKUP"
  }'
```

#### 4. Calculate with Specific Truck Category
```bash
curl -X POST "http://localhost:4000/api/v1/fare-calculation/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"latitude": 23.8103, "longitude": 90.4125, "address": "Dhaka Center"},
    "destination": {"latitude": 23.7937, "longitude": 90.4066, "address": "Dhaka Area"},
    "truckCategoryId": "cme0e7u9k000u36kl83z5zr4a"
  }'
```

### Expected Results

#### Inside Dhaka (2km)
- **Total**: ~1,178 BDT
- **Breakdown**: Base (1,000) + Distance (78) + Tolls (100)

#### Outside Dhaka (214km)
- **Total**: ~7,620 BDT
- **Breakdown**: Base (1,000) + Distance (6,420) + Tolls (200)

## 🔄 Frontend Integration

### API Client Methods
```typescript
// Get truck categories
const categories = await apiClient.getTruckCategories();

// Calculate fare
const fare = await apiClient.calculateFare({
  source: { latitude: 23.8103, longitude: 90.4125, address: "Dhaka" },
  destination: { latitude: 23.7937, longitude: 90.4066, address: "Chittagong" },
  truckCategoryId: "category-id",
  weight: 1.5,
  urgency: "NORMAL"
});
```

### React Component Usage
```typescript
const calculateFare = async () => {
  const response = await apiClient.calculateFare({
    source: { latitude: sourceLat, longitude: sourceLng, address: source },
    destination: { latitude: destLat, longitude: destLng, address: destination },
    truckType: driver.truckType
  });

  if (response.success) {
    setCalculatedFare(response.data.totalFare);
    setFareBreakdown(response.data.breakdown);
  }
};
```

## 📊 Monitoring & Analytics

### Logging
- All fare calculations are logged with detailed breakdowns
- Error tracking for failed calculations
- Performance monitoring for API response times

### Analytics Endpoints
- **User History**: Track individual user fare calculations
- **Admin Analytics**: Revenue analysis, popular routes, truck type usage
- **Performance Metrics**: Average fares, distance distributions, toll revenue

## 🚀 Future Enhancements

### Planned Features
1. **Dynamic Pricing**: Real-time market rate adjustments
2. **Fuel Surcharge**: Automatic fuel price-based adjustments
3. **Seasonal Pricing**: Peak/off-peak rate variations
4. **Bulk Discounts**: Volume-based pricing for multiple bookings
5. **Insurance Options**: Optional insurance add-ons
6. **Driver Bonuses**: Performance-based driver incentives

### Technical Improvements
1. **Caching**: Redis-based fare caching for repeated routes
2. **Geocoding**: Enhanced address-to-coordinate conversion
3. **Route Optimization**: Multi-stop route calculations
4. **Real-time Traffic**: Traffic-based duration adjustments
5. **Weather Impact**: Weather-based pricing adjustments

---

## 📞 Support

For technical support or questions about the fare calculation system:

- **Email**: support@trucklagbe.com
- **Documentation**: This file
- **API Status**: Check `/api/v1/health` endpoint
- **Issues**: Create GitHub issue with detailed description

---

*Last Updated: August 6, 2024*
*Version: 1.0.0*
*Based on Truck Lagbe Pricing Model* 