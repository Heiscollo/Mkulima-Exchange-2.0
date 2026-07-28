import { PrismaClient, Prisma } from '@prisma/client';
import { errorResponse, successResponse } from '../utils/helpers.js';
import { isValidKenyaPhone, normalizePhone } from '../utils/phone.js';

const prisma = new PrismaClient();

/**
 * Reputation is a compressed signal of market reliability. In low-trust,
 * high-friction environments like agricultural trading, buyers often cannot
 * inspect quality ex ante, so a public profile needs to surface both social
 * proof (average rating) and economic proof (completed transactions).
 */
const buildTrustBadge = (role, completedTransactions) => {
  if (completedTransactions === 0) return 'New';
  if (completedTransactions < 5) return 'Verified';
  if (completedTransactions < 20) return 'Trusted';

  if (role === 'FARMER') return 'Top Seller';
  if (role === 'BUYER') return 'Top Buyer';

  return 'Trusted';
};

const buildPublicProfile = (user, averageRating, completedTransactions) => {
  const trustBadge = buildTrustBadge(user.role, completedTransactions);

  return {
    id: user.id,
    name: user.name,
    role: user.role,
    county: user.county,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    averageRating,
    completedTransactions,
    trustBadge,
    farmerProfile: user.farmerProfile
      ? {
          farmSizeAcres: user.farmerProfile.farmSizeAcres,
          cropsGrown: user.farmerProfile.cropsGrown,
          county: user.farmerProfile.county,
        }
      : null,
    buyerProfile: user.buyerProfile
      ? {
          businessName: user.buyerProfile.businessName,
          businessType: user.buyerProfile.businessType,
        }
      : null,
  };
};

export const getUserReviews = async (req, res) => {
  try {
    const userId = req.params.id || req.params.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true },
    });

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const [reviews, ratingAggregate] = await Promise.all([
      prisma.review.findMany({
        where: { reviewedId: userId },
        include: {
          reviewer: { select: { id: true, name: true, role: true } },
          order: {
            select: {
              id: true,
              status: true,
              listing: { select: { id: true, cropName: true, county: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.aggregate({
        where: { reviewedId: userId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    const averageRating = ratingAggregate._avg.rating
      ? Number(ratingAggregate._avg.rating.toFixed(2))
      : 0;

    return successResponse(res, 200, 'User reviews retrieved successfully', {
      user,
      reviews,
      averageRating,
      reviewCount: ratingAggregate._count.rating,
    });
  } catch (error) {
    console.error('Get User Reviews Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        farmerProfile: true,
        buyerProfile: true,
      },
    });

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const completedTransactionWhere =
      user.role === 'FARMER'
        ? { farmerId: userId, status: 'COMPLETED' }
        : user.role === 'BUYER'
          ? { buyerId: userId, status: 'COMPLETED' }
          : { OR: [{ farmerId: userId }, { buyerId: userId }], status: 'COMPLETED' };

    const [ratingAggregate, completedTransactions] = await Promise.all([
      prisma.review.aggregate({
        where: { reviewedId: userId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.order.count({
        where: completedTransactionWhere,
      }),
    ]);

    const averageRating = ratingAggregate._avg.rating
      ? Number(ratingAggregate._avg.rating.toFixed(2))
      : 0;

    // The badge is not just decoration. It is a market shorthand for a long
    // history of fulfilled exchange, which helps smallholders compete against
    // larger, more established actors without relying on institutional memory.
    const profile = buildPublicProfile(user, averageRating, completedTransactions);

    return successResponse(res, 200, 'User profile retrieved successfully', profile);
  } catch (error) {
    console.error('Get User Profile Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

export const updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const {
      name,
      county,
      mpesaNumber,
      farmSizeAcres,
      cropsGrown,
      businessName,
      businessType,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        farmerProfile: true,
        buyerProfile: true,
      },
    });

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const userUpdateData = {};
    const hasProfileSpecificUpdates =
      farmSizeAcres !== undefined ||
      cropsGrown !== undefined ||
      businessName !== undefined ||
      businessType !== undefined;

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return errorResponse(res, 400, 'Name cannot be empty');
      }
      userUpdateData.name = trimmedName;
    }

    if (county !== undefined) {
      if (!Object.values(Prisma.County).includes(county)) {
        return errorResponse(res, 400, 'Invalid county');
      }
      userUpdateData.county = county;
    }

    if (mpesaNumber !== undefined) {
      const normalizedMpesaNumber = normalizePhone(mpesaNumber);
      if (!isValidKenyaPhone(normalizedMpesaNumber)) {
        return errorResponse(res, 400, 'Invalid M-Pesa number');
      }
      userUpdateData.mpesaNumber = normalizedMpesaNumber;
    }

    if (!Object.keys(userUpdateData).length && !hasProfileSpecificUpdates) {
      return errorResponse(res, 400, 'No profile fields provided');
    }

    // Sequential individual queries — no $transaction wrapper.
    // Supabase's free-tier connection pooler drops interactive transactions,
    // which surfaced as P2028 transaction timeout errors here.
    const currentUser = Object.keys(userUpdateData).length
      ? await prisma.user.update({
          where: { id: userId },
          data: userUpdateData,
        })
      : user;

    if (currentUser.role === 'FARMER') {
      const updateFarmSize = farmSizeAcres !== undefined ? Number(farmSizeAcres) : undefined;
      if (updateFarmSize !== undefined && Number.isNaN(updateFarmSize)) {
        throw new Error('Farm size must be a number');
      }

      const cropsArray = cropsGrown === undefined
        ? undefined
        : Array.isArray(cropsGrown)
          ? cropsGrown.map((crop) => String(crop).trim()).filter(Boolean)
          : String(cropsGrown)
              .split(',')
              .map((crop) => crop.trim())
              .filter(Boolean);

      const existingFarmerProfile = await prisma.farmerProfile.findUnique({
        where: { userId },
      });

      if (existingFarmerProfile) {
        await prisma.farmerProfile.update({
          where: { userId },
          data: {
            ...(updateFarmSize !== undefined ? { farmSizeAcres: updateFarmSize } : {}),
            ...(cropsArray !== undefined ? { cropsGrown: cropsArray } : {}),
            ...(county !== undefined ? { county } : {}),
          },
        });
      } else {
        await prisma.farmerProfile.create({
          data: {
            userId,
            farmSizeAcres: updateFarmSize,
            cropsGrown: cropsArray || [],
            county: county || currentUser.county,
          },
        });
      }
    }

    if (currentUser.role === 'BUYER') {
      const existingBuyerProfile = await prisma.buyerProfile.findUnique({
        where: { userId },
      });

      if (existingBuyerProfile) {
        await prisma.buyerProfile.update({
          where: { userId },
          data: {
            ...(businessName !== undefined ? { businessName: String(businessName).trim() } : {}),
            ...(businessType !== undefined ? { businessType: String(businessType).trim() } : {}),
          },
        });
      } else {
        await prisma.buyerProfile.create({
          data: {
            userId,
            businessName: businessName !== undefined ? String(businessName).trim() : currentUser.name,
            businessType: businessType !== undefined ? String(businessType).trim() : 'Individual',
          },
        });
      }
    }

    const updatedUser = currentUser;

    const refreshedUser = await prisma.user.findUnique({
      where: { id: updatedUser.id },
      include: {
        farmerProfile: true,
        buyerProfile: true,
      },
    });

    return successResponse(res, 200, 'Profile updated successfully', refreshedUser);
  } catch (error) {
    console.error('Update Own Profile Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};