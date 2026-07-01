import { PrismaClient } from '@prisma/client';
import { errorResponse, successResponse } from '../utils/helpers.js';

const prisma = new PrismaClient();

/**
 * POST /api/reviews
 *
 * The review system is intentionally gated behind a COMPLETED order because
 * reputation in a marketplace should describe fulfilled exchange, not merely
 * promised exchange. For farmer protection, this reduces the chance that a
 * buyer can weaponize feedback before the transaction is actually finished.
 */
export const postReview = async (req, res) => {
  try {
    const { order_id, rating, comment } = req.body;
    const reviewerId = req.user?.userId;

    if (!order_id || rating === undefined) {
      return errorResponse(res, 400, 'order_id and rating are required');
    }

    const ratingValue = Number(rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return errorResponse(res, 400, 'Rating must be an integer between 1 and 5');
    }

    if (comment && String(comment).trim().length > 1000) {
      return errorResponse(res, 400, 'Comment must not exceed 1000 characters');
    }

    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: {
        buyer: true,
        farmer: true,
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (order.status !== 'COMPLETED') {
      return errorResponse(res, 400, 'Unaweza kukagua agizo baada ya kukamilika tu.');
    }

    const isBuyer = order.buyerId === reviewerId;
    const isFarmer = order.farmerId === reviewerId;

    if (!isBuyer && !isFarmer) {
      return errorResponse(res, 403, 'You can only review orders you are part of');
    }

    const reviewedId = isBuyer ? order.farmerId : order.buyerId;

    if (reviewerId === reviewedId) {
      return errorResponse(res, 400, 'You cannot review yourself');
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId,
        orderId: order_id,
      },
    });

    if (existingReview) {
      return errorResponse(res, 400, 'Umeshakagua agizo hili tayari.');
    }

    const review = await prisma.review.create({
      data: {
        reviewerId,
        reviewedId,
        orderId: order_id,
        rating: ratingValue,
        comment: comment ? String(comment).trim() : null,
      },
      include: {
        reviewer: { select: { id: true, name: true, role: true } },
        reviewed: { select: { id: true, name: true, role: true } },
        order: {
          select: {
            id: true,
            status: true,
            listing: { select: { id: true, cropName: true, county: true } },
          },
        },
      },
    });

    return successResponse(res, 201, 'Review created successfully', review);
  } catch (error) {
    console.error('Post Review Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};
