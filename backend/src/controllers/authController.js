import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { normalizePhone, isValidKenyaPhone } from '../utils/phone.js';
import { generateOTP, generateOTPExpiry, isOTPExpired } from '../utils/otp.js';
import { sendOTPSMS } from '../utils/africasTalking.js';

const prisma = new PrismaClient();

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number
 */
export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate input
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Normalize and validate phone
    const normalizedPhone = normalizePhone(phone);
    if (!isValidKenyaPhone(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid Kenyan phone number' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = generateOTPExpiry();

    // Hash OTP before storing
    const saltRounds = 10;
    const codeHash = await bcrypt.hash(otp, saltRounds);

    // Delete any existing OTP for this phone
    await prisma.otpCode.deleteMany({
      where: { phone: normalizedPhone },
    });

    // Store OTP in database
    await prisma.otpCode.create({
      data: {
        phone: normalizedPhone,
        codeHash: codeHash,
        expiresAt: expiresAt,
      },
    });

    // Send OTP via SMS
    const smsResult = await sendOTPSMS(normalizedPhone, otp);

    if (!smsResult.success) {
      return res.status(500).json({
        error: 'Failed to send OTP. Please try again.',
        details: smsResult.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      phone: normalizedPhone,
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify OTP and return JWT token
 */
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Validate input
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    // Normalize phone
    const normalizedPhone = normalizePhone(phone);
    if (!isValidKenyaPhone(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid Kenyan phone number' });
    }

    // Find OTP record
    const otpRecord = await prisma.otpCode.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    // Check expiry
    if (isOTPExpired(otpRecord.expiresAt)) {
      // Delete expired OTP
      await prisma.otpCode.delete({
        where: { phone: normalizedPhone },
      });
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Compare OTP with hash
    const isOTPValid = await bcrypt.compare(otp, otpRecord.codeHash);

    if (!isOTPValid) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Delete OTP after successful verification
    await prisma.otpCode.delete({
      where: { phone: normalizedPhone },
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          mpesaNumber: normalizedPhone, // Set to phone by default
          name: 'Pending', // Will be updated in register-details
          role: 'BUYER', // Default role
          isVerified: true,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token: token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/auth/register-details
 * Save user details after OTP verification
 * Requires: JWT token in Authorization header
 */
export const registerDetails = async (req, res) => {
  try {
    const { name, role, county, mpesaNumber } = req.body;
    const userId = req.user.userId; // From JWT middleware

    // Validate required fields
    if (!name || !role || !county) {
      return res.status(400).json({
        error: 'Name, role, and county are required',
      });
    }

    // Validate role
    if (!['FARMER', 'BUYER'].includes(role)) {
      return res.status(400).json({
        error: 'Role must be FARMER or BUYER',
      });
    }

    // Validate county exists in enum
    const validCounties = [
      'MOMBASA', 'KWALE', 'KILIFI', 'TANA_RIVER', 'LAMU', 'TAITA_TAVETA',
      'GARISSA', 'WAJIR', 'MANDERA', 'MARSABIT', 'ISIOLO', 'SAMBURU',
      'TURKANA', 'WEST_POKOT', 'BARINGO', 'ELGEYO_MARAKWET', 'NANDI',
      'UASIN_GISHU', 'KERICHO', 'BOMET', 'KAKAMEGA', 'VIHIGA', 'BUNGOMA',
      'BUSIA', 'SIAYA', 'KISUMU', 'HOMA_BAY', 'MIGORI', 'NYAMIRA',
      'KISII', 'NAROK', 'KAJIADO', 'KERICHO', 'NAKURU', 'NAIROBI',
      'KIAMBU', 'MURANGA', 'MURANG_A', 'NYERI', 'KIRINYAGA', 'EMBU', 'MERU',
      'THARAKA_NITHI', 'MACHAKOS', 'MAKUENI', 'NYANDARUA', 'LAIKIPIA',
    ];

    if (!validCounties.includes(county)) {
      return res.status(400).json({
        error: 'Invalid county',
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        role: role,
        county: county,
        mpesaNumber: mpesaNumber || req.user.phone,
        isVerified: true,
      },
    });

    // Create profile based on role
    if (role === 'FARMER') {
      // Check if profile already exists
      const existingProfile = await prisma.farmerProfile.findUnique({
        where: { userId: userId },
      });

      if (!existingProfile) {
        await prisma.farmerProfile.create({
          data: {
            userId: userId,
            farmSizeAcres: 0, // Default value
            cropsGrown: [], // Empty array
            county: county,
          },
        });
      }
    } else if (role === 'BUYER') {
      // Check if profile already exists
      const existingProfile = await prisma.buyerProfile.findUnique({
        where: { userId: userId },
      });

      if (!existingProfile) {
        await prisma.buyerProfile.create({
          data: {
            userId: userId,
            businessName: name,
            businessType: 'Individual',
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'User details registered successfully',
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        name: updatedUser.name,
        role: updatedUser.role,
        county: updatedUser.county,
        isVerified: updatedUser.isVerified,
      },
    });
  } catch (error) {
    console.error('Register Details Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/auth/me
 * Get current user from JWT
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        farmerProfile: true,
        buyerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        county: user.county,
        mpesaNumber: user.mpesaNumber,
        isVerified: user.isVerified,
        farmerProfile: user.farmerProfile,
        buyerProfile: user.buyerProfile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get Current User Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
