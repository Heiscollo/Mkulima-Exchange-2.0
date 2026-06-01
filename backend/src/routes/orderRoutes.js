import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireBuyer, requireFarmer } from '../middleware/roleMiddleware.js';
import {
  createOrder,
  getOrders,
  getOrderById,
  acceptOrder,
  rejectOrder,
  sendCounterOffer,
  acceptCounter,
  rejectCounter,
  buyerSendCounter,
} from '../controllers/orderController.js';

const router = express.Router();

// All order endpoints require authentication
router.use(authenticateToken);

/**
 * POST /api/orders
 * Buyers only - Place an order
 * Body: {
 *   listing_id: string (required),
 *   quantity: number (required),
 *   offered_price_per_unit: number (optional)
 * }
 */
router.post('/', requireBuyer, createOrder);

/**
 * GET /api/orders
 * Authenticated - Buyers see their orders, farmers see orders on their listings
 * Query: status (optional) - filter by order status
 */
router.get('/', getOrders);

/**
 * GET /api/orders/:id
 * Full order details with listing and user info
 */
router.get('/:id', getOrderById);

/**
 * PATCH /api/orders/:id/accept
 * Farmer only - Accept order
 */
router.patch('/:id/accept', requireFarmer, acceptOrder);

/**
 * PATCH /api/orders/:id/reject
 * Farmer only - Reject order
 * Body: {
 *   reason: string (optional)
 * }
 */
router.patch('/:id/reject', requireFarmer, rejectOrder);

/**
 * PATCH /api/orders/:id/counter
 * Farmer only - Send counter offer
 * Body: {
 *   counter_price_per_unit: number (required)
 * }
 */
router.patch('/:id/counter', requireFarmer, sendCounterOffer);

/**
 * PATCH /api/orders/:id/accept-counter
 * Buyer only - Accept counter offer
 */
router.patch('/:id/accept-counter', requireBuyer, acceptCounter);

/**
 * PATCH /api/orders/:id/reject-counter
 * Buyer only - Reject counter offer
 */
router.patch('/:id/reject-counter', requireBuyer, rejectCounter);

/**
 * PATCH /api/orders/:id/buyer-counter
 * Buyer only - Send counter offer after rejecting
 * Body: {
 *   offered_price_per_unit: number (required)
 * }
 */
router.patch('/:id/buyer-counter', requireBuyer, buyerSendCounter);

export default router;

