import React from 'react';
import ProtectedRoute from './ProtectedRoute';
import { ROLE_CONSTANTS } from '../../constants/roles';

/**
 * Convenience components for role-based route protection
 */

// Admin-only routes
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute 
    requiredRole={ROLE_CONSTANTS.ADMIN} 
    requireOnboarding={true}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

// Venue Owner routes (includes Admin access)
export const VenueOwnerRoute = ({ children, ...props }) => (
  <ProtectedRoute 
    requiredRole={ROLE_CONSTANTS.VENUE_OWNER} 
    requireOnboarding={true}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

// Player routes (includes Venue Owner and Admin access)
export const PlayerRoute = ({ children, ...props }) => (
  <ProtectedRoute 
    requiredRole={ROLE_CONSTANTS.PLAYER} 
    requireOnboarding={true}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

// Any authenticated user (no specific role required)
export const AuthenticatedRoute = ({ children, ...props }) => (
  <ProtectedRoute {...props}>
    {children}
  </ProtectedRoute>
);

// Routes that require onboarding completion
export const OnboardedRoute = ({ children, ...props }) => (
  <ProtectedRoute 
    requireOnboarding={true}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Permission-based route protection
 */
export const PermissionRoute = ({ permissions, children, ...props }) => (
  <ProtectedRoute 
    requiredPermissions={permissions}
    requireOnboarding={true}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Venue management routes
 */
export const VenueManagementRoute = ({ children, ...props }) => (
  <PermissionRoute 
    permissions={['manage_venues', 'view_bookings']}
    {...props}
  >
    {children}
  </PermissionRoute>
);

/**
 * Booking management routes
 */
export const BookingManagementRoute = ({ children, ...props }) => (
  <PermissionRoute 
    permissions={['manage_bookings']}
    {...props}
  >
    {children}
  </PermissionRoute>
);

/**
 * User management routes (Admin only)
 */
export const UserManagementRoute = ({ children, ...props }) => (
  <PermissionRoute 
    permissions={['manage_users']}
    {...props}
  >
    {children}
  </PermissionRoute>
);

export default {
  AdminRoute,
  VenueOwnerRoute,
  PlayerRoute,
  AuthenticatedRoute,
  OnboardedRoute,
  PermissionRoute,
  VenueManagementRoute,
  BookingManagementRoute,
  UserManagementRoute
};
