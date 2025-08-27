const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Venue = require('../models/Venue');
const User = require('../models/User');

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

// @route   GET /api/admin/venues/pending
// @desc    Get all pending venue submissions for admin review
// @access  Private (Admin only)
router.get('/venues/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pendingVenues = await Venue.findPendingVenues();
    
    res.json({
      message: 'Pending venues retrieved successfully',
      count: pendingVenues.length,
      venues: pendingVenues
    });
  } catch (error) {
    console.error('Error fetching pending venues:', error);
    res.status(500).json({
      message: 'Failed to fetch pending venues',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/admin/venues
// @desc    Get all venues with optional status filter
// @access  Private (Admin only)
router.get('/venues', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    
    const venues = await Venue.find(query)
      .populate('owner', 'firstName lastName email phone')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Venue.countDocuments(query);
    
    res.json({
      message: 'Venues retrieved successfully',
      venues,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: venues.length,
        totalVenues: total
      }
    });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({
      message: 'Failed to fetch venues',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/admin/venues/:id/approve
// @desc    Approve a venue submission
// @access  Private (Admin only)
router.put('/venues/:id/approve', [
  authenticateToken,
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid venue ID'),
  body('adminNotes').optional().trim().isLength({ max: 500 }).withMessage('Admin notes must be less than 500 characters')
], async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) {
      return;
    }

    const { id } = req.params;
    const { adminNotes = '' } = req.body;
    
    const venue = await Venue.findById(id).populate('owner', 'firstName lastName email');
    
    if (!venue) {
      return res.status(404).json({
        message: 'Venue not found'
      });
    }
    
    if (venue.status !== 'pending') {
      return res.status(400).json({
        message: `Venue is already ${venue.status}. Only pending venues can be approved.`
      });
    }
    
    // Approve the venue
    await venue.approve(req.user.id, adminNotes);
    
    // Update the venue owner's verification status in User model
    await User.findByIdAndUpdate(venue.owner._id, {
      'venueDetails.isVerified': true
    });
    
    res.json({
      message: 'Venue approved successfully',
      venue: {
        id: venue._id,
        name: venue.name,
        status: venue.status,
        adminNotes: venue.adminNotes,
        reviewedAt: venue.reviewedAt,
        owner: venue.owner
      }
    });
  } catch (error) {
    console.error('Error approving venue:', error);
    res.status(500).json({
      message: 'Failed to approve venue',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/admin/venues/:id/reject
// @desc    Reject a venue submission
// @access  Private (Admin only)
router.put('/venues/:id/reject', [
  authenticateToken,
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid venue ID'),
  body('adminNotes').notEmpty().trim().isLength({ min: 1, max: 500 }).withMessage('Admin notes are required and must be less than 500 characters')
], async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) {
      return;
    }

    const { id } = req.params;
    const { adminNotes } = req.body;
    
    const venue = await Venue.findById(id).populate('owner', 'firstName lastName email');
    
    if (!venue) {
      return res.status(404).json({
        message: 'Venue not found'
      });
    }
    
    if (venue.status !== 'pending') {
      return res.status(400).json({
        message: `Venue is already ${venue.status}. Only pending venues can be rejected.`
      });
    }
    
    // Reject the venue
    await venue.reject(req.user.id, adminNotes);
    
    // Keep venue owner's verification status as false in User model
    await User.findByIdAndUpdate(venue.owner._id, {
      'venueDetails.isVerified': false
    });
    
    res.json({
      message: 'Venue rejected successfully',
      venue: {
        id: venue._id,
        name: venue.name,
        status: venue.status,
        adminNotes: venue.adminNotes,
        reviewedAt: venue.reviewedAt,
        owner: venue.owner
      }
    });
  } catch (error) {
    console.error('Error rejecting venue:', error);
    
    if (error.message === 'Admin notes are required when rejecting a venue') {
      return res.status(400).json({
        message: error.message
      });
    }
    
    res.status(500).json({
      message: 'Failed to reject venue',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/admin/venues/:id
// @desc    Get a specific venue by ID
// @access  Private (Admin only)
router.get('/venues/:id', [
  authenticateToken,
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid venue ID')
], async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) {
      return;
    }

    const venue = await Venue.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone')
      .populate('reviewedBy', 'firstName lastName email');
    
    if (!venue) {
      return res.status(404).json({
        message: 'Venue not found'
      });
    }
    
    res.json({
      message: 'Venue retrieved successfully',
      venue
    });
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({
      message: 'Failed to fetch venue',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
