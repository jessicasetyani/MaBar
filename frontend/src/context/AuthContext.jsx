import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { USER_ROLES } from '../constants/roles';

// Production-grade authentication configuration
const AUTH_CONFIG = {
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh token 5 minutes before expiry
  TOKEN_CHECK_INTERVAL: 60 * 1000, // Check token validity every minute
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours max session
  SECURITY_EVENTS: {
    LOGIN_SUCCESS: 'auth.login.success',
    LOGIN_FAILURE: 'auth.login.failure',
    LOGOUT: 'auth.logout',
    TOKEN_REFRESH: 'auth.token.refresh',
    TOKEN_EXPIRED: 'auth.token.expired',
    UNAUTHORIZED_ACCESS: 'auth.unauthorized.access'
  }
};

// Security event logging for audit trail
const logSecurityEvent = (event, details = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    event,
    timestamp,
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...details
  };

  console.log(`[SECURITY] ${event}:`, logEntry);

  // In production, this would send to a security monitoring service
  // For development, we log to console for demonstration
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);

  // Refs for production-grade token management
  const tokenCheckInterval = useRef(null);
  const retryAttempts = useRef(0);

  // Production-grade token validation
  const validateToken = useCallback(async (token) => {
    if (!token) return false;

    try {
      // Decode JWT to check expiration (client-side check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token expires within threshold
      if (payload.exp - currentTime < AUTH_CONFIG.TOKEN_REFRESH_THRESHOLD / 1000) {
        console.log('AuthContext: Token expires soon, attempting refresh');
        return await refreshToken();
      }

      return payload.exp > currentTime;
    } catch (error) {
      console.error('AuthContext: Token validation error:', error);
      return false;
    }
  }, []);

  // Production-grade token refresh logic
  const refreshToken = useCallback(async () => {
    if (tokenRefreshing) {
      console.log('AuthContext: Token refresh already in progress');
      return false;
    }

    setTokenRefreshing(true);
    setAuthError(null);

    try {
      const response = await fetch('/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('AuthContext: Token refreshed successfully');
          retryAttempts.current = 0;
          return true;
        }
      }

      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('AuthContext: Token refresh error:', error);
      retryAttempts.current++;

      if (retryAttempts.current >= AUTH_CONFIG.MAX_RETRY_ATTEMPTS) {
        console.log('AuthContext: Max retry attempts reached, logging out');
        await logout();
      }

      return false;
    } finally {
      setTokenRefreshing(false);
    }
  }, [tokenRefreshing]);

  // Production-grade token monitoring
  const startTokenMonitoring = useCallback(() => {
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current);
    }

    tokenCheckInterval.current = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const isValid = await validateToken(token);
        if (!isValid) {
          console.log('AuthContext: Token validation failed during monitoring');
          await logout();
        }
      }
    }, AUTH_CONFIG.TOKEN_CHECK_INTERVAL);
  }, [validateToken]);

  // Stop token monitoring
  const stopTokenMonitoring = useCallback(() => {
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current);
      tokenCheckInterval.current = null;
    }
  }, []);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();

    // Cleanup on unmount
    return () => {
      stopTokenMonitoring();
    };
  }, [checkAuthStatus, stopTokenMonitoring]);

  const checkAuthStatus = useCallback(async () => {
    console.log('AuthContext: Starting auth check...');
    try {
      // Check for token in URL parameters (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');

      if (urlToken) {
        console.log('AuthContext: Found token in URL');
        localStorage.setItem('token', urlToken);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = localStorage.getItem('token');
      console.log('AuthContext: Token from localStorage:', token ? 'exists' : 'none');

      if (!token) {
        console.log('AuthContext: No token, setting unauthenticated state');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Validate token before making request (production-grade)
      const isValidToken = await validateToken(token);
      if (!isValidToken) {
        console.log('AuthContext: Invalid or expired token');
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      console.log('AuthContext: Making request to /auth/status with validated token');
      const response = await fetch('/auth/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('AuthContext: Response status:', response.status);
      const data = await response.json();
      console.log('AuthContext: Response data:', data);

      if (data.isAuthenticated || data.is_authenticated) {
        console.log('AuthContext: User authenticated', data.user);
        // Batch state updates to prevent multiple re-renders
        setUser(data.user);
        setIsAuthenticated(true);
        setAuthError(null);

        // Start production-grade token monitoring
        startTokenMonitoring();
      } else {
        console.log('AuthContext: User not authenticated');
        localStorage.removeItem('token');
        // Batch state updates to prevent multiple re-renders
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (provider) => {
    // Redirect to OAuth provider
    window.location.href = `/auth/${provider}`;
  };

  const emailLogin = async (email, password) => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Security event logging
        logSecurityEvent(AUTH_CONFIG.SECURITY_EVENTS.LOGIN_SUCCESS, {
          email,
          role: data.user?.role,
          userId: data.user?.id
        });

        // Store JWT token securely
        localStorage.setItem('token', data.token);

        // Update authentication state
        setUser(data.user);
        setIsAuthenticated(true);
        setAuthError(null);

        // Start token monitoring for this session
        startTokenMonitoring();

        console.log('AuthContext: Email login successful');
        return { success: true, user: data.user };
      } else {
        // Security event logging for failed login
        logSecurityEvent(AUTH_CONFIG.SECURITY_EVENTS.LOGIN_FAILURE, {
          email,
          error: data.message,
          statusCode: response.status
        });

        console.log('AuthContext: Email login failed:', data.message);
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      // Security event logging for network errors
      logSecurityEvent(AUTH_CONFIG.SECURITY_EVENTS.LOGIN_FAILURE, {
        email,
        error: error.message,
        type: 'network_error'
      });

      console.error('AuthContext: Login network error:', error);
      setAuthError('Network error occurred during login');
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const emailRegister = async (email, password, firstName, lastName) => {
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          password, 
          first_name: firstName, 
          last_name: lastName 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT token
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Email registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await fetch('/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const setUserRole = async (role) => {
    try {
      console.log('AuthContext: Setting user role to:', role);
      const token = localStorage.getItem('token');
      const response = await fetch('/auth/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });

      console.log('AuthContext: Role setting response status:', response.status);

      if (response.ok) {
        // Update user state with new role
        setUser(prev => ({ ...prev, role }));
        console.log('AuthContext: User role updated successfully to:', role);
        return { success: true };
      } else {
        const data = await response.json();
        console.error('AuthContext: Role setting failed:', data);
        return { success: false, error: data.message || 'Failed to set role' };
      }
    } catch (error) {
      console.error('Set role error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Starting secure logout process');

      // Call backend logout endpoint to invalidate token server-side
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch('/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          console.log('AuthContext: Server-side logout completed');
        } catch (error) {
          console.warn('AuthContext: Server-side logout failed, continuing with client cleanup:', error);
        }
      }

      // Comprehensive client-side cleanup
      // Remove from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authState');

      // Remove from sessionStorage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('authState');

      // Clear any auth-related cookies (if any exist)
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Reset auth state
      setUser(null);
      setIsAuthenticated(false);

      console.log('AuthContext: Secure logout completed - all auth data cleared');

    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      // Even if logout fails, clear local state for security
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const updatePlayerProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/player', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const data = await response.json();
        // Update user state with new profile
        setUser(prev => ({ ...prev, profile: data.profile }));
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Player profile update failed');
      }
    } catch (error) {
      console.error('Player profile update error:', error);
      throw error;
    }
  };

  const getPlayerProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/player', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.profile;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get player profile');
      }
    } catch (error) {
      console.error('Get player profile error:', error);
      throw error;
    }
  };

  const updateSkillAssessment = async (skillData) => {
    try {
      const response = await fetch('/api/profile/skill-assessment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(skillData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data;
      } else {
        throw new Error('Skill assessment update failed');
      }
    } catch (error) {
      console.error('Skill assessment error:', error);
      throw error;
    }
  };

  const updateVenueDetails = async (venueData) => {
    try {
      const response = await fetch('/api/profile/venue-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(venueData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data;
      } else {
        throw new Error('Venue details update failed');
      }
    } catch (error) {
      console.error('Venue details error:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      const response = await fetch('/api/profile/complete-onboarding', {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data;
      } else {
        throw new Error('Onboarding completion failed');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      throw error;
    }
  };

  // Production-grade context value with performance optimization
  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    authError,
    tokenRefreshing,
    login,
    emailLogin,
    emailRegister,
    setUserRole,
    adminLogin,
    logout,
    updateProfile,
    updatePlayerProfile,
    getPlayerProfile,
    updateSkillAssessment,
    updateVenueDetails,
    completeOnboarding,
    checkAuthStatus,
    validateToken,
    refreshToken,
    // Production-grade role checking
    hasRole: (requiredRole) => {
      if (!user?.role) return false;
      const roleHierarchy = {
        [USER_ROLES.PLAYER]: 1,
        [USER_ROLES.VENUE_OWNER]: 2,
        [USER_ROLES.ADMIN]: 3
      };
      return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    },
    // Production-grade permission checking
    hasPermission: (permission) => {
      if (!user?.role) return false;
      const rolePermissions = {
        [USER_ROLES.PLAYER]: ['view_profile', 'book_venues', 'view_bookings'],
        [USER_ROLES.VENUE_OWNER]: ['view_profile', 'book_venues', 'view_bookings', 'manage_venues'],
        [USER_ROLES.ADMIN]: ['view_profile', 'book_venues', 'view_bookings', 'manage_venues', 'manage_users', 'view_reports']
      };
      return rolePermissions[user.role]?.includes(permission) || false;
    }
  }), [
    user,
    loading,
    isAuthenticated,
    authError,
    tokenRefreshing,
    login,
    emailLogin,
    emailRegister,
    setUserRole,
    adminLogin,
    logout,
    updateProfile,
    updatePlayerProfile,
    getPlayerProfile,
    updateSkillAssessment,
    updateVenueDetails,
    completeOnboarding,
    checkAuthStatus,
    validateToken,
    refreshToken
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
