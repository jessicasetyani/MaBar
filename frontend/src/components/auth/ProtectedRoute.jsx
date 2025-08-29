import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

// Security event logging for route protection
const logSecurityEvent = (event, details = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    event,
    timestamp,
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...details
  };

  console.log(`[ROUTE_SECURITY] ${event}:`, logEntry);
};

/**
 * Production-grade protected route component with role-based access control
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render if authorized
 * @param {string} props.requiredRole - Minimum role required to access the route
 * @param {string[]} props.requiredPermissions - Specific permissions required
 * @param {string} props.redirectTo - Where to redirect unauthorized users
 * @param {React.ReactNode} props.fallback - Component to show while loading
 * @param {boolean} props.requireOnboarding - Whether user must complete onboarding
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  requiredPermissions = [],
  redirectTo = '/login',
  fallback = <LoadingSpinner />,
  requireOnboarding = false
}) => {
  const { 
    user, 
    loading, 
    isAuthenticated, 
    hasRole, 
    hasPermission,
    authError 
  } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return fallback;
  }

  // Handle authentication errors with security logging
  if (authError) {
    logSecurityEvent('auth.error.route_access', {
      error: authError,
      attemptedRoute: location.pathname,
      requiredRole,
      requiredPermissions
    });

    console.error('ProtectedRoute: Authentication error:', authError);
    return (
      <Navigate
        to={redirectTo}
        state={{
          from: location,
          error: 'Authentication failed. Please log in again.'
        }}
        replace
      />
    );
  }

  // Redirect to login if not authenticated with security logging
  if (!isAuthenticated || !user) {
    logSecurityEvent('auth.unauthorized.route_access', {
      attemptedRoute: location.pathname,
      requiredRole,
      requiredPermissions,
      isAuthenticated,
      hasUser: !!user
    });

    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return (
      <Navigate
        to={redirectTo}
        state={{
          from: location,
          message: 'Please log in to access this page.'
        }}
        replace
      />
    );
  }

  // Check if onboarding is required but not completed
  if (requireOnboarding && !user.onboarding_completed) {
    console.log('ProtectedRoute: Onboarding required, redirecting to onboarding');
    return (
      <Navigate 
        to="/onboarding" 
        state={{ 
          from: location,
          message: 'Please complete your profile setup.' 
        }} 
        replace 
      />
    );
  }

  // Check role-based authorization
  if (requiredRole && !hasRole(requiredRole)) {
    console.log(`ProtectedRoute: Insufficient role - required: ${requiredRole}, user has: ${user.role}`);
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          from: location,
          message: `Access denied. This page requires ${requiredRole} privileges.`,
          requiredRole,
          userRole: user.role
        }} 
        replace 
      />
    );
  }

  // Check permission-based authorization
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(permission => !hasPermission(permission));
      console.log(`ProtectedRoute: Missing permissions:`, missingPermissions);
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            from: location,
            message: 'Access denied. You do not have the required permissions.',
            missingPermissions
          }} 
          replace 
        />
      );
    }
  }

  // All checks passed, render the protected content
  console.log(`ProtectedRoute: Access granted for user ${user.id} with role ${user.role}`);
  return children;
};

export default ProtectedRoute;
