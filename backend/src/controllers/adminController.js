import { PrismaClient } from '@prisma/client';
import {
  sendDisputeReportedToFarmer,
  sendOrderCompletedTobuyer,
  sendPaymentReleasedToFarmer,
  sendPaymentRefundedTobuyer,
} from '../utils/sms.js';
import { errorResponse, successResponse } from '../utils/helpers.js';

const prisma = new PrismaClient();

/**
 * Dispute handling is a governance function, not just a CRUD action. The
 * marketplace needs a neutral intervention point because escrow can only
 * protect farmers if unresolved conflict is visible, auditable, and reversible
 * by a trusted administrator.
 */
export const getDisputes = async (req, res) => {
  try {
    const disputes = await prisma.order.findMany({
      where: { status: 'DISPUTED' },
      include: {
        buyer: true,
        farmer: true,
        listing: true,
        payment: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return successResponse(res, 200, 'Disputes retrieved successfully', disputes);
  } catch (error) {
    console.error('Get Disputes Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

export const resolveDisputedOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    if (!['COMPLETED', 'REFUNDED'].includes(resolution)) {
      return errorResponse(res, 400, 'resolution must be either COMPLETED or REFUNDED');
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: true,
        farmer: true,
        listing: true,
        payment: true,
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (order.status !== 'DISPUTED') {
      return errorResponse(res, 400, 'Only disputed orders can be resolved');
    }

    if (!order.payment) {
      return errorResponse(res, 400, 'No payment found for this order');
    }

    const updatedOrder = await prisma.$transaction(async (transaction) => {
      await transaction.payment.update({
        where: { id: order.payment.id },
        data:
          resolution === 'COMPLETED'
            ? {
                status: 'RELEASED',
                buyerConfirmed: true,
                farmerConfirmed: true,
              }
            : {
                status: 'REFUNDED',
              },
      });

      return transaction.order.update({
        where: { id },
        data: {
          status: resolution,
        },
        include: {
          buyer: true,
          farmer: true,
          listing: true,
          payment: true,
        },
      });
    });

    if (resolution === 'COMPLETED') {
      await Promise.allSettled([
        sendPaymentReleasedToFarmer(
          order.farmer.mpesaNumber,
          order.farmer.name,
          order.totalPrice,
          order.farmer.mpesaNumber
        ),
        sendOrderCompletedTobuyer(order.buyer.mpesaNumber),
      ]);
    } else {
      await Promise.allSettled([
        sendPaymentRefundedTobuyer(order.buyer.mpesaNumber, order.totalPrice),
        sendDisputeReportedToFarmer(order.farmer.mpesaNumber),
      ]);
    }

    return successResponse(res, 200, 'Disputed order resolved successfully', updatedOrder);
  } catch (error) {
    console.error('Resolve Disputed Order Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

export const getStats = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalFarmers,
      totalBuyers,
      totalActiveListings,
      totalOrders,
      totalCompletedOrders,
      completedValueAggregate,
      totalDisputedOrders,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalPrice: true },
      }),
      prisma.order.count({ where: { status: 'DISPUTED' } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    return successResponse(res, 200, 'Platform statistics retrieved successfully', {
      totalFarmers,
      totalBuyers,
      totalActiveListings,
      totalOrders,
      totalCompletedOrders,
      totalValueTransactedKes: Number(completedValueAggregate._sum.totalPrice || 0),
      totalDisputedOrders,
      newUsersThisMonth,
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};