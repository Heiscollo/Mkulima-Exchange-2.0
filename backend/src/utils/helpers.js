// Utility functions for API responses
export const successResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, statusCode, message, error = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

// Utility functions for validation
export const isValidPhone = (phone) => {
  // Kenyan phone validation: starts with +254 or 0, 12 total digits
  const regex = /^(\+254|0)?[17][0-9]{8}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

export const formatPhoneNumber = (phone) => {
  // Convert to +254 format
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  return '+' + cleaned;
};

// Utility for generating OTP
export const generateOTP = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
};
