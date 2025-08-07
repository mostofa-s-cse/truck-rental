# 🚛 Fare Calculation Quick Reference

## 🚀 Quick Start

### 1. Get Available Truck Categories
```bash
curl -X GET "http://localhost:4000/api/v1/fare-calculation/categories"
```

### 2. Calculate Basic Fare
```bash
curl -X POST "http://localhost:4000/api/v1/fare-calculation/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"latitude": 23.8103, "longitude": 90.4125, "address": "Dhaka"},
    "destination": {"latitude": 23.7937, "longitude": 90.4066, "address": "Chittagong"},
    "truckType": "PICKUP"
  }'
```

## 📊 Truck Categories Reference

| ID | Name | Base Fare | Inside Dhaka | Outside Dhaka | Capacity |
|----|------|-----------|--------------|---------------|----------|
| `cme0e7u9k000u36kl83z5zr4a` | Pickup – 1T, 7ft | 1,000 BDT | 40 BDT/km | 30 BDT/km | 1.0 ton |
| `cme0e7u9n000v36klp059bk6r` | Pickup – 1.5T, 9ft | 1,500 BDT | 40 BDT/km | 35 BDT/km | 1.5 tons |
| `cme0e7u9o000w36kl6v5hufa3` | Pickup – 2-3T, 12ft | 2,000 BDT | 50 BDT/km | 40 BDT/km | 2.5 tons |
| `cme0e7u9v001136klocvw3b2i` | Lorry – 3-4T, 13ft | 2,500 BDT | 80 BDT/km | 40 BDT/km | 3.5 tons |
| `cme0e7u9p000x36kli48rh2bj` | Truck – 4-5T, 14ft | 3,000 BDT | 100 BDT/km | 45 BDT/km | 4.5 tons |
| `cme0e7u9r000y36klqfu4wr6o` | Truck – 6-7T, 17ft | 4,000 BDT | 200 BDT/km | 55 BDT/km | 6.5 tons |
| `cme0e7u9s000z36klmra8mv1v` | Truck – 8-10T, 20ft | 5,000 BDT | 200 BDT/km | 60 BDT/km | 9.0 tons |

## 🧮 Calculation Examples

### Example 1: Inside Dhaka (2km)
```json
{
  "source": {"latitude": 23.8103, "longitude": 90.4125},
  "destination": {"latitude": 23.7937, "longitude": 90.4066},
  "truckType": "PICKUP"
}
```
**Result**: ~1,178 BDT (Base: 1,000 + Distance: 78 + Tolls: 100)

### Example 2: Outside Dhaka (214km)
```json
{
  "source": {"latitude": 23.8103, "longitude": 90.4125},
  "destination": {"latitude": 22.3569, "longitude": 91.7832},
  "truckType": "PICKUP"
}
```
**Result**: ~7,620 BDT (Base: 1,000 + Distance: 6,420 + Tolls: 200)

### Example 3: With Weight & Urgency
```json
{
  "source": {"latitude": 23.8103, "longitude": 90.4125},
  "destination": {"latitude": 23.7937, "longitude": 90.4066},
  "truckType": "PICKUP",
  "weight": 1.5,
  "urgency": "URGENT"
}
```
**Result**: ~1,234 BDT (includes weight and urgency surcharges)

## 🔧 Frontend Integration

### TypeScript Interface
```typescript
interface FareCalculationRequest {
  source: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  truckCategoryId?: string;
  truckType?: 'MINI_TRUCK' | 'PICKUP' | 'LORRY' | 'TRUCK';
  weight?: number;
  urgency?: 'NORMAL' | 'URGENT' | 'EMERGENCY';
}

interface FareCalculationResult {
  distance: number;
  duration: number;
  baseFare: number;
  distanceCost: number;
  weightMultiplier: number;
  urgencyMultiplier: number;
  totalFare: number;
  isInsideDhaka: boolean;
  breakdown: {
    baseFare: number;
    distanceCost: number;
    weightCost: number;
    urgencyCost: number;
    tolls: number;
  };
}
```

### React Hook Example
```typescript
const useFareCalculation = () => {
  const [fare, setFare] = useState<FareCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateFare = async (request: FareCalculationRequest) => {
    setLoading(true);
    try {
      const response = await apiClient.calculateFare(request);
      if (response.success) {
        setFare(response.data);
      }
    } catch (error) {
      console.error('Fare calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return { fare, loading, calculateFare };
};
```

## 📍 Location Detection

### Dhaka Boundaries
```typescript
const dhakaBounds = {
  north: 23.85,
  south: 23.70,
  east: 90.45,
  west: 90.30
};
```

### Common Coordinates
- **Dhaka Center**: 23.8103, 90.4125
- **Dhaka Airport**: 23.8433, 90.3978
- **Chittagong**: 22.3569, 91.7832
- **Sylhet**: 24.8949, 91.8687

## 💰 Pricing Rules

### Base Fares
- Fixed amount per truck category (800-5,000 BDT)

### Distance Rates
- **Inside Dhaka**: 35-200 BDT/km (higher)
- **Outside Dhaka**: 25-60 BDT/km (lower)

### Weight Surcharges
- ≤ 1.0x capacity: No surcharge
- 1.0-1.5x capacity: 20% surcharge
- 1.5-2.0x capacity: 50% surcharge
- 2.0-3.0x capacity: 100% surcharge
- > 3.0x capacity: 150% surcharge

### Urgency Multipliers
- **Normal**: 1.0x (no surcharge)
- **Urgent**: 1.3x (30% surcharge)
- **Emergency**: 1.8x (80% surcharge)

### Toll Charges
- **Bridge Tolls**: 100 BDT
- **Long Distance**: 200 BDT (>50km)

## 🧪 Testing Commands

### Test Categories API
```bash
curl -X GET "http://localhost:4000/api/v1/fare-calculation/categories"
```

### Test Inside Dhaka
```bash
curl -X POST "http://localhost:4000/api/v1/fare-calculation/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"latitude": 23.8103, "longitude": 90.4125},
    "destination": {"latitude": 23.7937, "longitude": 90.4066},
    "truckType": "PICKUP"
  }'
```

### Test Outside Dhaka
```bash
curl -X POST "http://localhost:4000/api/v1/fare-calculation/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"latitude": 23.8103, "longitude": 90.4125},
    "destination": {"latitude": 22.3569, "longitude": 91.7832},
    "truckType": "PICKUP"
  }'
```

### Test with Specific Category
```bash
curl -X POST "http://localhost:4000/api/v1/fare-calculation/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"latitude": 23.8103, "longitude": 90.4125},
    "destination": {"latitude": 23.7937, "longitude": 90.4066},
    "truckCategoryId": "cme0e7u9k000u36kl83z5zr4a"
  }'
```

## 🚨 Error Handling

### Common Errors
- `Truck category not found`: Invalid truckType or truckCategoryId
- `Google Maps API error`: Fallback to Haversine calculation
- `Invalid coordinates`: Check latitude/longitude values

### Response Format
```json
{
  "success": true/false,
  "message": "Description",
  "data": { /* result data */ },
  "error": "Error details (if failed)"
}
```

## 📊 Expected Results

### Inside Dhaka (2km trip)
- **Mini Truck**: ~1,078 BDT
- **Pickup**: ~1,178 BDT
- **Lorry**: ~1,678 BDT
- **Truck**: ~1,978 BDT

### Outside Dhaka (100km trip)
- **Mini Truck**: ~3,300 BDT
- **Pickup**: ~4,000 BDT
- **Lorry**: ~6,500 BDT
- **Truck**: ~7,500 BDT

---

*Quick Reference v1.0.0 - August 6, 2024* 