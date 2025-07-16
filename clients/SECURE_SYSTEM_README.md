# Secure Authentication System

This document describes the secure authentication system implemented for the truck booking platform.

## Overview

The system provides role-based access control with secure authentication using Redux for state management and middleware for route protection.

## Key Features

### 1. Secure Route Guard (`SecureRouteGuard`)
- **Location**: `src/components/auth/SecureRouteGuard.tsx`
- **Purpose**: Protects routes based on authentication status and user roles
- **Features**:
  - Checks Redux auth state for user information
  - Redirects unauthenticated users to login
  - Redirects authenticated users away from login/register pages
  - Enforces role-based access control
  - Shows loading states during authentication checks

### 2. Role-Based Access Control
- **ADMIN**: Access to `/dashboard/admin/*` routes
- **DRIVER**: Access to `/dashboard/driver/*` routes  
- **USER**: Access to `/dashboard/user/*` routes
- **All authenticated users**: Access to general `/dashboard` route

### 3. Middleware Protection
- **Location**: `middleware.ts`
- **Features**:
  - Protects all dashboard routes requiring authentication
  - Redirects authenticated users away from login/register pages
  - Enforces role-based route access
  - Allows public access to home, about, contact, and search pages

### 4. Redux State Management
- **Auth Slice**: Manages user authentication state
- **User Info**: Stores user data including role, name, email
- **Loading States**: Handles authentication loading states
- **Error Handling**: Manages authentication errors

## Route Protection Rules

### Public Routes (No Authentication Required)
- `/` - Home page
- `/about` - About page
- `/contact` - Contact page
- `/search` - Search page

### Protected Routes (Authentication Required)
- `/dashboard/*` - All dashboard routes
- `/profile` - User profile
- `/settings` - User settings

### Auth Routes (Redirect Authenticated Users)
- `/login` - Login page
- `/register` - Registration page

### Role-Specific Routes
- `/dashboard/admin/*` - Admin only
- `/dashboard/driver/*` - Driver only
- `/dashboard/user/*` - User only

## Implementation Details

### 1. Authentication Flow
1. User visits protected route
2. Middleware checks for auth token in cookies
3. If no token, redirects to login with return URL
4. After login, user is redirected to appropriate dashboard based on role
5. SecureRouteGuard validates access on client side

### 2. Role-Based Redirects
- **ADMIN**: Redirected to `/dashboard/admin`
- **DRIVER**: Redirected to `/dashboard/driver`
- **USER**: Redirected to `/dashboard/user`

### 3. Login/Register Page Behavior
- Authenticated users are automatically redirected to their role-based dashboard
- No manual redirects needed - handled by SecureRouteGuard

### 4. Dashboard Access
- All authenticated users can access the main `/dashboard` route
- Role-specific dashboards are protected by SecureRouteGuard
- Users are redirected to their appropriate dashboard if they try to access others

## Usage Examples

### Protecting a Route
```tsx
import SecureRouteGuard from '@/components/auth/SecureRouteGuard';

export default function AdminPage() {
  return (
    <SecureRouteGuard requiredRole="ADMIN">
      <div>Admin content</div>
    </SecureRouteGuard>
  );
}
```

### Requiring Authentication
```tsx
<SecureRouteGuard requireAuth={true}>
  <div>Protected content</div>
</SecureRouteGuard>
```

### Custom Fallback
```tsx
<SecureRouteGuard 
  requiredRole="ADMIN" 
  fallback={<div>Custom access denied message</div>}
>
  <div>Admin content</div>
</SecureRouteGuard>
```

## Security Features

### 1. Client-Side Protection
- SecureRouteGuard validates access on every route change
- Prevents unauthorized access to protected components
- Shows appropriate error messages for access denied

### 2. Server-Side Protection
- Middleware validates authentication before page loads
- Prevents direct URL access to protected routes
- Handles authentication redirects efficiently

### 3. State Management
- Redux provides centralized auth state
- Consistent authentication across the application
- Proper loading and error state handling

### 4. Cookie-Based Authentication
- Secure token storage in HTTP-only cookies
- Automatic token validation on page loads
- Proper logout handling with cookie cleanup

## Error Handling

### 1. Access Denied Scenarios
- Unauthenticated user accessing protected route
- User accessing role-restricted route
- Invalid or expired authentication token

### 2. Loading States
- Authentication check in progress
- Route validation loading
- User data fetching

### 3. Error Messages
- Clear access denied messages
- Role-specific permission errors
- Authentication failure notifications

## Best Practices

### 1. Always Use SecureRouteGuard
- Wrap all protected components
- Specify required roles when needed
- Provide meaningful fallback content

### 2. Handle Loading States
- Show loading indicators during auth checks
- Prevent premature content rendering
- Provide smooth user experience

### 3. Proper Error Handling
- Display user-friendly error messages
- Log errors for debugging
- Provide recovery options

### 4. Consistent Navigation
- Use role-based navigation menus
- Update navigation based on auth state
- Provide clear logout functionality

## Testing

### 1. Authentication Scenarios
- Test login/logout flows
- Verify role-based redirects
- Check access denied scenarios

### 2. Route Protection
- Test protected route access
- Verify middleware redirects
- Check role-specific access

### 3. Edge Cases
- Expired tokens
- Invalid user roles
- Network errors during auth

## Troubleshooting

### Common Issues

1. **Hydration Mismatch**
   - Ensure auth state is consistent between server and client
   - Use proper loading states

2. **Infinite Redirects**
   - Check middleware redirect logic
   - Verify SecureRouteGuard conditions

3. **Access Denied Errors**
   - Verify user role in Redux state
   - Check route protection rules

4. **Login Not Working**
   - Verify Redux auth slice
   - Check cookie storage
   - Validate API responses

## Future Enhancements

1. **Refresh Token Support**
   - Implement token refresh mechanism
   - Extend session duration

2. **Multi-Factor Authentication**
   - Add 2FA support
   - Enhanced security

3. **Session Management**
   - Multiple device support
   - Session timeout handling

4. **Audit Logging**
   - Track authentication events
   - Security monitoring

## Conclusion

This secure authentication system provides comprehensive protection for the truck booking platform while maintaining a smooth user experience. The combination of middleware protection, client-side validation, and role-based access control ensures that users can only access appropriate resources based on their authentication status and role. 