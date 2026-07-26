import { PrismaClient } from '@prisma/client';
import {
  sendOrderCreatedNotification,
  sendOrderAcceptedNotification,
  sendOrderRejectedNotification,
  sendCounterOfferNotification,
  sendCounterAcceptedNotification,
  sendCounterRejectedNotification,
  sendBuyerCounterNotification,
  sendOrderExpiredFarmerNotification,
  sendOrderExpiredBuyerNotification,
} from '../utils/sms.js';
import { errorResponse, successResponse, formatPhoneNumber } from '../utils/helpers.js';

const prisma = new PrismaClient();

/**
 * 1. POST /api/orders
 * Buyers only - Place an order
 */
export const createOrder = async (req, res) => {
  try {
    const { listing_id, quantity, offered_price_per_unit } = req.body;
    const buyerId = req.user.userId;

    // Validate required fields
    if (!listing_id || !quantity) {
      return errorResponse(res, 400, 'Missing required fields: listing_id, quantity');
    }

    // Get listing with farmer details
    const listing = await prisma.listing.findUnique({
      where: { id: listing_id },
      include: { farmer: true },
    });

    if (!listing) {
      return errorResponse(res, 404, 'Listing not found');
    }

    // Validate quantity doesn't exceed listing quantity
    const quantityNum = parseFloat(quantity);
    if (quantityNum > listing.quantity) {
      return errorResponse(
        res,
        400,
        `Samahani, unahitaji ${quantityNum} ${listing.unit} lakini mkulima ana ${listing.quantity} ${listing.unit} tu.`
      );
    }

    // Validate quantity meets minimum order quantity if set
    if (listing.minimumOrderQuantity && quantityNum < listing.minimumOrderQuantity) {
      return errorResponse(
        res,
        400,
        `Ununuzi wa chini ni ${listing.minimumOrderQuantity} ${listing.unit} kwa orodha hii.`
      );
    }

    // Calculate total price
    const pricePerUnit = offered_price_per_unit || listing.pricePerUnit;
    const totalPrice = quantityNum * pricePerUnit;

    // Set expiry to 48 hours from now
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Create order
    const order = await prisma.order.create({
      data: {
        listingId: listing_id,
        buyerId: buyerId,
        farmerId: listing.farmerId,
        quantity: quantityNum,
        offeredPrice: offered_price_per_unit ? pricePerUnit : null,
        totalPrice: totalPrice,
        expiresAt: expiresAt,
        status: 'PENDING',
      },
      include: {
        listing: { include: { farmer: true } },
        buyer: true,
        farmer: true,
      },
    });

    // Send SMS to farmer in Swahili
    const farmerPhone = formatPhoneNumber(listing.farmer.phone);
    await sendOrderCreatedNotification(
      farmerPhone,
      listing.farmer.name,
      quantityNum,
      listing.unit,
      listing.cropName,
      totalPrice
    );

    return successResponse(res, 201, 'Order created successfully', order);
  } catch (error) {
    console.error('Create Order Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

/**
 * 2. GET /api/orders
 * Authenticated - Buyers see their orders, farmers see orders on their listings
 * Query params: status (filter)
 */
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { status } = req.query;

    let where = {};

    // Buyers see their orders
    if (userRole === 'BUYER') {
      where.buyerId = userId;
    }
    // Farmers see orders on their listings
    else if (userRole === 'FARMER') {
      where.farmerId = userId;
    } else {
      return errorResponse(res, 403, 'Only buyers and farmers can view orders');
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        listing: {
          include: { farmer: true },
        },
        buyer: true,
        farmer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add computed field isExpired for each order
    const ordersWithExpiry = orders.map((order) => ({
      ...order,
      isExpired: order.expiresAt && new Date(order.expiresAt) < new Date(),
    }));

    return successResponse(res, 200, 'Orders retrieved successfully', ordersWithExpiry);
  } catch (error) {
    console.error('Get Orders Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

/**
 * 3. GET /api/orders/:id
 * Full order details with listing and user info
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: {
          include: { farmer: true },
        },
        buyer: true,
        farmer: true,
        payment: true,
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true, role: true } },
            reviewed: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Check authorization
    if (order.buyerId !== userId && order.farmerId !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Not authorized to view this order');
    }

    const orderWithExpiry = {
      ...order,
      isExpired: order.expiresAt && new Date(order.expiresAt) < new Date(),
    };

    return successResponse(res, 200, 'Order retrieved successfully', orderWithExpiry);
  } catch (error) {
    console.error('Get Order By ID Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

/**
 * 4. PATCH /api/orders/:id/accept
 * Farmer only - Accept order
 */
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user.userId;

    // Get order with relationships
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Check authorization
    if (order.farmerId !== farmerId) {
      return errorResponse(res, 403, 'Only the farmer can accept this order');
    }

    // Check if order has expired
    if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
      return errorResponse(res, 400, 'Agizo hili limeisha muda wake.');
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        farmerConfirmed: true,
      },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    // Send SMS to buyer in Swahili
    const buyerPhone = formatPhoneNumber(order.buyer.phone);
    await sendOrderAcceptedNotification(
      buyerPhone,
      order.farmer.name,
      order.quantity,
      order.listing.unit,
      order.listing.cropName,
      order.totalPrice
    );

    return successResponse(res, 200, 'Order accepted successfully', updatedOrder);
  } catch (error) {
    console.error('Accept Order Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

/**
 * 5. PATCH /api/orders/:id/reject
 * Farmer only - Reject order
 */
export const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const farmerId = req.user.userId;

    // Get order with relationships
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Check authorization
    if (order.farmerId !== farmerId) {
      return errorResponse(res, 403, 'Only the farmer can reject this order');
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    // Send SMS to buyer in Swahili
    const buyerPhone = formatPhoneNumber(order.buyer.phone);
    await sendOrderRejectedNotification(
      buyerPhone,
      order.farmer.name,
      order.listing.cropName,
      reason || 'Simu'
    );

    return successResponse(res, 200, 'Order rejected successfully', updatedOrder);
  } catch (error) {
    console.error('Reject Order Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

/**
 * 6. PATCH /api/orders/:id/counter
 * Farmer only - Send counter offer
 */
export const sendCounterOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { counter_price_per_unit } = req.body;
    const farmerId = req.user.userId;

    if (!counter_price_per_unit) {
      return errorResponse(res, 400, 'counter_price_per_unit is required');
    }

    // Get order with relationships
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Check authorization
    if (order.farmerId !== farmerId) {
      return errorResponse(res, 403, 'Only the farmer can send counter offers');
    }

    // Check if order has expired
    if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
      return errorResponse(res, 400, 'Agizo hili limeisha muda wake.');
    }

    // Check counter round limit (max 3)
    if (order.counterRound >= 3) {
      return errorResponse(res, 400, 'Umefika kikomo cha mazungumzo ya bei. Kubali au kataa bei ya sasa.');
    }

    // Calculate new total price
    const counterPrice = parseFloat(counter_price_per_unit);
    const newTotalPrice = order.quantity * counterPrice;
    const newCounterRound = order.counterRound + 1;

    // Update order with counter offer
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        offeredPrice: counterPrice,
        totalPrice: newTotalPrice,
        counterRound: newCounterRound,
        status: 'PENDING',
      },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    // Send SMS to buyer in Swahili
    const buyerPhone = formatPhoneNumber(order.buyer.phone);
    await sendCounterOfferNotification(
      buyerPhone,
      order.farmer.name,
      counterPrice,
      order.listing.unit,
      newTotalPrice,
      newCounterRound
    );

    return successResponse(res, 200, 'Counter offer sent successfully', updatedOrder);
  } catch (error) {
    console.error('Send Counter Offer Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

/**
 * 7. PATCH /api/orders/:id/accept-counter
 * Buyer only - Accept counter offer
 */
export const acceptCounter = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.userId;

    // Get order with relationships
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Check authorization
    if (order.buyerId !== buyerId) {
      return errorResponse(res, 403, 'Only the buyer can accept counter offers');
    }

    // Check if order has expired
    if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
      return errorResponse(res, 400, 'Agizo hili limeisha muda wake.');
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        buyerConfirmed: true,
      },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    // Send SMS to farmer in Swahili
    const farmerPhone = formatPhoneNumber(order.farmer.phone);
    await sendCounterAcceptedNotification(
      farmerPhone,
      order.farmer.name,
      order.offeredPrice,
      order.listing.unit,
      order.totalPrice
    );

    return successResponse(res, 200, 'Counter offer accepted successfully', updatedOrder);
  } catch (error) {
    console.error('Accept Counter Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

/**
 * 8. PATCH /api/orders/:id/reject-counter
 * Buyer only - Reject counter offer
 */
export const rejectCounter = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.userId;

    // Get order with relationships
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Check authorization
    if (order.buyerId !== buyerId) {
      return errorResponse(res, 403, 'Only the buyer can reject counter offers');
    }

    // Determine new status based on counter round
    const isLastRound = order.counterRound >= 3;
    const newStatus = isLastRound ? 'REJECTED' : 'PENDING';

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
      },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    // Send SMS to farmer in Swahili
    const farmerPhone = formatPhoneNumber(order.farmer.phone);
    const hasMoreRounds = order.counterRound < 3;
    await sendCounterRejectedNotification(
      farmerPhone,
      order.farmer.name,
      order.counterRound,
      hasMoreRounds
    );

    return successResponse(res, 200, 'Counter offer rejected successfully', updatedOrder);
  } catch (error) {
    console.error('Reject Counter Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

/**
 * 9. PATCH /api/orders/:id/buyer-counter
 * Buyer only - Send counter offer after rejecting
 */
export const buyerSendCounter = async (req, res) => {
  try {
    const { id } = req.params;
    const { offered_price_per_unit } = req.body;
    const buyerId = req.user.userId;

    if (!offered_price_per_unit) {
      return errorResponse(res, 400, 'offered_price_per_unit is required');
    }

    // Get order with relationships
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Check authorization
    if (order.buyerId !== buyerId) {
      return errorResponse(res, 403, 'Only the buyer can send counter offers');
    }

    // Check if counter round is less than 3
    if (order.counterRound >= 3) {
      return errorResponse(res, 400, 'Umefika kikomo cha mazungumzo ya bei.');
    }

    // Calculate new total price
    const offeredPrice = parseFloat(offered_price_per_unit);
    const newTotalPrice = order.quantity * offeredPrice;
    const newCounterRound = order.counterRound + 1;

    // Update order with new counter offer
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        offeredPrice: offeredPrice,
        totalPrice: newTotalPrice,
        counterRound: newCounterRound,
        status: 'PENDING',
      },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    // Send SMS to farmer in Swahili
    const farmerPhone = formatPhoneNumber(order.farmer.phone);
    await sendBuyerCounterNotification(
      farmerPhone,
      order.farmer.name,
      offeredPrice,
      order.listing.unit,
      newTotalPrice,
      newCounterRound
    );

    return successResponse(res, 200, 'Counter offer sent successfully', updatedOrder);
  } catch (error) {
    console.error('Buyer Send Counter Error:', error);
    return errorResponse(res, 500, 'Internal server error', error.message);
  }
};

/**
 * 10. Check expired orders
 * Finds all PENDING orders where expiresAt is past
 * Sets them to REJECTED and sends SMS notifications
 */
export const checkExpiredOrders = async () => {
  try {
    const now = new Date();

    // Find all expired PENDING orders
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: now,
        },
      },
      include: {
        listing: true,
        buyer: true,
        farmer: true,
      },
    });

    if (expiredOrders.length === 0) {
      console.log('No expired orders found');
      return;
    }

    console.log(`Found ${expiredOrders.length} expired orders to process`);

    // Process each expired order
    for (const order of expiredOrders) {
      // Update order to REJECTED
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'REJECTED' },
      });

      // Send SMS to farmer
      const farmerPhone = formatPhoneNumber(order.farmer.phone);
      await sendOrderExpiredFarmerNotification(farmerPhone, order.listing.cropName);

      // Send SMS to buyer
      const buyerPhone = formatPhoneNumber(order.buyer.phone);
      await sendOrderExpiredBuyerNotification(buyerPhone, order.listing.cropName);

      console.log(`Expired order ${order.id} marked as REJECTED and notifications sent`);
    }
  } catch (error) {
    console.error('Check Expired Orders Error:', error);
  }
};
