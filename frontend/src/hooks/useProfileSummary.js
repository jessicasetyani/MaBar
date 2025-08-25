import { useMemo } from 'react';

/**
 * Custom hook for generating profile summary data
 * @param {Object} user - User object containing profile information
 * @returns {Array} Array of summary items with label, value, and icon
 */
export const useProfileSummary = (user) => {
  return useMemo(() => {
    if (!user) return [];

    const summaryItems = [
      {
        label: 'Role',
        value: user.role === 'venue_owner' ? 'Venue Owner' : 'Player',
        icon: user.role === 'venue_owner' ? '🏢' : '🏓'
      },
      {
        label: 'Location',
        value: user.location?.city || 'Not specified',
        icon: '📍'
      }
    ];

    // Add role-specific items
    if (user.role === 'player') {
      summaryItems.push({
        label: 'Skill Level',
        value: user.skillLevel ? `${user.skillLevel}/10` : 'Not assessed',
        icon: '⭐'
      });

      if (user.playingFrequency) {
        summaryItems.push({
          label: 'Playing Frequency',
          value: user.playingFrequency.charAt(0).toUpperCase() + user.playingFrequency.slice(1),
          icon: '📅'
        });
      }
    } else if (user.role === 'venue_owner') {
      summaryItems.push({
        label: 'Venue',
        value: user.venueDetails?.venueName || 'Not specified',
        icon: '🏟️'
      });

      if (user.venueDetails?.numberOfCourts) {
        summaryItems.push({
          label: 'Courts',
          value: `${user.venueDetails.numberOfCourts} court${user.venueDetails.numberOfCourts > 1 ? 's' : ''}`,
          icon: '🎾'
        });
      }

      if (user.venueDetails?.pricePerHour) {
        summaryItems.push({
          label: 'Price per Hour',
          value: `Rp ${user.venueDetails.pricePerHour.toLocaleString('id-ID')}`,
          icon: '💰'
        });
      }
    }

    // Add profile completeness
    summaryItems.push({
      label: 'Profile Completeness',
      value: `${user.profileCompleteness || 0}%`,
      icon: '📊'
    });

    return summaryItems;
  }, [user]);
};

/**
 * Custom hook for calculating profile completeness percentage
 * @param {Object} user - User object containing profile information
 * @returns {Object} Completeness data including percentage and missing fields
 */
export const useProfileCompleteness = (user) => {
  return useMemo(() => {
    if (!user) {
      return { percentage: 0, missingFields: [], suggestions: [] };
    }

    const requiredFields = ['firstName', 'email', 'role'];
    const optionalFields = user.role === 'player' 
      ? ['lastName', 'location.city', 'skillLevel', 'profilePicture']
      : ['lastName', 'location.city', 'profilePicture', 'venueDetails.venueName', 'venueDetails.venueAddress'];

    const allFields = [...requiredFields, ...optionalFields];
    let completedFields = 0;
    const missingFields = [];

    allFields.forEach(field => {
      const fieldValue = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], user)
        : user[field];

      if (fieldValue && fieldValue !== '') {
        completedFields++;
      } else {
        missingFields.push(field);
      }
    });

    const percentage = Math.round((completedFields / allFields.length) * 100);

    const suggestions = missingFields.map(field => {
      switch (field) {
        case 'lastName':
          return 'Add your last name for a complete profile';
        case 'location.city':
          return 'Add your city to find nearby venues and players';
        case 'skillLevel':
          return 'Complete skill assessment to find suitable matches';
        case 'profilePicture':
          return 'Upload a profile picture to build trust';
        case 'venueDetails.venueName':
          return 'Add your venue name to attract bookings';
        case 'venueDetails.venueAddress':
          return 'Add your venue address for easy discovery';
        default:
          return `Complete your ${field} information`;
      }
    });

    return { percentage, missingFields, suggestions };
  }, [user]);
};
