# Truck Rental API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## User Roles
- `ADMIN`: Full system access
- `DRIVER`: Driver-specific functionalities
- `USER`: Customer functionalities

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "USER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

---

## Driver Endpoints

### Create Driver Profile
```http
POST /drivers
```
*Requires: DRIVER role*

**Request Body:**
```json
{
  "truckType": "MINI_TRUCK",
  "capacity": 2.5,
  "quality": "EXCELLENT",
  "license": "DL123456",
  "registration": "REG789012",
  "location": "New York",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### Get Available Drivers
```http
GET /drivers/available
```

**Query Parameters:**
- `truckType`: MINI_TRUCK, PICKUP, LORRY, TRUCK
- `capacity`: Minimum capacity in tons
- `location`: Location name
- `latitude`: Latitude coordinate
- `longitude`: Longitude coordinate
- `radius`: Search radius in km

### Update Driver Availability
```http
PATCH /drivers/availability
```
*Requires: DRIVER role*

**Request Body:**
```json
{
  "isAvailable": true
}
```

### Get Driver Profile
```http
GET /drivers/:driverId
```

---

## Booking Endpoints

### Create Booking
```http
POST /bookings
```
*Requires: USER role*

**Request Body:**
```json
{
  "driverId": "driver_id",
  "source": "123 Main St, New York",
  "destination": "456 Oak Ave, Brooklyn",
  "sourceLat": 40.7128,
  "sourceLng": -74.0060,
  "destLat": 40.7589,
  "destLng": -73.9851,
  "distance": 15.5,
  "fare": 75.00,
  "pickupTime": "2024-01-15T10:00:00Z"
}
```

### Get User Bookings
```http
GET /bookings/user/me
```
*Requires: USER role*

### Get Driver Bookings
```http
GET /bookings/driver/me
```
*Requires: DRIVER role*

### Get All Bookings (Admin)
```http
GET /bookings
```
*Requires: ADMIN role*

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Booking status filter

### Update Booking
```http
PUT /bookings/:bookingId
```

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "pickupTime": "2024-01-15T10:00:00Z"
}
```

### Cancel Booking
```http
DELETE /bookings/:bookingId
```

---

## Review Endpoints

### Create Review
```http
POST /reviews
```
*Requires: USER role*

**Request Body:**
```json
{
  "driverId": "driver_id",
  "bookingId": "booking_id",
  "rating": 5,
  "comment": "Excellent service!"
}
```

### Get Driver Reviews
```http
GET /reviews/driver/:driverId
```

### Get User Reviews
```http
GET /reviews/user/me
```

### Get All Reviews (Admin)
```http
GET /reviews
```
*Requires: ADMIN role*

### Update Review
```http
PUT /reviews/:reviewId
```
*Requires: USER role*

### Delete Review
```http
DELETE /reviews/:reviewId
```
*Requires: USER role*

---

## Message Endpoints

### Send Message
```http
POST /messages
```

**Request Body:**
```json
{
  "receiverId": "user_id",
  "content": "Hello, when will you arrive?"
}
```

### Get User Conversations
```http
GET /messages/conversations
```

### Get Conversation
```http
GET /messages/conversation/:userId2
```

### Mark Message as Read
```http
PATCH /messages/:messageId/read
```

### Get Unread Count
```http
GET /messages/unread-count
```

### Search Messages
```http
GET /messages/search?q=hello
```

---

## Payment Endpoints

### Create Payment
```http
POST /payments
```

**Request Body:**
```json
{
  "bookingId": "booking_id",
  "amount": 75.00,
  "paymentMethod": "CARD",
  "transactionId": "txn_123456",
  "status": "PENDING"
}
```

### Get Payment by Booking
```http
GET /payments/booking/:bookingId
```

### Get Payment History
```http
GET /payments/history
```

### Update Payment Status
```http
PATCH /payments/:paymentId/status
```

**Request Body:**
```json
{
  "status": "COMPLETED",
  "transactionId": "txn_123456"
}
```

### Process Refund (Admin)
```http
POST /payments/:paymentId/refund
```
*Requires: ADMIN role*

**Request Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

---

## User Management Endpoints

### Get Current User
```http
GET /users/me
```

### Update Current User
```http
PUT /users/me
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890"
}
```

### Get All Users (Admin)
```http
GET /users
```
*Requires: ADMIN role*

### Get User by ID (Admin)
```http
GET /users/:userId
```
*Requires: ADMIN role*

### Update User (Admin)
```http
PUT /users/:userId
```
*Requires: ADMIN role*

### Deactivate User (Admin)
```http
PATCH /users/:userId/deactivate
```
*Requires: ADMIN role*

### Activate User (Admin)
```http
PATCH /users/:userId/activate
```
*Requires: ADMIN role*

---

## Fare Calculation Endpoints

### Calculate Fare
```http
POST /fare-calculation/calculate
```

**Request Body:**
```json
{
  "source": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York"
  },
  "destination": {
    "latitude": 40.7589,
    "longitude": -73.9851,
    "address": "456 Oak Ave, Brooklyn"
  },
  "truckType": "MINI_TRUCK",
  "weight": 2.5,
  "urgency": "NORMAL"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "distance": 15.5,
    "duration": 31,
    "baseFare": 5.0,
    "weightMultiplier": 1.2,
    "urgencyMultiplier": 1.0,
    "totalFare": 93.0,
    "breakdown": {
      "distanceCost": 77.5,
      "weightCost": 15.5,
      "urgencyCost": 0,
      "basePrice": 5.0
    }
  }
}
```

### Get Fare History
```http
GET /fare-calculation/history
```
*Requires: USER role*

### Get Fare Analytics
```http
GET /fare-calculation/analytics?startDate=2024-01-01&endDate=2024-01-31
```
*Requires: ADMIN role*

---

## Emergency Alert Endpoints

### Create Emergency Alert
```http
POST /emergency-alerts
```
*Requires: USER role*

**Request Body:**
```json
{
  "type": "SAFETY",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York"
  },
  "description": "Vehicle breakdown on highway",
  "severity": "HIGH",
  "contactNumber": "+1234567890"
}
```

### Get All Emergency Alerts
```http
GET /emergency-alerts
```
*Requires: ADMIN role*

### Get Emergency Alert by ID
```http
GET /emergency-alerts/:alertId
```
*Requires: ADMIN role*

### Update Emergency Alert Status
```http
PATCH /emergency-alerts/:alertId/status
```
*Requires: ADMIN role*

**Request Body:**
```json
{
  "status": "ACKNOWLEDGED"
}
```

### Get User's Emergency Alerts
```http
GET /emergency-alerts/user/alerts
```
*Requires: USER role*

### Get Emergency Alert Statistics
```http
GET /emergency-alerts/stats/overview
```
*Requires: ADMIN role*

### Get Active Emergency Alerts
```http
GET /emergency-alerts/active/alerts
```
*Requires: ADMIN role*

---

## Tracking Endpoints

### Update Driver Location
```http
POST /tracking/location
```
*Requires: DRIVER role*

**Request Body:**
```json
{
  "driverId": "driver_id",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10,
  "speed": 45,
  "heading": 90,
  "address": "123 Main St, New York"
}
```

### Get Current Driver Location
```http
GET /tracking/location/:driverId
```

### Get Tracking History
```http
GET /tracking/history/:driverId?startTime=2024-01-01T00:00:00Z&endTime=2024-01-01T23:59:59Z
```
*Requires: DRIVER role*

### Get Active Drivers in Area
```http
GET /tracking/drivers/nearby?latitude=40.7128&longitude=-74.0060&radius=10
```

### Get Driver Route
```http
GET /tracking/route/:driverId/:bookingId
```

### Get Tracking Statistics
```http
GET /tracking/stats/:driverId?days=7
```
*Requires: DRIVER role*

---

## Search Endpoints

### Search Trucks
```http
POST /search/trucks
```

**Request Body:**
```json
{
  "truckType": "MINI_TRUCK",
  "capacity": 2.5,
  "location": "New York",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 10,
  "rating": 4.0,
  "availability": true,
  "verified": true,
  "quality": "EXCELLENT"
}
```

### Get Popular Trucks
```http
GET /search/trucks?limit=10
```

### Get Nearby Trucks
```http
GET /search/trucks/nearby?latitude=40.7128&longitude=-74.0060&radius=10&limit=20
```

### Get Truck Recommendations
```http
GET /search/trucks/recommendations?limit=10
```
*Requires: USER role*

### Get Search Suggestions
```http
GET /search/suggestions?query=mini
```

### Advanced Search
```http
GET /search/advanced?truckType=MINI_TRUCK&capacity=2.5&rating=4.0&availability=true
```

---

## Admin Endpoints

### Dashboard Statistics
```http
GET /admin/dashboard
```
*Requires: ADMIN role*

### Booking Analytics
```http
GET /admin/analytics/bookings?timeRange=month
```
*Requires: ADMIN role*

### Driver Analytics
```http
GET /admin/analytics/drivers
```
*Requires: ADMIN role*

### System Settings
```http
GET /admin/settings
```
*Requires: ADMIN role*

### Update System Setting
```http
PUT /admin/settings
```
*Requires: ADMIN role*

**Request Body:**
```json
{
  "key": "base_fare_per_km",
  "value": 5.0,
  "type": "number"
}
```

### Pending Driver Verifications
```http
GET /admin/drivers/pending-verifications
```
*Requires: ADMIN role*

### Booking Reports
```http
GET /admin/reports/bookings?status=COMPLETED&startDate=2024-01-01&endDate=2024-01-31
```
*Requires: ADMIN role*

### Revenue Reports
```http
GET /admin/reports/revenue?startDate=2024-01-01&endDate=2024-01-31
```
*Requires: ADMIN role*

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Real-time Features

### WebSocket Events

The application supports real-time updates via WebSocket connections:

**Connection:**
```javascript
const socket = io('http://localhost:3001');
```

**Events:**
- `booking_request`: New booking request for driver
- `booking_status_update`: Booking status changed
- `new_message`: New message received
- `driver_location_update`: Driver location updated
- `payment_status_update`: Payment status changed

**Example:**
```javascript
socket.on('booking_request', (data) => {
  console.log('New booking request:', data);
});

socket.on('new_message', (data) => {
  console.log('New message:', data);
});
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute

---

## Pagination

List endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
``` 