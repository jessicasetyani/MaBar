const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken: auth } = require('../middleware/auth');
const profileService = require('../services/profileService');

const router = express.Router();

// Constants
const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Helper functions
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ errors: errors.array() });
    return true;
  }
  return false;
};

const handleServerError = (error, res, context) => {
  console.error(`${context} error:`, error);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
};

// @route   GET /profile
// @desc    Get current user's profile
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const result = await profileService.getUserProfile(req.user.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: error.message });
    }
    handleServerError(error, res, 'Get profile');
  }
});

// @route   PUT /profile/basic
// @desc    Update basic profile information
// @access  Private
router.put('/basic', [
  auth,
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('location.city').optional().trim().isLength({ min: 1, max: 100 }),
  body('location.coordinates').optional().isArray({ min: 2, max: 2 }),
  body('skillLevel').optional().isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) {
      return;
    }

    const result = await profileService.updateBasicProfile(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: error.message });
    }
    handleServerError(error, res, 'Update basic profile');
  }
});

// @route   PUT /profile/skill-assessment
// @desc    Update player skill assessment
// @access  Private
router.put('/skill-assessment', [
  auth,
  body('selfRated').isInt({ min: 1, max: 10 }),
  body('yearsPlaying').optional().isInt({ min: 0, max: 50 }),
  body('playingFrequency').isIn(['daily', 'weekly', 'monthly', 'occasionally']),
  body('preferredPlayStyle').isIn(['casual', 'competitive', 'social', 'training'])
], async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) {
      return;
    }

    const result = await profileService.updateSkillAssessment(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: error.message });
    }
    if (error.message === 'Skill assessment is only for players') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: error.message });
    }
    handleServerError(error, res, 'Update skill assessment');
  }
});

// @route   PUT /profile/venue-details
// @desc    Update venue owner details
// @access  Private
router.put('/venue-details', [
  auth,
  body('venueName').trim().isLength({ min: 1, max: 100 }),
  body('venueAddress').trim().isLength({ min: 1, max: 200 }),
  body('venuePhone').optional().trim().isMobilePhone(),
  body('pricePerHour').isFloat({ min: 0 }),
  body('numberOfCourts').optional().isInt({ min: 1, max: 50 }),
  body('amenities').optional().isArray(),
  body('operatingHours').optional().isObject()
], async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) {
      return;
    }

    const result = await profileService.updateVenueDetails(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: error.message });
    }
    if (error.message === 'Venue details are only for venue owners') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: error.message });
    }
    handleServerError(error, res, 'Update venue details');
  }
});

// @route   PUT /profile/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  auth,
  body('notifications.email').optional().isBoolean(),
  body('notifications.push').optional().isBoolean(),
  body('notifications.sms').optional().isBoolean(),
  body('privacy.showProfile').optional().isBoolean(),
  body('privacy.showStats').optional().isBoolean(),
  body('privacy.showLocation').optional().isBoolean()
], async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) {
      return;
    }

    const result = await profileService.updatePreferences(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: error.message });
    }
    handleServerError(error, res, 'Update preferences');
  }
});

// @route   PUT /profile/complete-onboarding
// @desc    Mark onboarding as completed
// @access  Private
router.put('/complete-onboarding', auth, async (req, res) => {
  try {
    const result = await profileService.completeOnboarding(req.user.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: error.message });
    }
    handleServerError(error, res, 'Complete onboarding');
  }
});

module.exports = router;
