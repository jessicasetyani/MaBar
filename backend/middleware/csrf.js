const csrf = require('csrf');
const tokens = new csrf();

const csrfProtection = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const secret = req.session.csrfSecret || (req.session.csrfSecret = tokens.secretSync());
  const token = req.headers['x-csrf-token'] || req.body._csrf;

  if (!token || !tokens.verify(secret, token)) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next();
};

const generateToken = (req, res, next) => {
  const secret = req.session.csrfSecret || (req.session.csrfSecret = tokens.secretSync());
  req.csrfToken = () => tokens.create(secret);
  next();
};

module.exports = { csrfProtection, generateToken };