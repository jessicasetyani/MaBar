/**
 * Security-focused logging utility
 * Provides structured logging with security event tracking
 */

const fs = require('fs');
const path = require('path');

class SecurityLogger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatLogEntry(level, message, metadata = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...metadata,
      pid: process.pid,
      hostname: require('os').hostname()
    }) + '\n';
  }

  writeToFile(filename, entry) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, entry);
  }

  log(level, message, metadata = {}) {
    const entry = this.formatLogEntry(level, message, metadata);
    
    // Write to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(entry.trim());
    }
    
    // Write to appropriate log files
    this.writeToFile('app.log', entry);
    
    if (level === 'error') {
      this.writeToFile('error.log', entry);
    }
    
    if (metadata.security) {
      this.writeToFile('security.log', entry);
    }
  }

  info(message, metadata = {}) {
    this.log('info', message, metadata);
  }

  warn(message, metadata = {}) {
    this.log('warn', message, metadata);
  }

  error(message, metadata = {}) {
    this.log('error', message, metadata);
  }

  debug(message, metadata = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, metadata);
    }
  }

  // Security-specific logging methods
  securityEvent(event, details = {}) {
    this.log('warn', `Security Event: ${event}`, {
      ...details,
      security: true,
      eventType: event
    });
  }

  authAttempt(success, details = {}) {
    const event = success ? 'Authentication Success' : 'Authentication Failure';
    this.log(success ? 'info' : 'warn', event, {
      ...details,
      security: true,
      authSuccess: success
    });
  }

  suspiciousActivity(activity, details = {}) {
    this.log('error', `Suspicious Activity: ${activity}`, {
      ...details,
      security: true,
      suspicious: true
    });
  }

  dataAccess(resource, action, details = {}) {
    this.log('info', `Data Access: ${action} on ${resource}`, {
      ...details,
      security: true,
      dataAccess: true,
      resource,
      action
    });
  }

  rateLimitExceeded(details = {}) {
    this.securityEvent('Rate Limit Exceeded', details);
  }

  invalidInput(details = {}) {
    this.securityEvent('Invalid Input Detected', details);
  }

  permissionDenied(details = {}) {
    this.securityEvent('Permission Denied', details);
  }
}

// Create singleton instance
const logger = new SecurityLogger();

// Express middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    sessionId: req.sessionID
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(logLevel, 'HTTP Response', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id,
      sessionId: req.sessionID
    });
    
    // Log security events for suspicious status codes
    if (res.statusCode === 401) {
      logger.securityEvent('Unauthorized Access Attempt', {
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    } else if (res.statusCode === 403) {
      logger.securityEvent('Forbidden Access Attempt', {
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id
      });
    } else if (res.statusCode === 429) {
      logger.rateLimitExceeded({
        url: req.originalUrl,
        ip: req.ip
      });
    }
  });
  
  next();
};

// Security event middleware
const securityMiddleware = (req, res, next) => {
  // Log potential security issues
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript protocol
    /data:.*base64/i  // Data URLs
  ];
  
  const checkSuspicious = (str) => {
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };
  
  // Check URL for suspicious patterns
  if (checkSuspicious(req.originalUrl)) {
    logger.suspiciousActivity('Suspicious URL Pattern', {
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
  
  // Check headers for suspicious content
  Object.entries(req.headers).forEach(([key, value]) => {
    if (typeof value === 'string' && checkSuspicious(value)) {
      logger.suspiciousActivity('Suspicious Header Content', {
        header: key,
        value: value.substring(0, 100), // Limit logged value length
        ip: req.ip
      });
    }
  });
  
  next();
};

module.exports = {
  logger,
  requestLogger,
  securityMiddleware
};