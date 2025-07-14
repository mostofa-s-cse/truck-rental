# Dashboard System Documentation

## Overview

The TruckBook platform features a unified dashboard system with role-based access control. All dashboards share the same layout structure but display different content and navigation menus based on user roles.

## Architecture

### Unified Dashboard Layout (`DashboardLayout.tsx`)

The `DashboardLayout` component provides a consistent interface across all dashboard types:

- **Sidebar**: Role-based navigation menu with collapsible submenus
- **Topbar**: User menu, notifications, and mobile menu toggle
- **Main Content**: Dynamic content area for each dashboard type
- **Footer**: Consistent footer across all dashboards

### Role-Based Menu System

The sidebar automatically adapts based on user role:

#### Admin Menu
- **Overview**: Platform analytics and key metrics
- **User Management**: All users, drivers, customers
- **Truck Management**: All trucks, categories, add truck
- **Bookings**: All bookings, pending, completed, cancelled
- **Payments**: All payments, pending, completed, refunds
- **Reviews**: Customer and driver reviews
- **Reports**: Analytics, earnings, bookings, users
- **System**: Settings, areas, logs, backups

#### Driver Menu
- **Dashboard**: Driver overview and stats
- **Profile**: Personal info, documents, settings
- **Truck**: My truck, maintenance, documents
- **Bookings**: Active, pending, completed, history
- **Earnings**: Overview, transactions, withdrawals, tax
- **Location**: Live tracking, service areas, availability
- **Support**: Help center, contact support, emergency

#### User Menu
- **Dashboard**: User overview and quick actions
- **Search Trucks**: Find available trucks
- **My Bookings**: Active, upcoming, completed, cancelled
- **Favorites**: Saved drivers and trucks
- **Payments**: Payment methods, transaction history, invoices
- **Profile**: Personal info, addresses, preferences
- **Support**: Help center, contact support, FAQ

## Dashboard Pages

### 1. Admin Dashboard (`/admin`)
**File**: `src/app/admin/page.tsx`

**Features**:
- Platform statistics (users, drivers, bookings, revenue)
- Revenue and booking status charts
- Recent bookings table with actions
- Pending driver verifications
- Quick action buttons

**Key Components**:
- Stats cards with trend indicators
- Interactive charts using Chart.js
- Data tables with sorting and filtering
- Action buttons for common tasks

### 2. Driver Dashboard (`/driver`)
**File**: `src/app/driver/page.tsx`

**Features**:
- Availability toggle (online/offline)
- Earnings and performance metrics
- Weekly earnings chart
- Customer ratings distribution
- Recent bookings with status
- Vehicle status monitoring
- Quick action buttons

**Key Components**:
- Real-time availability toggle
- Earnings tracking and visualization
- Booking management interface
- Vehicle health monitoring

### 3. User Dashboard (`/dashboard`)
**File**: `src/app/dashboard/page.tsx`

**Features**:
- Quick truck search interface
- Booking statistics and spending trends
- Recent booking history
- Nearby available drivers
- Monthly spending chart
- Booking status overview

**Key Components**:
- Search form for quick bookings
- Driver discovery and contact
- Booking history and ratings
- Spending analytics

## Technical Implementation

### State Management
- Uses Redux Toolkit for global state
- Role-based access control through auth slice
- Real-time updates for availability and bookings

### Responsive Design
- Mobile-first approach with responsive breakpoints
- Collapsible sidebar for mobile devices
- Touch-friendly interface elements

### Data Flow
1. User authentication determines role
2. DashboardLayout renders appropriate menu
3. Dashboard pages fetch role-specific data
4. Real-time updates via WebSocket (planned)

### Styling
- Tailwind CSS for consistent design
- Heroicons for iconography
- Custom color schemes for each role
- Dark sidebar with light content area

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx              # Admin dashboard
│   ├── driver/
│   │   └── page.tsx              # Driver dashboard
│   └── dashboard/
│       └── page.tsx              # User dashboard
├── components/
│   └── ui/
│       ├── DashboardLayout.tsx   # Unified layout component
│       ├── Chart.tsx             # Chart component
│       └── Navigation.tsx        # Updated navigation
└── hooks/
    ├── useAuth.ts                # Authentication hook
    └── useUI.ts                  # UI state management
```

## Usage Examples

### Accessing Dashboards
```typescript
// Role-based routing
const getDashboardLink = () => {
  switch (user.role) {
    case 'admin': return '/admin';
    case 'driver': return '/driver';
    case 'user': return '/dashboard';
    default: return '/dashboard';
  }
};
```

### Using DashboardLayout
```typescript
import DashboardLayout from '@/components/ui/DashboardLayout';

const MyDashboard = () => {
  return (
    <DashboardLayout title="My Dashboard" subtitle="Optional subtitle">
      {/* Dashboard content */}
    </DashboardLayout>
  );
};
```

### Chart Integration
```typescript
import Chart from '@/components/ui/Chart';

const MyChart = () => {
  const data = [
    { label: 'Jan', value: 100, color: '#3b82f6' },
    { label: 'Feb', value: 150, color: '#22c55e' }
  ];

  return <Chart data={data} type="bar" />;
};
```

## Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSocket integration for live data
2. **Advanced Analytics**: More detailed charts and reports
3. **Mobile App**: Native mobile applications
4. **Push Notifications**: Real-time alerts and updates
5. **Multi-language Support**: Internationalization
6. **Dark Mode**: Theme switching capability

### Performance Optimizations
1. **Lazy Loading**: Component-level code splitting
2. **Caching**: API response caching
3. **Image Optimization**: Next.js image optimization
4. **Bundle Splitting**: Route-based code splitting

## Security Considerations

### Access Control
- Role-based route protection
- API endpoint authorization
- Session management
- CSRF protection

### Data Privacy
- User data encryption
- GDPR compliance
- Audit logging
- Data retention policies

## Troubleshooting

### Common Issues
1. **Menu not showing**: Check user role in auth state
2. **Charts not rendering**: Verify data format matches Chart component
3. **Responsive issues**: Check Tailwind breakpoints
4. **Navigation errors**: Verify route permissions

### Debug Mode
Enable debug logging in development:
```typescript
// In development environment
const DEBUG = process.env.NODE_ENV === 'development';
```

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository. 