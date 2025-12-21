# Truck Rental Platform

A full-stack web application for connecting drivers with users through an organized truck rental platform. Built with modern technologies and featuring real-time updates, role-based access control, and a beautiful user interface.

## 🚀 Features

### Core Functionality

- **Multi-role System**: Admin, Driver, and User roles with specific permissions
- **Real-time Updates**: Live tracking and instant notifications via Socket.IO
- **Dynamic Fare Calculation**: Real-time pricing based on distance and truck type
- **Driver Verification**: Admin approval system for driver accounts
- **Booking Management**: Complete booking lifecycle with status tracking
- **Review System**: User ratings and reviews for drivers

### Technical Features

- **TypeScript**: Full type safety across frontend and backend
- **Modern UI**: Responsive design with Tailwind CSS
- **Real-time Communication**: Socket.IO for live updates
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT-based auth with role-based access
- **File Upload**: Support for driver documents and images

## 🏗️ Architecture

```
sojib/
├── server/          # Backend API (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Custom middleware
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utility functions
│   └── prisma/      # Database schema and migrations
└── clients/         # Frontend (Next.js + TypeScript)
    └── src/
        ├── app/         # Next.js app directory
        ├── components/  # Reusable components
        ├── contexts/    # React contexts
        ├── lib/         # API client and utilities
        └── types/       # TypeScript types
```

## 🛠️ Tech Stack

### Backend

- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma** ORM with MySQL
- **JWT** for authentication
- **Socket.IO** for real-time updates
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **Cloudinary** for image storage

### Frontend

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **Axios** for API calls
- **Socket.IO Client** for real-time updates
- **Lucide React** for icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sojib
```

### 2. Set Up Backend

```bash
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

### 3. Set Up Frontend

```bash
cd ../clients

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Prisma Studio: http://localhost:5555 (run `npm run db:studio`)

## 👥 User Roles

### Admin

- Approve/reject driver registrations
- Manage user and driver data
- View booking reports and analytics
- Control pricing formulas
- Monitor system activity

### Driver

- Create and manage profile
- Provide truck information (type, capacity, quality)
- Update availability status
- View and respond to booking requests
- Set working area preferences

### User

- Search available drivers
- Filter by truck type, capacity, and location
- View driver profiles and ratings
- Calculate fare before booking
- Book trucks and track status
- Rate and review drivers

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
DATABASE_URL="mysql://username:password@localhost:3306/truck_rental"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password

### Drivers

- `GET /api/drivers/search` - Search available drivers
- `POST /api/drivers/profile` - Create driver profile
- `PUT /api/drivers/profile` - Update driver profile
- `GET /api/drivers/profile` - Get driver profile
- `PUT /api/drivers/availability` - Update availability
- `PUT /api/drivers/location` - Update location

### Admin

- `GET /api/drivers/all` - Get all drivers
- `PUT /api/drivers/verify/:driverId` - Verify driver

## 🗄️ Database Schema

The application uses the following main entities:

- **User**: Base user information with role-based access
- **Driver**: Driver-specific information and truck details
- **Booking**: Booking records with status tracking
- **Review**: User reviews for drivers
- **Message**: Chat messages between users
- **TruckCategory**: Truck type configurations
- **Area**: Service area definitions

## 🔄 Real-time Features

### Socket.IO Events

- `join` - Join user to their room
- `booking-update` - Update booking status
- `location-update` - Update driver location
- `send-message` - Send chat message

## 🎨 UI/UX Features

- **Responsive Design**: Works on all device sizes
- **Dark Mode**: Toggle between light and dark themes
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client and server-side validation
- **Accessibility**: WCAG compliant components

## 🚀 Deployment

### Backend Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, Vercel, AWS, etc.)

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation in each folder
2. Review the README files for setup instructions
3. Open an issue on GitHub
4. Contact the development team

## 🔮 System Future

### System Workflow & Features

- **Authentication** - User registration/login with JWT sessions
- **User Role** - Users assigned USER/DRIVER/ADMIN roles
- **Admin Approval** - Pending drivers reviewed before access granted
- **Driver Profile Creation** - Drivers manage truck information, documents, and availability
- **Truck Search & Discovery** - Users search available trucks by location, type, and capacity
- **Fare Calculation** - Real-time pricing based on distance, truck type, weight, and urgency
- **Booking Process** - Custom booking system with driver acceptance workflow
- **Payment Process** - Custom checkout with SSL Commerz gateway integration
- **Payment Verification** - Backend tracks PENDING → COMPLETED/FAILED status
- **Booking Status Tracking** - Complete lifecycle: PENDING → ACCEPTED → IN_PROGRESS → COMPLETED → CANCELLED
- **Access Control** - Features unlocked based on role, verification status, and booking state
- **Real-time Tracking** - GPS location updates during active trips via Socket.IO
- **Trip Management** - Drivers start and complete trips with status updates
- **Review System** - Users rate and review drivers after completed trips
- **Results & Analytics** - Booking attempts recorded with completion rates, ratings, and performance feedback

## 🔮 Future Enhancements

- **Payment Integration**: SSLcommerz or custom payment gateway
- **Google Maps Integration**: Real-time location tracking
- **Multi-language Support**: English and Bengali
- **Mobile App**: React Native or Flutter app
- **Advanced Analytics**: Detailed reporting and insights
- **Push Notifications**: Real-time alerts
- **Emergency Contact**: Admin alert system
