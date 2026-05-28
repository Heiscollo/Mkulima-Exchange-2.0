import jwt from 'jsonwebtoken';

/**
 * Middleware to validate JWT token
 * Attaches user info to req.user
 */
export const authenticateToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token verification error:', err.message);
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      // Attach user to request
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Optional middleware - doesn't fail if no token
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (!err) {
          req.user = user;
        }
      });
    }

    next();
  } catch (error) {
    console.error('Optional Auth Error:', error);
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        error: `Forbidden - Only ${requiredRole}s can access this resource` 
      });
    }

    next();
  };
};

/**
 * Farmer-only middleware
 */
export const requireFarmer = requireRole('FARMER');

/**
 * Buyer-only middleware
 */
export const requireBuyer = requireRole('BUYER');

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('ADMIN');

export default {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireFarmer,
  requireBuyer,
  requireAdmin,
};
