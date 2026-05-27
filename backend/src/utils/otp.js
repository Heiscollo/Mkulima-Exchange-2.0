import crypto from 'crypto';

/**
 * Generate a 6-digit OTP
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate OTP expiry timestamp (5 minutes from now)
 */
export function generateOTPExpiry() {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
}

/**
 * Hash OTP using bcrypt (handled by caller for flexibility)
 * This function just provides the logic structure
 */
export function hashOTP(otp, salt) {
  // Actual hashing is done with bcrypt in the controller
  // This is just a reference
  return crypto.createHash('sha256').update(otp + salt).digest('hex');
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt) {
  return new Date() > new Date(expiresAt);
}

export default {
  generateOTP,
  generateOTPExpiry,
  isOTPExpired,
};
