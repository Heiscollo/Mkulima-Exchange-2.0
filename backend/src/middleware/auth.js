// Authentication middleware
// Verify JWT token and attach user to request

export const authenticate = (req, res, next) => {
  // TODO: Implement JWT verification
  next();
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    // TODO: Check if user role is in allowed roles
    next();
  };
};

// Farmer-only middleware
export const requireFarmer = (req, res, next) => {
  // TODO: Check if user is a farmer
  next();
};

// Buyer-only middleware
export const requireBuyer = (req, res, next) => {
  // TODO: Check if user is a buyer
  next();
};

// Admin-only middleware
export const requireAdmin = (req, res, next) => {
  // TODO: Check if user is admin
  next();
};
