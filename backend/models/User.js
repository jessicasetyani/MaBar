const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: function() {
      return this.role !== undefined;
    },
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: function() {
      return this.role !== undefined;
    },
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  profilePicture: {
    type: String,
    default: null
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

  // Role and Authentication
  role: {
    type: String,
    enum: ['player', 'venue_owner', 'admin'],
    default: 'player'
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  provider: {
    type: String,
    enum: ['google', 'facebook', 'local'],
    default: 'local'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // Location
  location: {
    city: { type: String, default: null },
    coordinates: {
      type: [Number],
      default: null
    }
  },

  // Player-specific fields
  skillLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: null
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

  // Venue Owner specific fields
  venueDetails: {
    venueName: { type: String, default: null },
    venueAddress: { type: String, default: null },
    venuePhone: { type: String, default: null },
    pricePerHour: { type: Number, default: null },
    amenities: [{ type: String }],
    operatingHours: {
      type: Map,
      of: String,
      default: null
    },
    venuePhotos: [{ type: String }],
    isVerified: { type: Boolean, default: false }
  },

  // Game Statistics
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalHoursPlayed: { type: Number, default: 0 }
  },

  // Social Features
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  badges: [{ type: String }],

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
    default: 0
  },
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ facebookId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Method to calculate profile completeness
userSchema.methods.calculateProfileCompleteness = function() {
  const completeness = this.countCompletedFields();
  const totalFields = this.getTotalFieldsForRole();
  const percentage = Math.round((completeness / totalFields) * 100);
  
  this.profileCompleteness = percentage;
  return percentage;
};

// Helper method to count completed basic fields
userSchema.methods.countBasicFields = function() {
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
userSchema.methods.countPlayerFields = function() {
  let count = 0;
  
  if (this.skillLevel) count++;
  if (this.skillAssessment?.selfRated) count++;
  if (this.skillAssessment?.yearsPlaying !== null && this.skillAssessment?.yearsPlaying !== undefined) count++;
  if (this.skillAssessment?.playingFrequency) count++;
  if (this.skillAssessment?.preferredPlayStyle) count++;
  
  return count;
};

// Helper method to count completed venue owner fields
userSchema.methods.countVenueOwnerFields = function() {
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
userSchema.methods.countCompletedFields = function() {
  let completeness = this.countBasicFields();
  
  if (this.role === 'player') {
    completeness += this.countPlayerFields();
  } else if (this.role === 'venue_owner') {
    completeness += this.countVenueOwnerFields();
  }
  
  return completeness;
};

// Helper method to get total fields for role
userSchema.methods.getTotalFieldsForRole = function() {
  const BASIC_FIELDS = 7;
  const PLAYER_FIELDS = 5;
  const VENUE_OWNER_FIELDS = 8;
  
  return this.role === 'venue_owner' 
    ? BASIC_FIELDS + VENUE_OWNER_FIELDS 
    : BASIC_FIELDS + PLAYER_FIELDS;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
