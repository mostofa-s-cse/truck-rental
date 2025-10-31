# Truck Rental System - Complete Setup Guide

## 🚀 Overview

This is a full-stack Truck Rental platform with three user roles (Admin, Driver, User), real-time features, payment processing, and comprehensive booking management.

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn
- Git

## 🏗️ Project Structure

```
sojib/
├── server/                 # Backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth & error handling
│   │   ├── routes/         # API routes
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema
│   └── package.json
├── clients/                # Frontend Next.js app
│   ├── src/
│   │   ├── app/           # Next.js 14 app router
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities & API client
│   │   └── types/         # TypeScript types
│   └── package.json
└── README.md
```

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sojib
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

**Configure `.env` file:**
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/truck_rental"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Server
PORT=3001
NODE_ENV=development

# Google Maps API (for distance calculation)
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Payment Gateway (optional)
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
```

**Initialize Database:**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

**Start Backend Server:**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 3. Frontend Setup

```bash
cd clients

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

**Configure `.env.local` file:**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Payment Gateway (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

**Start Frontend Development Server:**
```bash
npm run dev
```

## 🗄️ Database Schema

The system includes the following main entities:

### Core Models
- **User**: Authentication and user management
- **Driver**: Driver profiles and truck information
- **Booking**: Trip bookings and status tracking
- **Review**: User ratings and feedback
- **Message**: Real-time chat system
- **Payment**: Payment processing and tracking
- **SystemSetting**: Configurable system parameters

### Supporting Models
- **TruckCategory**: Truck types and pricing
- **Area**: Service areas and locations

## 🔐 User Roles & Permissions

### 👤 Admin
- Full system access and control
- User and driver management
- Booking reports and analytics
- System settings configuration
- Payment and refund processing
- Driver verification approval

### 🚛 Driver
- Profile and truck information management
- Availability status updates
- Booking request handling
- Real-time location sharing
- Earnings and trip history

### 👥 User
- Driver search and booking
- Trip tracking and communication
- Payment processing
- Review and rating system
- Booking history

## 🚀 Key Features

### Real-time Features
- **Live Chat**: User-driver communication
- **Booking Updates**: Real-time status changes
- **Location Tracking**: Driver GPS updates
- **Notifications**: Instant alerts and updates

### Payment System
- **Multiple Payment Methods**: Cash, Card, Mobile Banking
- **Secure Processing**: Encrypted payment data
- **Refund Management**: Admin-controlled refunds
- **Payment History**: Complete transaction records

### Advanced Booking
- **Dynamic Pricing**: Distance-based fare calculation
- **Driver Matching**: Smart driver selection
- **Status Tracking**: Complete booking lifecycle
- **Emergency Support**: Admin alert system

### Analytics & Reporting
- **Dashboard Analytics**: Real-time statistics
- **Revenue Reports**: Detailed financial insights
- **Driver Performance**: Rating and trip analysis
- **Booking Trends**: Usage pattern analysis

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### Drivers
- `GET /api/drivers/available` - Search available drivers
- `POST /api/drivers` - Create driver profile
- `PATCH /api/drivers/availability` - Update availability

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/me` - User bookings
- `GET /api/bookings/driver/me` - Driver bookings
- `PUT /api/bookings/:id` - Update booking

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/driver/:id` - Driver reviews
- `PUT /api/reviews/:id` - Update review

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - User conversations
- `PATCH /api/messages/:id/read` - Mark as read

### Payments
- `POST /api/payments` - Create payment
- `PATCH /api/payments/:id/status` - Update status
- `POST /api/payments/:id/refund` - Process refund

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/analytics/bookings` - Booking analytics
- `GET /api/admin/reports/revenue` - Revenue reports
- `PUT /api/admin/settings` - Update system settings

## 🔧 Development

### Backend Development

**Available Scripts:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

**Database Commands:**
```bash
npx prisma studio    # Open database GUI
npx prisma migrate   # Run migrations
npx prisma generate  # Generate client
npx prisma db seed   # Seed database
```

### Frontend Development

**Available Scripts:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
npm run type-check   # TypeScript check
```

## 🧪 Testing

### Backend Testing
```bash
cd server
npm run test
```

### Frontend Testing
```bash
cd clients
npm run test
```

## 🚀 Deployment

### Backend Deployment

1. **Environment Setup:**
   ```bash
   # Set production environment variables
   NODE_ENV=production
   DATABASE_URL="production-database-url"
   JWT_SECRET="production-jwt-secret"
   ```

2. **Database Migration:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Build and Start:**
   ```bash
   npm run build
   npm start
   ```

### Frontend Deployment

1. **Build Application:**
   ```bash
   npm run build
   ```

2. **Deploy to Platform:**
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS Amplify

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access Control**: Granular permissions
- **Input Validation**: Request data sanitization
- **Rate Limiting**: API abuse prevention
- **CORS Protection**: Cross-origin security
- **Password Hashing**: Bcrypt encryption

## 📊 Monitoring & Logging

- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Response time tracking
- **Activity Logs**: User action logging
- **Database Monitoring**: Query performance

## 🔄 Real-time Features

### WebSocket Events
- `booking_request`: New booking notifications
- `booking_status_update`: Status change alerts
- `new_message`: Chat message notifications
- `driver_location_update`: GPS location updates
- `payment_status_update`: Payment status changes

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries
- **Caching**: Redis integration (optional)
- **Image Optimization**: Next.js image optimization
- **Code Splitting**: Dynamic imports
- **CDN Integration**: Static asset delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the setup guide

## 🔮 Future Enhancements

- **Mobile App**: React Native application
- **AI Integration**: Smart driver matching
- **Advanced Analytics**: Machine learning insights
- **Multi-language Support**: Internationalization
- **Advanced Payment**: Cryptocurrency support
- **IoT Integration**: Smart truck monitoring

---

## 🎯 Quick Start Checklist

- [ ] Install Node.js and MySQL
- [ ] Clone repository
- [ ] Set up backend environment
- [ ] Configure database
- [ ] Run migrations
- [ ] Set up frontend environment
- [ ] Start both servers
- [ ] Test basic functionality
- [ ] Configure payment gateway (optional)
- [ ] Set up Google Maps API
- [ ] Deploy to production

The system is now ready for development and production use! 🚀 