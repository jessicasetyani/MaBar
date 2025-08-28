/**
 * Enhanced Security Headers Middleware
 * Implements comprehensive security headers beyond Helmet.js defaults
 */

const securityHeaders = (req, res, next) => {
  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Content Security Policy (CSP) - Enhanced
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://connect.facebook.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.gemini.com https://graph.facebook.com https://www.googleapis.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  if (process.env.NODE_ENV === 'development') {
    // Allow webpack dev server in development
    cspDirectives[1] = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://connect.facebook.net";
    cspDirectives[4] = "connect-src 'self' ws: https://api.gemini.com https://graph.facebook.com https://www.googleapis.com";
  }
  
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  // Permissions Policy (formerly Feature Policy)
  const permissionsPolicy = [
    'geolocation=(self)',
    'microphone=()',
    'camera=()',
    'magnetometer=()',
    'gyroscope=()',
    'speaker=(self)',
    'vibrate=()',
    'fullscreen=(self)',
    'payment=()'
  ];
  res.setHeader('Permissions-Policy', permissionsPolicy.join(', '));
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cross-Origin Policies
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Additional Security Headers
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Expect-CT', 'max-age=86400, enforce');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Custom security headers for API
  if (req.originalUrl.startsWith('/api')) {
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Rate-Limit-Policy', 'standard');
  }
  
  next();
};

// Security headers specifically for file uploads
const fileUploadSecurityHeaders = (req, res, next) => {
  // Additional headers for file upload endpoints
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Disposition', 'attachment');
  
  next();
};

// Headers for OAuth callbacks
const oauthSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking on OAuth pages
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  
  next();
};

module.exports = {
  securityHeaders,
  fileUploadSecurityHeaders,
  oauthSecurityHeaders
};