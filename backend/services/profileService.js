const User = require('../models/User');

// Constants
const ONBOARDING_STEPS = {
  BASIC_INFO: 2,
  SKILL_OR_VENUE: 3,
  PREFERENCES: 4,
  COMPLETED: 5
};

const SKILL_LEVEL_ADJUSTMENTS = {
  FREQUENCY_BONUS: {
    daily: 2,
    weekly: 1,
    monthly: 0,
    occasionally: -1
  },
  EXPERIENCE_THRESHOLDS: {
    INTERMEDIATE: 5,
    ADVANCED: 10
  }
};

class ProfileService {
  /**
   * Get user profile with calculated completeness
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile with completeness
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    const completeness = user.calculateProfileCompleteness();
    await user.save();

    return {
      user,
      profileCompleteness: completeness
    };
  }

  /**
   * Update basic profile information
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated user profile
   */
  async updateBasicProfile(userId, profileData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    this.updateBasicFields(user, profileData);

    // For optimized onboarding flow, advance to step 3 (Complete) after basic info
    // This allows the simplified Player flow: Role → Quick Start → Complete
    if (user.role === 'player' && profileData.skillLevel) {
      this.updateOnboardingStep(user, ONBOARDING_STEPS.SKILL_OR_VENUE);
    } else {
      this.updateOnboardingStep(user, ONBOARDING_STEPS.BASIC_INFO);
    }

    user.calculateProfileCompleteness();
    await user.save();

    return {
      message: 'Basic profile updated successfully',
      user: user.toJSON(),
      profileCompleteness: user.profileCompleteness
    };
  }

  /**
   * Update skill assessment for players
   * @param {string} userId - User ID
   * @param {Object} skillData - Skill assessment data
   * @returns {Promise<Object>} Updated user profile
   */
  async updateSkillAssessment(userId, skillData) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'player') {
      throw new Error('Skill assessment is only for players');
    }

    this.updateSkillAssessmentData(user, skillData);
    this.updateOnboardingStep(user, ONBOARDING_STEPS.SKILL_OR_VENUE);

    user.calculateProfileCompleteness();
    await user.save();

    return {
      message: 'Skill assessment updated successfully',
      user: user.toJSON(),
      profileCompleteness: user.profileCompleteness
    };
  }

  /**
   * Update venue details for venue owners
   * @param {string} userId - User ID
   * @param {Object} venueData - Venue details data
   * @returns {Promise<Object>} Updated user profile
   */
  async updateVenueDetails(userId, venueData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'venue_owner') {
      throw new Error('Venue details are only for venue owners');
    }

    this.updateVenueDetailsData(user, venueData);

    // For optimized onboarding flow, advance to step 3 (Complete) after venue setup
    // This allows the simplified Venue Owner flow: Role → Venue Setup → Complete
    this.updateOnboardingStep(user, ONBOARDING_STEPS.SKILL_OR_VENUE);

    user.calculateProfileCompleteness();
    await user.save();

    return {
      message: 'Venue details updated successfully',
      user: user.toJSON(),
      profileCompleteness: user.profileCompleteness
    };
  }

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferencesData - Preferences data
   * @returns {Promise<Object>} Updated user profile
   */
  async updatePreferences(userId, preferencesData) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    this.updatePreferencesData(user, preferencesData);
    this.updateOnboardingStep(user, ONBOARDING_STEPS.PREFERENCES);

    await user.save();

    return {
      message: 'Preferences updated successfully',
      user: user.toJSON()
    };
  }

  /**
   * Complete onboarding process
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user profile
   */
  async completeOnboarding(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    user.onboardingCompleted = true;
    user.onboardingStep = ONBOARDING_STEPS.COMPLETED;
    user.calculateProfileCompleteness();
    await user.save();

    return {
      message: 'Onboarding completed successfully',
      user: user.toJSON(),
      profileCompleteness: user.profileCompleteness
    };
  }

  // Private helper methods
  updateBasicFields(user, data) {
    const { firstName, lastName, dateOfBirth, gender, location, skillLevel } = data;

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;
    if (location !== undefined) {
      user.location = { ...user.location, ...location };
    }
    // Allow basic skillLevel setting for quick start
    if (skillLevel !== undefined && user.role === 'player') {
      user.skillLevel = skillLevel;
    }
  }

  updateSkillAssessmentData(user, data) {
    const { selfRated, yearsPlaying, playingFrequency, preferredPlayStyle } = data;

    user.skillAssessment = {
      selfRated,
      yearsPlaying: yearsPlaying || 0,
      playingFrequency,
      preferredPlayStyle
    };

    user.skillLevel = this.calculateSkillLevel(selfRated, yearsPlaying, playingFrequency);
  }

  updateVenueDetailsData(user, data) {
    const { venueName, venueAddress, venuePhone, pricePerHour, numberOfCourts, amenities, operatingHours } = data;

    user.venueDetails = {
      ...user.venueDetails,
      venueName,
      venueAddress,
      venuePhone: venuePhone || user.venueDetails?.venuePhone,
      pricePerHour,
      numberOfCourts: numberOfCourts || user.venueDetails?.numberOfCourts,
      amenities: amenities || user.venueDetails?.amenities,
      operatingHours: operatingHours || user.venueDetails?.operatingHours
    };
  }

  updatePreferencesData(user, data) {
    const { notifications, privacy } = data;

    if (notifications) {
      user.preferences.notifications = { ...user.preferences.notifications, ...notifications };
    }
    if (privacy) {
      user.preferences.privacy = { ...user.preferences.privacy, ...privacy };
    }
  }

  updateOnboardingStep(user, step) {
    if (user.onboardingStep < step) {
      user.onboardingStep = step;
    }
  }

  calculateSkillLevel(selfRated, yearsPlaying, frequency) {
    let skillLevel = selfRated;
    
    // Adjust based on years of experience
    if (yearsPlaying >= SKILL_LEVEL_ADJUSTMENTS.EXPERIENCE_THRESHOLDS.INTERMEDIATE) {
      skillLevel += 1;
    }
    if (yearsPlaying >= SKILL_LEVEL_ADJUSTMENTS.EXPERIENCE_THRESHOLDS.ADVANCED) {
      skillLevel += 1;
    }
    
    // Adjust based on playing frequency
    const frequencyBonus = SKILL_LEVEL_ADJUSTMENTS.FREQUENCY_BONUS[frequency] || 0;
    skillLevel += frequencyBonus;
    
    // Ensure skill level is within bounds
    return Math.max(1, Math.min(10, skillLevel));
  }
}

module.exports = new ProfileService();
