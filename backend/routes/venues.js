const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireVenueOwner } = require('../middleware/auth');
const Venue = require('../models/Venue');

const router = express.Router();

// Middleware to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
    return true;
  }
  return false;
};

// @route   POST /api/venues/submit
// @desc    Submit a venue for verification (venue owners only)
// @access  Private (Venue Owner only)
router.post('/submit', [
  authenticateToken,
  requireVenueOwner,
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Venue name is required and must be less than 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('address').trim().isLength({ min: 1, max: 200 }).withMessage('Address is required and must be less than 200 characters'),
  body('phone').optional().trim(),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Price per hour must be a positive number'),
  body('numberOfCourts').optional().isInt({ min: 1, max: 50 }).withMessage('Number of courts must be between 1 and 50'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('operatingHours').optional().isObject().withMessage('Operating hours must be an object'),
  body('photos').optional().isArray().withMessage('Photos must be an array of URLs')
], async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) {
      return;
    }

    // Check if user already has a pending or approved venue
    const existingVenue = await Venue.findOne({
      owner: req.user.id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingVenue) {
      return res.status(400).json({
        message: `You already have a ${existingVenue.status} venue submission. Please wait for review or contact support.`
      });
    }

    const {
      name,
      description,
      address,
      phone,
      pricePerHour,
      numberOfCourts = 1,
      amenities = [],
      operatingHours = {},
      photos = []
    } = req.body;

    // Create new venue submission
    const venue = new Venue({
      name,
      description,
      address,
      phone,
      owner: req.user.id,
      pricePerHour,
      numberOfCourts,
      amenities,
      operatingHours: new Map(Object.entries(operatingHours)),
      photos,
      status: 'pending'
    });

    await venue.save();

    res.status(201).json({
      message: 'Venue submitted successfully for verification',
      venue: {
        id: venue._id,
        name: venue.name,
        status: venue.status,
        createdAt: venue.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting venue:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      message: 'Failed to submit venue',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/venues/my-submissions
// @desc    Get current user's venue submissions
// @access  Private (Venue Owner only)
router.get('/my-submissions', authenticateToken, requireVenueOwner, async (req, res) => {
  try {
    const venues = await Venue.find({ owner: req.user.id })
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Venue submissions retrieved successfully',
      count: venues.length,
      venues
    });
  } catch (error) {
    console.error('Error fetching user venues:', error);
    res.status(500).json({
      message: 'Failed to fetch venue submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/venues/approved
// @desc    Get all approved venues (public access)
// @access  Public
router.get('/approved', async (req, res) => {
  try {
    const { page = 1, limit = 10, city } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { status: 'approved', isActive: true };
    
    // Add city filter if provided
    if (city) {
      query.address = { $regex: city, $options: 'i' };
    }
    
    const venues = await Venue.find(query)
      .populate('owner', 'firstName lastName')
      .select('-adminNotes -reviewedBy -reviewedAt')
      .sort({ averageRating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Venue.countDocuments(query);
    
    res.json({
      message: 'Approved venues retrieved successfully',
      venues,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: venues.length,
        totalVenues: total
      }
    });
  } catch (error) {
    console.error('Error fetching approved venues:', error);
    res.status(500).json({
      message: 'Failed to fetch approved venues',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
