import express from 'express';

const router = express.Router();

// POST /api/auth/send-otp
// Send OTP to phone number via SMS

// POST /api/auth/verify-otp
// Verify OTP and return JWT token

// POST /api/auth/logout

export default router;
