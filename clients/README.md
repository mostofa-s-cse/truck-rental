# Truck Rental Client

Frontend application for the Truck Rental platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Modern UI**: Beautiful and responsive design with Tailwind CSS
- **Authentication**: Complete login/register system with role-based access
- **Real-time Updates**: Socket.IO integration for live updates
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark themes
- **Multi-language**: Support for English and Bengali (optional)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Navigate to the clients directory:
```bash
cd clients
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update the `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the Application

### Development
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── login/          # Login page
│   ├── register/       # Register page
│   ├── dashboard/      # User dashboard
│   ├── driver/         # Driver pages
│   ├── admin/          # Admin pages
│   └── layout.tsx      # Root layout
├── components/         # Reusable components
│   └── ui/            # UI components
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── lib/               # Utilities and configurations
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## Key Components

### Authentication
- `AuthContext`: Manages user authentication state
- `LoginPage`: User login form
- `RegisterPage`: User registration form

### UI Components
- `Button`: Reusable button component with variants
- Navigation components
- Form components

### Pages
- **Home**: Landing page with features and call-to-action
- **Login/Register**: Authentication pages
- **Dashboard**: User-specific dashboard based on role
- **Driver Pages**: Driver profile and management
- **Admin Pages**: Admin dashboard and controls

## API Integration

The application uses a centralized API client (`src/lib/api.ts`) that handles:

- Authentication requests
- Driver management
- Booking operations
- Real-time updates via Socket.IO

## Styling

The application uses Tailwind CSS for styling with:

- Custom color scheme
- Responsive design
- Dark mode support
- Component variants

## State Management

- **React Context**: For authentication and global state
- **Local State**: For component-specific state
- **Server State**: Managed through API calls

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
