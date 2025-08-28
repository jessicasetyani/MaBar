const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Enhanced Input Validation Middleware
 * Provides comprehensive validation for all API endpoints
 */

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Please provide a valid email address'),
    
  password: body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  name: (field) => body(field)
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(`${field} must be 1-50 characters and contain only letters, spaces, hyphens, and apostrophes`),
    
  mongoId: (field) => param(field)
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid ID format');
      }
      return true;
    }),
    
  phoneNumber: body('phone')
    .optional()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),
    
  url: (field) => body(field)
    .optional()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage(`${field} must be a valid URL`),
    
  dateOfBirth: body('dateOfBirth')
    .optional()
    .isISO8601()
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),
    
  skillLevel: body('skillLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Skill level must be between 1 and 10'),
    
  coordinates: body('coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]')
    .custom((value) => {
      const [lng, lat] = value;
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        throw new Error('Coordinates must be numbers');
      }
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new Error('Invalid coordinate values');
      }
      return true;
    })
};

// Authentication validation
const authValidation = {
  login: [
    commonValidations.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],
  
  adminLogin: [
    commonValidations.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    body('role')
      .optional()
      .equals('admin')
      .withMessage('Invalid role for admin login'),
    handleValidationErrors
  ]
};

// User profile validation
const userValidation = {
  updateProfile: [
    commonValidations.name('firstName').optional(),
    commonValidations.name('lastName').optional(),
    commonValidations.email.optional(),
    commonValidations.phoneNumber,
    commonValidations.dateOfBirth,
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
      .withMessage('Invalid gender value'),
    body('location.city')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('City must be 1-100 characters'),
    commonValidations.coordinates,
    commonValidations.skillLevel,
    body('skillAssessment.yearsPlaying')
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage('Years playing must be between 0 and 50'),
    body('skillAssessment.playingFrequency')
      .optional()
      .isIn(['daily', 'weekly', 'monthly', 'occasionally'])
      .withMessage('Invalid playing frequency'),
    body('skillAssessment.preferredPlayStyle')
      .optional()
      .isIn(['casual', 'competitive', 'social', 'training'])
      .withMessage('Invalid preferred play style'),
    handleValidationErrors
  ],
  
  updatePreferences: [
    body('notifications.email')
      .optional()
      .isBoolean()
      .withMessage('Email notification preference must be boolean'),
    body('notifications.push')
      .optional()
      .isBoolean()
      .withMessage('Push notification preference must be boolean'),
    body('notifications.sms')
      .optional()
      .isBoolean()
      .withMessage('SMS notification preference must be boolean'),
    body('privacy.showProfile')
      .optional()
      .isBoolean()
      .withMessage('Show profile preference must be boolean'),
    body('privacy.showStats')
      .optional()
      .isBoolean()
      .withMessage('Show stats preference must be boolean'),
    body('privacy.showLocation')
      .optional()
      .isBoolean()
      .withMessage('Show location preference must be boolean'),
    handleValidationErrors
  ]
};

// Venue validation
const venueValidation = {
  createVenue: [
    body('venueName')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Venue name must be 1-100 characters'),
    body('venueAddress')
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Venue address must be 10-200 characters'),
    commonValidations.phoneNumber.withMessage('Valid phone number is required'),
    body('pricePerHour')
      .isFloat({ min: 0, max: 10000 })
      .withMessage('Price per hour must be between 0 and 10000'),
    body('numberOfCourts')
      .isInt({ min: 1, max: 50 })
      .withMessage('Number of courts must be between 1 and 50'),
    body('amenities')
      .optional()
      .isArray()
      .withMessage('Amenities must be an array'),
    body('amenities.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each amenity must be 1-50 characters'),
    commonValidations.coordinates,
    handleValidationErrors
  ],
  
  updateVenue: [
    commonValidations.mongoId('id'),
    body('venueName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Venue name must be 1-100 characters'),
    body('venueAddress')
      .optional()
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Venue address must be 10-200 characters'),
    body('pricePerHour')
      .optional()
      .isFloat({ min: 0, max: 10000 })
      .withMessage('Price per hour must be between 0 and 10000'),
    body('numberOfCourts')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Number of courts must be between 1 and 50'),
    handleValidationErrors
  ]
};

// Query parameter validation
const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be between 1 and 1000'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],
  
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be 1-100 characters'),
    query('location')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Location must be 1-100 characters'),
    query('skillLevel')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Skill level must be between 1 and 10'),
    handleValidationErrors
  ]
};

// File upload validation
const fileValidation = {
  profilePicture: [
    body('profilePicture')
      .optional()
      .custom((value, { req }) => {
        if (req.file) {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
          const maxSize = 5 * 1024 * 1024; // 5MB
          
          if (!allowedTypes.includes(req.file.mimetype)) {
            throw new Error('Profile picture must be JPEG, PNG, or WebP');
          }
          
          if (req.file.size > maxSize) {
            throw new Error('Profile picture must be less than 5MB');
          }
        }
        return true;
      }),
    handleValidationErrors
  ]
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential HTML/script tags from string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<[^>]*>/g, '')
              .trim();
  };
  
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  next();
};

module.exports = {
  authValidation,
  userValidation,
  venueValidation,
  queryValidation,
  fileValidation,
  sanitizeInput,
  handleValidationErrors,
  commonValidations
};