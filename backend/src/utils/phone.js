/**
 * Normalize phone numbers to 254XXXXXXXXX format
 * Handles: 07XX, 7XX, +2547XX formats
 */
export function normalizePhone(phone) {
  if (!phone) return null;

  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.startsWith('254')) {
    // Already in correct format
    return cleaned;
  } else if (cleaned.startsWith('07')) {
    // 07XXXXXXXX -> 254XXXXXXXX
    return '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7')) {
    // 7XXXXXXXX -> 254XXXXXXXX
    return '254' + cleaned;
  } else {
    // Try to assume it's missing country code
    return '254' + cleaned;
  }
}

/**
 * Validate Kenyan phone number
 */
export function isValidKenyaPhone(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return false;

  // Should be 254 + 9 digits = 12 total
  return normalized.match(/^254\d{9}$/) !== null;
}

/**
 * Format phone for display (e.g., 254712345678 -> +254 712 345 678)
 */
export function formatPhoneForDisplay(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized || normalized.length !== 12) return phone;

  return `+${normalized.substring(0, 3)} ${normalized.substring(3, 6)} ${normalized.substring(6, 9)} ${normalized.substring(9)}`;
}

export default {
  normalizePhone,
  isValidKenyaPhone,
  formatPhoneForDisplay,
};
