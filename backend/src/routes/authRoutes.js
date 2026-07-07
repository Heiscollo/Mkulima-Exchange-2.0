import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

/**
 * POST /api/auth/send-otp
 * Public endpoint
 * Request body: { phone: string }
 * Response: { success, message, phone, expiresIn }
 */
router.post('/send-otp', authController.sendOTP);

/**
 * POST /api/auth/verify-otp
 * Public endpoint
 * Request body: { phone: string, otp: string }
 * Response: { success, message, token, user }
 */
router.post('/verify-otp', authController.verifyOTP);

/**
 * POST /api/auth/register-details
 * Public endpoint
 * Request body: { phone, name, role, county, mpesaNumber }
 * Response: { success, message, token, user }
 */
router.post('/register-details', authController.registerDetails);

/**
 * GET /api/auth/me
 * Protected endpoint
 * Requires: JWT token in Authorization header
 * Response: { success, user }
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;
