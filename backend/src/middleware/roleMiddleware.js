/**
 * Middleware to check user role
 * Must be used after authenticateToken middleware
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Ensure allowedRoles is an array
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Check if user role is in allowed roles
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied. Required role(s): ' + roles.join(', '),
        });
      }

      next();
    } catch (error) {
      console.error('Role Middleware Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Convenience middleware for farmers only
 */
export const requireFarmer = requireRole('FARMER');

/**
 * Convenience middleware for buyers only
 */
export const requireBuyer = requireRole('BUYER');

/**
 * Convenience middleware for admins only
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Convenience middleware for farmers or admins
 */
export const requireFarmerOrAdmin = requireRole(['FARMER', 'ADMIN']);

export default {
  requireRole,
  requireFarmer,
  requireBuyer,
  requireAdmin,
  requireFarmerOrAdmin,
};
