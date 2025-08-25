import { useMemo } from 'react';

/**
 * Custom hook for generating welcome messages based on user role
 * @param {Object} user - User object containing role and profile information
 * @returns {Object} Welcome message data including title, subtitle, and features
 */
export const useWelcomeMessage = (user) => {
  return useMemo(() => {
    if (!user) {
      return {
        title: 'Welcome to MaBar! 🏓',
        subtitle: 'Let\'s get you started',
        features: []
      };
    }

    const firstName = user.firstName || 'there';

    if (user.role === 'venue_owner') {
      return {
        title: `Welcome to MaBar, ${firstName}! 🏢`,
        subtitle: 'Your venue is ready to connect with players',
        features: [
          'Manage your court bookings',
          'View player reviews and ratings',
          'Track venue analytics and insights',
          'Connect with the padel community',
          'Set dynamic pricing strategies',
          'Promote special events and tournaments'
        ]
      };
    } else {
      return {
        title: `Welcome to MaBar, ${firstName}! 🏓`,
        subtitle: 'You\'re all set to start playing',
        features: [
          'Find players at your skill level',
          'Book courts at nearby venues',
          'Track your progress and stats',
          'Join tournaments and events',
          'Connect with the padel community',
          'Improve your game with tips and coaching'
        ]
      };
    }
  }, [user]);
};

/**
 * Custom hook for generating role-specific tips
 * @param {Object} user - User object containing role information
 * @returns {Object} Tip data including title and content
 */
export const useRoleTip = (user) => {
  return useMemo(() => {
    if (!user) {
      return {
        title: '💡 Pro Tip',
        content: 'Complete your profile to get the best experience!'
      };
    }

    if (user.role === 'venue_owner') {
      return {
        title: '🏢 Venue Owner Tip',
        content: 'Upload high-quality photos of your venue and verify your listing to attract more bookings! Consider offering special rates for first-time players.'
      };
    } else {
      return {
        title: '🏓 Player Tip',
        content: 'Complete your first match to start building your reputation and unlock more features! Don\'t forget to rate your playing partners.'
      };
    }
  }, [user?.role]);
};
