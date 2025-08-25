const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // OAuth Provider IDs
    googleId: {
      type: String,
      sparse: true,
      unique: true
    },
    facebookId: {
      type: String,
      sparse: true,
      unique: true
    },

    // Basic Information
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    profilePicture: {
      type: String,
      default: null
    },

    // Authentication
    password: {
      type: String,
      // Only required for local registration (not OAuth)
      required: function () {
        return !this.googleId && !this.facebookId;
      }
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },

    // User Role
    role: {
      type: String,
      enum: ['player', 'venue_owner', 'admin'],
      default: 'player'
    },

    // Player-specific fields
    skillLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: null // Will be set during onboarding
    },
    skillAssessment: {
      selfRated: { type: Number, min: 1, max: 10, default: null },
      yearsPlaying: { type: Number, default: null },
      playingFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'occasionally'],
        default: null
      },
      preferredPlayStyle: {
        type: String,
        enum: ['casual', 'competitive', 'social', 'training'],
        default: null
      }
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: null
    },
    location: {
      city: { type: String, default: null },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: null
      }
    },

    // Player Stats and Reputation
    stats: {
      gamesPlayed: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
      totalHoursPlayed: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 }
    },
    badges: [
      {
        type: String,
        enum: ['reliable', 'no_show', 'frequent_canceller', 'team_player', 'competitive']
      }
    ],

    // Social Features
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    // Venue Owner specific fields
    venueDetails: {
      venueName: { type: String, default: null },
      venueAddress: { type: String, default: null },
      venuePhone: { type: String, default: null },
      operatingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
      },
      pricePerHour: { type: Number, default: null },
      venuePhotos: [String],
      amenities: [String],
      isVerified: { type: Boolean, default: false }
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },

    // Onboarding Status
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
    onboardingStep: {
      type: Number,
      default: 0 // 0: not started, 1: role selection, 2: basic info, 3: skill assessment, 4: preferences, 5: completed
    },
    profileCompleteness: {
      type: Number,
      default: 0, // Percentage of profile completion (0-100)
      min: 0,
      max: 100
    },

    // Preferences
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      },
      privacy: {
        showProfile: { type: Boolean, default: true },
        showStats: { type: Boolean, default: true },
        showLocation: { type: Boolean, default: true }
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Index for text search
userSchema.index({
  firstName: 'text',
  lastName: 'text',
  'venueDetails.venueName': 'text'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get full name
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// Method to calculate age
userSchema.methods.getAge = function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Method to update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Constants for profile completeness calculation
const PROFILE_FIELDS = {
  BASIC_FIELDS: 7,
  PLAYER_FIELDS: 5,
  VENUE_OWNER_FIELDS: 8
};

const TOTAL_FIELDS = {
  PLAYER: PROFILE_FIELDS.BASIC_FIELDS + PROFILE_FIELDS.PLAYER_FIELDS,
  VENUE_OWNER: PROFILE_FIELDS.BASIC_FIELDS + PROFILE_FIELDS.VENUE_OWNER_FIELDS
};

// Method to calculate profile completeness
userSchema.methods.calculateProfileCompleteness = function () {
  const completeness = this.countCompletedFields();
  const totalFields = this.getTotalFieldsForRole();
  const percentage = Math.round((completeness / totalFields) * 100);

  this.profileCompleteness = percentage;
  return percentage;
};

// Helper method to count completed basic fields
userSchema.methods.countBasicFields = function () {
  let count = 0;

  if (this.firstName) count++;
  if (this.lastName) count++;
  if (this.email) count++;
  if (this.profilePicture) count++;
  if (this.dateOfBirth) count++;
  if (this.gender) count++;
  if (this.location?.city) count++;

  return count;
};

// Helper method to count completed player fields
userSchema.methods.countPlayerFields = function () {
  let count = 0;

  if (this.skillLevel) count++;
  if (this.skillAssessment?.selfRated) count++;
  if (this.skillAssessment?.yearsPlaying !== null && this.skillAssessment?.yearsPlaying !== undefined) count++;
  if (this.skillAssessment?.playingFrequency) count++;
  if (this.skillAssessment?.preferredPlayStyle) count++;

  return count;
};

// Helper method to count completed venue owner fields
userSchema.methods.countVenueOwnerFields = function () {
  let count = 0;

  if (this.venueDetails?.venueName) count++;
  if (this.venueDetails?.venueAddress) count++;
  if (this.venueDetails?.venuePhone) count++;
  if (this.venueDetails?.pricePerHour) count++;
  if (this.venueDetails?.operatingHours) count++;
  if (this.venueDetails?.amenities?.length > 0) count++;
  if (this.venueDetails?.venuePhotos?.length > 0) count++;
  if (this.venueDetails?.isVerified) count++;

  return count;
};

// Helper method to count all completed fields
userSchema.methods.countCompletedFields = function () {
  let completeness = this.countBasicFields();

  if (this.role === 'player') {
    completeness += this.countPlayerFields();
  } else if (this.role === 'venue_owner') {
    completeness += this.countVenueOwnerFields();
  }

  return completeness;
};

// Helper method to get total fields for role
userSchema.methods.getTotalFieldsForRole = function () {
  return this.role === 'venue_owner' ? TOTAL_FIELDS.VENUE_OWNER : TOTAL_FIELDS.PLAYER;
};

module.exports = mongoose.model('User', userSchema);
