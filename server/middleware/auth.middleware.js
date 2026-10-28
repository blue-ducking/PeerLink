const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'peerlink_super_secure_jwt_dev_secret_key_2026';

function extractToken(req) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Ensures user is authenticated.
 */
function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in to continue.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.'
    });
  }

  req.user = decoded;
  next();
}

/**
 * Optional authentication: populates req.user if a valid token is provided.
 */
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}

/**
 * Requires verified student status for restricted university actions.
 */
function requireVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  if (req.user.verificationStatus !== 'VERIFIED' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Account verification required. Your university identity is currently PENDING approval.'
    });
  }

  next();
}

/**
 * Requires administrator privileges.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Administrator access required.'
    });
  }

  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireVerified,
  requireAdmin
};
