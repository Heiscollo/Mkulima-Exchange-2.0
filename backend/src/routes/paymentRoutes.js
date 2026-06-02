import express from 'express';
import {
  initiatePayment,
  handleDarajaCallback,
  confirmDelivery,
  refundPayment,
  getPaymentStatus,
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireBuyer, requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ============================================================================
// PAYMENT ROUTES - M-PESA ESCROW SYSTEM
// ============================================================================

/**
 * POST /api/payments/initiate/:orderId
 * Initiate M-Pesa STK Push payment for buyer
 * - Authenticated (buyer only)
 * - Validates order belongs to buyer and is ACCEPTED
 * - Calls Daraja STK Push API to prompt PIN entry on buyer's phone
 * - Creates Payment record with PENDING status
 * 
 * FLOW:
 * 1. Frontend detects order ACCEPTED
 * 2. User clicks "Pay Now"
 * 3. This endpoint initiates STK Push
 * 4. User enters M-Pesa PIN on their phone
 * 5. Daraja calls our callback endpoint
 * 6. Payment status updates to HELD (escrow)
 */
router.post('/initiate/:orderId', authenticateToken, requireBuyer, initiatePayment);

/**
 * POST /api/payments/callback
 * Daraja webhook - M-Pesa transaction response
 * - PUBLIC endpoint (no auth, Daraja uses IP whitelist)
 * - Called after buyer attempts M-Pesa payment
 * - ResultCode 0 = success, non-zero = failure
 * 
 * ON SUCCESS:
 * - Payment status → HELD (money in escrow)
 * - Order status → PAID
 * - SMS to farmer: "Payment received, send your goods"
 * - SMS to buyer: "Payment successful, waiting for delivery"
 * 
 * ON FAILURE:
 * - Payment status → REFUNDED
 * - Order status → ACCEPTED (buyer can retry)
 * - SMS to buyer: "Payment failed, try again"
 */
router.post('/callback', handleDarajaCallback);

/**
 * PATCH /api/payments/confirm-delivery/:orderId
 * Buyer or Farmer confirms they received/sent goods
 * - Authenticated (buyer or farmer on order)
 * - Order must be in PAID status
 * 
 * ESCROW RELEASE LOGIC:
 * - Sets buyerConfirmed or farmerConfirmed to true
 * - When BOTH are true:
 *   * Payment status → RELEASED
 *   * Order status → COMPLETED
 *   * Farmer gets paid (B2C transfer)
 *   * SMS confirmations sent to both
 * 
 * This 2-of-2 confirmation prevents disputes
 */
router.patch('/confirm-delivery/:orderId', authenticateToken, confirmDelivery);

/**
 * POST /api/payments/refund/:orderId
 * Admin refunds a disputed payment
 * - Authenticated (admin only)
 * - Updates Payment status → REFUNDED
 * - Updates Order status → DISPUTED
 * - SMS to buyer: "Your money will be refunded in 3-5 days"
 * - SMS to farmer: "This order is disputed, we'll contact you"
 */
router.post('/refund/:orderId', authenticateToken, requireAdmin, refundPayment);

/**
 * GET /api/payments/:orderId
 * Get payment details for an order
 * - Authenticated (buyer, farmer, or admin on order)
 * - Returns status, transaction ID, confirmation flags
 * - Used by frontend to display payment progress
 */
router.get('/:orderId', authenticateToken, getPaymentStatus);

export default router;
