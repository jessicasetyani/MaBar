const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

// Helper function to set secure cookie with JWT
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// @route   GET /auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// @route   GET /auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
  async (req, res) => {
    try {
      // Update last login
      await req.user.updateLastLogin();

      // Generate JWT token
      const token = generateToken(req.user);

      // Set secure cookie
      setTokenCookie(res, token);

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL}/?auth=success&new_user=${req.user.createdAt > Date.now() - 60000}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_callback_failed`);
    }
  }
);

// @route   GET /auth/facebook
// @desc    Initiate Facebook OAuth
// @access  Public
router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['email']
  })
);

// @route   GET /auth/facebook/callback
// @desc    Facebook OAuth callback
// @access  Public
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login?error=facebook_auth_failed' }),
  async (req, res) => {
    try {
      // Update last login
      await req.user.updateLastLogin();

      // Generate JWT token
      const token = generateToken(req.user);

      // Set secure cookie
      setTokenCookie(res, token);

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL}/?auth=success&new_user=${req.user.createdAt > Date.now() - 60000}`);
    } catch (error) {
      console.error('Facebook OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_callback_failed`);
    }
  }
);

// @route   POST /auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  // Clear the token cookie
  res.clearCookie('token');

  // Logout from passport session
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed', error: err.message });
    }

    res.json({ message: 'Logged out successfully' });
  });
});

// @route   GET /auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Check for token in cookie or Authorization header
    let token = req.cookies.token;

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: user,
      isAuthenticated: true
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    console.error('Auth me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /auth/status
// @desc    Check authentication status
// @access  Public
router.get('/status', async (req, res) => {
  try {
    let token = req.cookies.token;

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.json({ isAuthenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id email role firstName lastName');

    if (!user) {
      return res.json({ isAuthenticated: false });
    }

    res.json({
      isAuthenticated: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.getFullName()
      }
    });
  } catch (error) {
    res.json({ isAuthenticated: false });
  }
});

module.exports = router;
