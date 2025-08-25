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

// Helper function to extract token from request
const extractToken = (req) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }

  return token;
};

// Helper function to verify token and get user
const verifyTokenAndGetUser = async (token, selectFields = '-password') => {
  if (!token) {
    return { error: 'No token provided', status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(selectFields);

    if (!user) {
      return { error: 'User not found', status: 404 };
    }

    return { user };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return { error: 'Invalid token', status: 401 };
    }
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token expired', status: 401 };
    }
    return { error: 'Server error', status: 500 };
  }
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
  const token = extractToken(req);
  const result = await verifyTokenAndGetUser(token);

  if (result.error) {
    return res.status(result.status).json({ message: result.error });
  }

  res.json({
    user: result.user,
    isAuthenticated: true
  });
});

// @route   GET /auth/status
// @desc    Check authentication status
// @access  Public
router.get('/status', async (req, res) => {
  const token = extractToken(req);
  const result = await verifyTokenAndGetUser(token, '_id email role firstName lastName');

  if (result.error) {
    return res.json({ isAuthenticated: false });
  }

  res.json({
    isAuthenticated: true,
    user: {
      id: result.user._id,
      email: result.user.email,
      role: result.user.role,
      name: result.user.getFullName()
    }
  });
});

module.exports = router;
