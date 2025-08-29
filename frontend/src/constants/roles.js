// Standardized role constants to ensure consistency across the application
export const USER_ROLES = {
  PLAYER: 'Player',
  VENUE_OWNER: 'VenueOwner',
  ADMIN: 'Admin'
};

// Role display names for UI
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.PLAYER]: 'Player',
  [USER_ROLES.VENUE_OWNER]: 'Venue Owner',
  [USER_ROLES.ADMIN]: 'Admin'
};

// Role-specific route mappings
export const ROLE_ROUTES = {
  [USER_ROLES.PLAYER]: '/dashboard',
  [USER_ROLES.VENUE_OWNER]: '/dashboard',
  [USER_ROLES.ADMIN]: '/admin'
};

// Helper function to get dashboard route for a role
export const getDashboardRoute = (role) => {
  return ROLE_ROUTES[role] || '/dashboard';
};

// Helper function to validate role
export const isValidRole = (role) => {
  return Object.values(USER_ROLES).includes(role);
};
