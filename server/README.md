# Truck Rental Server

Backend server for the Truck Rental application built with Node.js, Express, Prisma, and TypeScript.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **User Management**: Support for Admin, Driver, and User roles
- **Driver Management**: Driver profiles, verification, and availability tracking
- **Booking System**: Complete booking lifecycle management
- **Real-time Updates**: Socket.IO integration for live updates
- **Database**: MySQL with Prisma ORM
- **TypeScript**: Full TypeScript support with type safety

## Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn

## Installation

1. Clone the repository and navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
DATABASE_URL="mysql://username:password@localhost:3306/truck_rental"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
```

5. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/change-password` - Change password (protected)

### Drivers
- `POST /api/drivers/profile` - Create driver profile (DRIVER role)
- `PUT /api/drivers/profile` - Update driver profile (DRIVER role)
- `GET /api/drivers/profile` - Get driver profile (DRIVER role)
- `PUT /api/drivers/availability` - Update availability (DRIVER role)
- `PUT /api/drivers/location` - Update location (DRIVER role)
- `GET /api/drivers/search` - Search available drivers (public)
- `PUT /api/drivers/verify/:driverId` - Verify driver (ADMIN role)
- `GET /api/drivers/all` - Get all drivers (ADMIN role)

## Database Schema

The application uses the following main entities:

- **User**: Base user information with role-based access
- **Driver**: Driver-specific information and truck details
- **Booking**: Booking records with status tracking
- **Review**: User reviews for drivers
- **Message**: Chat messages between users
- **TruckCategory**: Truck type configurations
- **Area**: Service area definitions

## Socket.IO Events

- `join` - Join user to their room
- `booking-update` - Update booking status
- `location-update` - Update driver location
- `send-message` - Send chat message

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 