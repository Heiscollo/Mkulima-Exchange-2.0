import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Prisma, PrismaClient } from '@prisma/client';
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
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    // Compare OTP with hash
    const isOTPValid = await bcrypt.compare(otp, otpRecord.codeHash);

    if (!isOTPValid) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Delete OTP after successful verification
    await prisma.otpCode.delete({
      where: { id: otpRecord.id },
    });

    // Check whether the phone already belongs to an existing user
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        isNewUser: true,
        token: null,
        message: 'New user - registration required',
        phone: normalizedPhone,
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
      isNewUser: false,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        county: user.county,
        mpesaNumber: user.mpesaNumber,
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
    const { phone, name, role, county, mpesaNumber } = req.body;

    if (!phone || !name || !role || !county) {
      return res.status(400).json({
        error: 'Phone, name, role, and county are required',
      });
    }

    const normalizedPhone = normalizePhone(phone);

    if (!isValidKenyaPhone(normalizedPhone)) {
      return res.status(400).json({
        error: 'Invalid Kenyan phone number',
      });
    }

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

    const VALID_COUNTIES = [
      'MOMBASA','KWALE','KILIFI','TANA_RIVER','LAMU',
      'TAITA_TAVETA','GARISSA','WAJIR','MANDERA','MARSABIT',
      'ISIOLO','MERU','THARAKA_NITHI','EMBU','KITUI',
      'MACHAKOS','MAKUENI','NYANDARUA','NYERI','KIRINYAGA',
      'MURANGA','KIAMBU','TURKANA','WEST_POKOT','SAMBURU',
      'TRANS_NZOIA','UASIN_GISHU','ELGEYO_MARAKWET','NANDI',
      'BARINGO','LAIKIPIA','NAKURU','NAROK','KAJIADO',
      'KERICHO','BOMET','KAKAMEGA','VIHIGA','BUNGOMA',
      'BUSIA','SIAYA','KISUMU','HOMA_BAY','MIGORI',
      'KISII','NYAMIRA','NAIROBI'
    ];

    if (!VALID_COUNTIES.includes(county)) {
      return res.status(400).json({
        error: 'Invalid county',
      });
    }

    // Sequential individual queries — no $transaction wrapper.
    // Supabase's free-tier connection pooler drops interactive transactions,
    // which surfaced as P2028 transaction timeout errors here.
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    const userData = {
      phone: normalizedPhone,
      name,
      role,
      county,
      mpesaNumber: mpesaNumber || normalizedPhone,
      isVerified: true,
    };

    const savedUser = existingUser
      ? await prisma.user.update({
          where: { phone: normalizedPhone },
          data: userData,
        })
      : await prisma.user.create({
          data: userData,
        });

    if (role === 'FARMER') {
      const existingProfile = await prisma.farmerProfile.findUnique({
        where: { userId: savedUser.id },
      });

      if (existingProfile) {
        await prisma.farmerProfile.update({
          where: { userId: savedUser.id },
          data: { county },
        });
      } else {
        await prisma.farmerProfile.create({
          data: {
            userId: savedUser.id,
            farmSizeAcres: 0,
            cropsGrown: [],
            county,
          },
        });
      }
    }

    if (role === 'BUYER') {
      const existingProfile = await prisma.buyerProfile.findUnique({
        where: { userId: savedUser.id },
      });

      if (existingProfile) {
        await prisma.buyerProfile.update({
          where: { userId: savedUser.id },
          data: {
            businessName: name,
            businessType: 'Individual',
          },
        });
      } else {
        await prisma.buyerProfile.create({
          data: {
            userId: savedUser.id,
            businessName: name,
            businessType: 'Individual',
          },
        });
      }
    }

    const token = jwt.sign(
      {
        userId: savedUser.id,
        phone: savedUser.phone,
        role: savedUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'User details registered successfully',
      token,
      user: {
        id: savedUser.id,
        phone: savedUser.phone,
        name: savedUser.name,
        role: savedUser.role,
        county: savedUser.county,
        mpesaNumber: savedUser.mpesaNumber,
        isVerified: savedUser.isVerified,
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
