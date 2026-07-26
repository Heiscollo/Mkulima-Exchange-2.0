// Import Express framework to create the router
import express from 'express';

// Import all auth controller functions (sendOTP, verifyOTP, registerDetails, getCurrentUser)
// These are the actual functions that handle the business logic for each route
import * as authController from '../controllers/authController.js';

// Import the JWT authentication middleware
// This middleware checks if the request has a valid JWT token before allowing access
import { authenticateToken } from '../middleware/authMiddleware.js';

// Create a router instance — think of this as a mini Express app
// that only handles auth-related routes
const router = express.Router();

/**
 * POST /api/auth/send-otp
 * Public — no token needed
 * What it does: Takes a phone number and sends a 6-digit OTP via SMS
 * Body: { phone: "07XXXXXXXX" }
 */
router.post('/send-otp', authController.sendOTP);

/**
 * POST /api/auth/verify-otp
 * Public — no token needed
 * What it does: Verifies the OTP. 
 * If new user → returns isNewUser: true, no token
 * If existing user → returns JWT token and user details
 * Body: { phone: "07XXXXXXXX", otp: "123456" }
 */
router.post('/verify-otp', authController.verifyOTP);

/**
 * POST /api/auth/register-details
 * Public — no token needed at this stage
 * What it does: Creates a new user account with name, role, county
 * and M-Pesa number. Returns a JWT token after successful registration.
 * Body: { phone, name, role, county, mpesaNumber }
 */
router.post('/register-details', authController.registerDetails);

/**
 * GET /api/auth/me
 * Protected — requires a valid JWT token in Authorization header
 * authenticateToken runs first and checks the token before 
 * getCurrentUser runs. If token is invalid it returns 401 immediately.
 * What it does: Returns the currently logged in user's details
 * Headers: { Authorization: "Bearer YOUR_TOKEN_HERE" }
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

// Export the router so index.js can mount it at /api/auth
// This means all routes above become:
// /api/auth/send-otp
// /api/auth/verify-otp
// /api/auth/register-details
// /api/auth/me
export default router;