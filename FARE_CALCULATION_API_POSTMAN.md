# 🚛 Fare Calculation API - Postman Collection

## Base URL
```
http://localhost:4000/api/v1
```

## Environment Variables
```json
{
  "base_url": "http://localhost:4000/api/v1",
  "auth_token": "your_jwt_token_here"
}
```

---

## 📋 API Endpoints

### 1. Get Truck Categories
```http
GET {{base_url}}/fare-calculation/categories
```

**Headers:**
```
Content-Type: application/json
```

**Response Example:**
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
      "isActive": true,
      "createdAt": "2025-08-06T20:00:43.257Z",
      "updatedAt": "2025-08-06T20:00:43.257Z"
    }
  ]
}
```

---

### 2. Calculate Fare (Basic)
```http
POST {{base_url}}/fare-calculation/calculate
```

**Headers:**
```
Content-Type: application/json
```

**Body (Inside Dhaka):**
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
  "truckType": "PICKUP"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Fare calculated successfully",
  "data": {
    "distance": 1.9409816911904003,
    "duration": 3.8819633823808006,
    "baseFare": 1000,
    "distanceCost": 77.63926764761601,
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

---

### 3. Calculate Fare (Outside Dhaka)
```http
POST {{base_url}}/fare-calculation/calculate
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "source": {
    "latitude": 23.8103,
    "longitude": 90.4125,
    "address": "Dhaka"
  },
  "destination": {
    "latitude": 22.3569,
    "longitude": 91.7832,
    "address": "Chittagong"
  },
  "truckType": "PICKUP"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Fare calculated successfully",
  "data": {
    "distance": 213.9521911797175,
    "duration": 427.904382359435,
    "baseFare": 1000,
    "distanceCost": 6418.565735391525,
    "weightMultiplier": 1,
    "urgencyMultiplier": 1,
    "totalFare": 7619,
    "isInsideDhaka": false,
    "breakdown": {
      "baseFare": 1000,
      "distanceCost": 6419,
      "weightCost": 0,
      "urgencyCost": 0,
      "tolls": 200
    }
  }
}
```

---

### 4. Calculate Fare (With Specific Category)
```http
POST {{base_url}}/fare-calculation/calculate
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
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
  "truckCategoryId": "cme0e7u9k000u36kl83z5zr4a"
}
```

---

### 5. Calculate Fare (With Weight & Urgency)
```http
POST {{base_url}}/fare-calculation/calculate
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
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
  "truckType": "PICKUP",
  "weight": 1.5,
  "urgency": "URGENT"
}
```

---

### 6. Get Fare History (Authenticated)
```http
GET {{base_url}}/fare-calculation/history?page=1&limit=10
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{auth_token}}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

---

### 7. Get Fare Analytics (Admin Only)
```http
GET {{base_url}}/fare-calculation/analytics?startDate=2024-01-01&endDate=2024-12-31
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{auth_token}}
```

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

---

## 🧪 Test Cases

### Test Case 1: Mini Truck Inside Dhaka
```json
{
  "source": {"latitude": 23.8103, "longitude": 90.4125},
  "destination": {"latitude": 23.7937, "longitude": 90.4066},
  "truckType": "MINI_TRUCK"
}
```
**Expected Total**: ~1,078 BDT

### Test Case 2: Large Truck Outside Dhaka
```json
{
  "source": {"latitude": 23.8103, "longitude": 90.4125},
  "destination": {"latitude": 22.3569, "longitude": 91.7832},
  "truckType": "TRUCK"
}
```
**Expected Total**: ~15,000+ BDT

### Test Case 3: Overweight Load
```json
{
  "source": {"latitude": 23.8103, "longitude": 90.4125},
  "destination": {"latitude": 23.7937, "longitude": 90.4066},
  "truckType": "PICKUP",
  "weight": 2.0
}
```
**Expected**: Includes weight surcharge

### Test Case 4: Emergency Delivery
```json
{
  "source": {"latitude": 23.8103, "longitude": 90.4125},
  "destination": {"latitude": 23.7937, "longitude": 90.4066},
  "truckType": "PICKUP",
  "urgency": "EMERGENCY"
}
```
**Expected**: Includes 80% urgency surcharge

---

## 📊 Response Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 500 | Internal Server Error |

---

## 🚨 Error Responses

### Invalid Truck Type
```json
{
  "success": false,
  "message": "Truck category not found for INVALID_TYPE",
  "error": "Truck category not found for INVALID_TYPE"
}
```

### Invalid Coordinates
```json
{
  "success": false,
  "message": "Invalid coordinates provided",
  "error": "Invalid coordinates provided"
}
```

### Missing Required Fields
```json
{
  "success": false,
  "message": "Source and destination are required",
  "error": "Source and destination are required"
}
```

---

## 📋 Postman Collection JSON

```json
{
  "info": {
    "name": "Fare Calculation API",
    "description": "Truck Lagbe fare calculation system",
    "version": "1.0.0"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:4000/api/v1"
    },
    {
      "key": "auth_token",
      "value": "your_jwt_token_here"
    }
  ],
  "item": [
    {
      "name": "Get Truck Categories",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/fare-calculation/categories",
          "host": ["{{base_url}}"],
          "path": ["fare-calculation", "categories"]
        }
      }
    },
    {
      "name": "Calculate Fare - Inside Dhaka",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"source\": {\n    \"latitude\": 23.8103,\n    \"longitude\": 90.4125,\n    \"address\": \"Dhaka Center\"\n  },\n  \"destination\": {\n    \"latitude\": 23.7937,\n    \"longitude\": 90.4066,\n    \"address\": \"Dhaka Area\"\n  },\n  \"truckType\": \"PICKUP\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/fare-calculation/calculate",
          "host": ["{{base_url}}"],
          "path": ["fare-calculation", "calculate"]
        }
      }
    }
  ]
}
```

---

*API Documentation v1.0.0 - August 6, 2024* 