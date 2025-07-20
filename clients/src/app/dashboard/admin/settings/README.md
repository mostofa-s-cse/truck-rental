# Admin Settings Page

## Overview
The admin settings page provides a comprehensive interface for managing system configuration settings. It allows administrators to view, edit, and manage various system parameters that control the behavior of the truck booking platform.

## Features

### 🏷️ **Categorized Settings**
Settings are organized into logical categories for easy navigation:
- **General Settings**: App version, maintenance mode, support contacts
- **Business Settings**: Pricing, fees, payment methods
- **Notifications**: Email, SMS, and push notification settings
- **Security**: Login attempts, session timeouts, lockout settings
- **Driver Settings**: Driver verification, rating limits
- **Booking Settings**: Timeouts, limits, auto-cancellation
- **Feature Flags**: Enable/disable system features

### 🔍 **Search Functionality**
- Real-time search across all settings
- Search by setting name or key
- Clear search with one click
- Shows search results count

### ✏️ **Inline Editing**
- Click "Edit" to modify any setting
- Different input types based on setting type:
  - **Text**: Standard text input
  - **Number**: Numeric input with validation
  - **Boolean**: Yes/No dropdown
  - **JSON**: Multi-line textarea for complex data
- Save/Cancel buttons for each edit operation

### 📱 **Responsive Design**
- Mobile-friendly interface
- Responsive grid layout for category navigation
- Optimized for all screen sizes

## Setting Types

### Text Settings
- **Examples**: App version, support email, support phone
- **Input**: Standard text input
- **Validation**: Basic text validation

### Number Settings
- **Examples**: Base fare per km, minimum fare, timeouts
- **Input**: Numeric input with step validation
- **Validation**: Number format validation

### Boolean Settings
- **Examples**: Maintenance mode, feature flags
- **Input**: Yes/No dropdown
- **Display**: "Yes" or "No" text

### JSON Settings
- **Examples**: Payment methods, complex configurations
- **Input**: Multi-line textarea
- **Display**: Formatted JSON with syntax highlighting
- **Validation**: JSON format validation

## API Integration

The settings page integrates with the following API endpoints:

- `GET /admin/settings` - Fetch all system settings
- `PUT /admin/settings` - Update a specific setting

### Setting Structure
```typescript
interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  updatedAt: string;
}
```

## Usage

### Accessing the Settings Page
1. Navigate to the admin dashboard
2. Click on "System Settings" in the sidebar
3. The page will load with the General Settings category active

### Editing a Setting
1. Find the setting you want to modify
2. Click the "Edit" button
3. Modify the value using the appropriate input type
4. Click "Save" to apply changes or "Cancel" to discard

### Searching Settings
1. Use the search box in the top-right corner
2. Type any part of the setting name or key
3. Results will filter in real-time
4. Click the X button to clear the search

### Switching Categories
1. Click on any category card in the top section
2. The settings list will update to show only that category's settings
3. The active category is highlighted in blue

## Security

- **Role-based Access**: Only users with ADMIN role can access this page
- **Protected Route**: Uses `ProtectedRoute` component for authentication
- **API Authorization**: All API calls require admin authentication

## Error Handling

- **Network Errors**: Displays error toast for failed API calls
- **Validation Errors**: Shows validation messages for invalid inputs
- **Loading States**: Shows spinner during data fetching
- **Empty States**: Displays appropriate messages when no settings are found

## Future Enhancements

- [ ] Bulk update functionality
- [ ] Setting history/audit trail
- [ ] Export/import settings
- [ ] Setting templates
- [ ] Advanced validation rules
- [ ] Setting dependencies
- [ ] Real-time updates via WebSocket

## Technical Details

### Components Used
- `DashboardLayout`: Main layout wrapper
- `ProtectedRoute`: Authentication guard
- `useSweetAlert`: Toast notifications
- `adminApi`: API client for settings operations

### State Management
- Local state for settings data
- Edit mode state management
- Search and filtering state
- Category selection state

### Styling
- Tailwind CSS for styling
- Heroicons for icons
- Responsive design patterns
- Consistent with admin dashboard theme 