# 🔮 System Future - Truck Rental Service

## System Workflow & Features

This document outlines the complete system workflow and features of the Truck Rental Service platform.

---

## Core System Features

### 1. Authentication

- **User Registration/Login** - Secure authentication with JWT sessions
- **Password Security** - All passwords encrypted using bcryptjs hashing
- **Session Management** - JWT tokens with configurable expiration
- **Email Verification** - Optional email verification for new accounts

### 2. User Role Management

- **Role Assignment** - Users assigned USER/DRIVER/ADMIN roles
- **Role-Based Access Control** - Features and routes protected by user role
- **Permission System** - Granular permissions for different user types

### 3. Admin Approval System

- **Driver Registration** - Drivers register with profile and documents
- **Pending Review** - New drivers await admin approval before access granted
- **Verification Process** - Admins review driver documents and approve/reject
- **Status Tracking** - Driver verification status tracked in system

### 4. Driver Profile Creation

- **Profile Management** - Drivers create and manage comprehensive profiles
- **Truck Information** - Drivers provide truck type, capacity, and specifications
- **Document Upload** - License, registration, and insurance documents
- **Availability Status** - Drivers update real-time availability

### 5. Truck Search & Discovery

- **Location-Based Search** - Users search available trucks by pickup location
- **Advanced Filtering** - Filter by truck type, capacity, rating, and availability
- **Real-Time Availability** - See which drivers are currently available
- **Driver Profiles** - View driver ratings, reviews, and truck details

### 6. Fare Calculation

- **Real-Time Pricing** - Automatic fare calculation based on:
  - Distance (source to destination)
  - Truck type and category
  - Weight of cargo
  - Urgency level (normal/urgent)
  - Location (inside/outside Dhaka)
- **Transparent Breakdown** - Detailed fare breakdown shown to users
- **Toll Charges** - Automatic toll calculation for long-distance trips

### 7. Booking Process

- **Custom Booking System** - Users create booking requests with trip details
- **Driver Acceptance Workflow** - Drivers receive and accept/reject booking requests
- **Booking Confirmation** - Confirmed bookings trigger notifications
- **Booking Management** - Complete booking lifecycle management

### 8. Payment Process

- **Custom Checkout** - Integrated checkout system with SSL Commerz gateway
- **Multiple Payment Methods** - Support for cards, mobile banking, and cash
- **Secure Transactions** - All payments processed through secure gateway
- **Payment History** - Complete transaction records for users and drivers

### 9. Payment Verification

- **Status Tracking** - Backend tracks payment status: PENDING → COMPLETED/FAILED
- **Automatic Updates** - Payment status updated automatically via webhook
- **Notification System** - Users and drivers notified of payment status changes
- **Refund Handling** - Automated refund processing for cancelled bookings

### 10. Booking Status Tracking

- **Complete Lifecycle** - Booking statuses:
  - **PENDING** - Booking created, awaiting driver acceptance
  - **ACCEPTED** - Driver accepted the booking
  - **IN_PROGRESS** - Trip started, driver en route
  - **COMPLETED** - Trip successfully completed
  - **CANCELLED** - Booking cancelled by user or driver
- **Status Updates** - Real-time status updates via Socket.IO
- **History Tracking** - Complete booking history maintained

### 11. Access Control

- **Role-Based Features** - Features unlocked based on user role:
  - **USER** - Search, book, pay, review
  - **DRIVER** - Accept bookings, manage trips, view earnings
  - **ADMIN** - Manage users, drivers, bookings, system settings
- **Verification Status** - Drivers need admin approval for full access
- **Booking State** - Features available based on current booking state

### 12. Real-Time Tracking

- **GPS Location Updates** - Driver location tracked during active trips
- **Socket.IO Integration** - Real-time location updates via WebSocket
- **Live Map View** - Users can view driver location on map
- **Route Tracking** - Track driver's route from pickup to destination

### 13. Trip Management

- **Start Trip** - Drivers can start trip when they begin journey
- **Complete Trip** - Drivers mark trip as completed upon arrival
- **Status Updates** - Automatic status updates throughout trip lifecycle
- **Trip History** - Complete trip history for users and drivers

### 14. Review System

- **Post-Trip Reviews** - Users rate and review drivers after completed trips
- **Rating System** - 1-5 star rating system
- **Comment Feedback** - Users can provide detailed feedback
- **Review Display** - Reviews displayed on driver profiles

### 15. Results & Analytics

- **Booking Attempts** - All booking attempts recorded in system
- **Completion Rates** - Track booking completion rates
- **Ratings Analytics** - Average ratings and review statistics
- **Performance Feedback** - Detailed analytics for drivers and admins
- **Revenue Reports** - Financial reports and earnings tracking

---

## System Architecture Flow

```
User Registration → Email Verification → Login → Role Assignment
                                                      ↓
                                    ┌─────────────────┴─────────────────┐
                                    ↓                                   ↓
                            USER Role                          DRIVER Role
                                    ↓                                   ↓
                            Search Trucks                    Create Profile
                                    ↓                                   ↓
                            Calculate Fare                    Upload Documents
                                    ↓                                   ↓
                            Create Booking                    Admin Approval
                                    ↓                                   ↓
                            Payment Process                   Accept Booking
                                    ↓                                   ↓
                            Track Trip                        Start Trip
                                    ↓                                   ↓
                            Complete Trip                     Complete Trip
                                    ↓                                   ↓
                            Rate & Review                     View Earnings
```

---

## Technology Integration

- **JWT Authentication** - Secure token-based authentication
- **Socket.IO** - Real-time bidirectional communication
- **SSL Commerz** - Payment gateway integration
- **Google Maps API** - Location services and mapping
- **Prisma ORM** - Database management and queries
- **Cloudinary** - Image and document storage
- **Nodemailer** - Email notification system

---

## Security Features

- **Password Hashing** - bcryptjs for secure password storage
- **JWT Tokens** - Secure session management
- **HTTPS Protocols** - Encrypted data transmission
- **Role-Based Access** - Protected routes and features
- **Input Validation** - Server-side validation for all inputs
- **File Upload Security** - Secure document and image uploads

---

## Future Enhancements

See [Future Enhancements](./PROJECT_USER_MANUAL.md#-future-enhancements) section in PROJECT_USER_MANUAL.md for detailed roadmap.

---

## Related Documentation

- [README.md](./README.md) - Project overview and setup
- [PROJECT_USER_MANUAL.md](./PROJECT_USER_MANUAL.md) - Complete user manual
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Setup and configuration guide
- [API_DOCUMENTATION.md](./server/API_DOCUMENTATION.md) - API reference
