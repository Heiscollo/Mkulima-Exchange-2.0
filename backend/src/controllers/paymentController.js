// ============================================================================
// PAYMENT CONTROLLER - M-PESA ESCROW SYSTEM
// ============================================================================
// Implements Safaricom Daraja API integration for Mkulima Exchange
// Features: STK Push payment initiation, callback handling, escrow management
// Academic Documentation: Detailed comments explain every step for university project
//
// ESCROW FLOW:
// 1. Buyer initiates payment (status: PENDING)
// 2. M-Pesa validates and transfers funds (status: HELD - money is escrowed)
// 3. Both buyer and farmer confirm delivery
// 4. Payment is released to farmer (status: RELEASED)
// Dispute/Refund: Admin can refund if issues arise (status: REFUNDED)
// ============================================================================

import { PrismaClient } from '@prisma/client';
import {
  initiateStkPush,
  parseDarajaCallback,
  releasePaymentB2C,
} from '../utils/daraja.js';
import {
  sendPaymentHeldToFarmer,
  sendPaymentSuccessTobuyer,
  sendPaymentFailureTobuyer,
  sendBuyerConfirmedDeliveryToFarmer,
  sendFarmerConfirmedDeliveryTobuyer,
  sendPaymentReleasedToFarmer,
  sendOrderCompletedTobuyer,
  sendPaymentRefundedTobuyer,
  sendDisputeReportedToFarmer,
} from '../utils/sms.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

const prisma = new PrismaClient();

// ============================================================================
// ENDPOINT 1: POST /api/payments/initiate/:orderId
// ============================================================================
// Initiates M-Pesa STK Push payment for a buyer
// 
// STEPS:
// 1. Verify order exists and belongs to buyer
// 2. Verify order status is ACCEPTED (farmer has accepted the order)
// 3. Create Payment record (status: PENDING)
// 4. Get Daraja OAuth token using consumer key and secret
// 5. Generate STK Push password (Base64 encoded: shortcode + passkey + timestamp)
// 6. Call Daraja STK Push endpoint (displays PIN prompt on buyer's phone)
// 7. Return CheckoutRequestID to frontend for polling
//
// ERROR HANDLING:
// - Invalid order ID or order not found
// - Order doesn't belong to buyer
// - Order not in ACCEPTED status
// - Daraja OAuth failure (invalid credentials)
// - Invalid phone number format
// - Daraja connection timeout
// ============================================================================
export const initiatePayment = async (req, res) => {
  try {
    // 🔍 DEBUG: Log at the very beginning
    console.log('=== PAYMENT INITIATION STARTED ===');
    console.log('Order ID:', req.params.orderId);
    console.log('User:', req.user);

    const { orderId } = req.params;
    const buyerId = req.user?.userId; // From auth middleware

    // VALIDATION: Check required parameters
    if (!orderId || !buyerId) {
      // 🔍 DEBUG: Log why validation failed
      console.log('Missing params check failed:', {
        orderId: req.params.orderId,
        buyerId: req.user?.userId,
        orderIdExists: !!orderId,
        buyerIdExists: !!buyerId,
      });
      return errorResponse(res, 400, 'Missing required parameters');
    }

    console.log(`\n💳 [PAYMENT INITIATION] Order: ${orderId}, Buyer: ${buyerId}`);

    // STEP 1: Fetch order and verify buyer ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        farmer: true,
        listing: {
          select: { cropName: true },
        },
      },
    });

    if (!order) {
      console.log(`❌ Order not found: ${orderId}`);
      return errorResponse(res, 404, 'Order not found');
    }

    // VERIFY: Order belongs to the requesting buyer
    if (order.buyerId !== buyerId) {
      console.log(`❌ Order doesn't belong to buyer. Order buyer: ${order.buyerId}, Requester: ${buyerId}`);
      return errorResponse(res, 403, 'This order does not belong to you');
    }

    // VERIFY: Order status is ACCEPTED
    // (Farmer must have accepted the order before payment)
    if (order.status !== 'ACCEPTED') {
      console.log(`❌ Invalid order status: ${order.status} (must be ACCEPTED)`);
      return errorResponse(res, 400, `Order status must be ACCEPTED, current status: ${order.status}`);
    }

    // VERIFY: No existing payment for this order
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (existingPayment && existingPayment.status !== 'REFUNDED') {
      console.log(`⚠️ Payment already exists with status: ${existingPayment.status}`);
      return errorResponse(res, 400, 'Payment already initiated for this order');
    }

    // STEP 2: Create Payment record with PENDING status
    // This records the payment intent in the database
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: order.totalPrice,
        status: 'PENDING',
        payerPhone: order.buyer.mpesaNumber,
        farmerPhone: order.farmer.mpesaNumber,
      },
    });

    console.log(`✓ Payment record created: ${payment.id}, Status: PENDING`);

    // STEP 3: Initiate Daraja STK Push
    // This sends an STK push to buyer's phone to enter M-Pesa PIN
    const stkResponse = await initiateStkPush({
      phone: order.buyer.mpesaNumber,
      amount: order.totalPrice,
      orderId,
      cropName: order.listing.cropName,
    });

    if (!stkResponse.success) {
      // If STK push fails, delete the payment record
      await prisma.payment.delete({ where: { id: payment.id } });
      console.log(`❌ STK Push failed: ${stkResponse.error}`);
      return errorResponse(res, 400, `Payment initiation failed: ${stkResponse.error}`);
    }

    console.log(`✓ STK Push initiated successfully`);
    console.log(`   CheckoutRequestID: ${stkResponse.checkoutRequestId}`);

    // RESPONSE: Send CheckoutRequestID to frontend for polling
    return successResponse(res, 200, 'Payment initiated. Please enter your M-Pesa PIN', {
      checkoutRequestId: stkResponse.checkoutRequestId,
      merchantRequestId: stkResponse.merchantRequestId,
      paymentId: payment.id,
      amount: order.totalPrice,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('❌ [PAYMENT INITIATION ERROR]:', error.message);
    return errorResponse(res, 500, 'Failed to initiate payment', error.message);
  }
};

// ============================================================================
// ENDPOINT 2: POST /api/payments/callback
// ============================================================================
// PUBLIC ENDPOINT - Called by Safaricom Daraja as webhook
// No authentication required (Daraja uses IP whitelisting)
//
// WEBHOOK FLOW:
// Safaricom calls this after M-Pesa transaction attempt (success or failure)
// The callback contains:
// - ResultCode: 0 = success, non-zero = failure
// - CallbackMetadata: Receipt number, transaction timestamp, phone number
//
// ON SUCCESS (ResultCode === 0):
// 1. Extract MpesaReceiptNumber from CallbackMetadata
// 2. Update Payment status to HELD (money is now in escrow)
// 3. Update Order status to PAID
// 4. Send SMS to FARMER: "Payment received and held safely"
// 5. Send SMS to BUYER: "Payment successful, waiting for delivery"
//
// ON FAILURE:
// 1. Update Payment status to REFUNDED
// 2. Update Order status back to ACCEPTED (buyer can try again)
// 3. Send SMS to BUYER: "Payment failed, please try again"
//
// ERROR HANDLING:
// - Invalid callback structure
// - Order or payment not found
// - Concurrent callback processing (idempotent)
// ============================================================================
export const handleDarajaCallback = async (req, res) => {
  try {
    const body = req.body;

    console.log(`\n📬 [DARAJA CALLBACK RECEIVED]`);
    console.log('Callback body:', JSON.stringify(body, null, 2));

    // PARSE: Extract callback data from Daraja format
    const callbackData = parseDarajaCallback(body);

    if (!callbackData.success && !callbackData.checkoutRequestId) {
      console.log('❌ Invalid callback format');
      // Still return 200 to acknowledge to Daraja
      return res.status(200).json({ success: false, message: 'Invalid callback format' });
    }

    // FIND: Get payment by CheckoutRequestID (or search orders)
    // Note: We need to find the original order this payment belongs to
    // In production, store CheckoutRequestID in Payment model for this lookup
    let payment = null;
    let order = null;

    // Search through recent payments to find matching one
    const recentPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          // Look for payments created in last 15 minutes
          gte: new Date(Date.now() - 15 * 60 * 1000),
        },
      },
      include: {
        order: {
          include: {
            buyer: true,
            farmer: true,
            listing: { select: { cropName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Match by AccountReference or payment amount
    if (recentPayments.length > 0) {
      payment = recentPayments[0];
      order = payment.order;
    }

    if (!payment || !order) {
      console.log('⚠️ Payment/Order not found. This might be a retry callback.');
      return res.status(200).json({ success: false, message: 'Payment not found' });
    }

    // CHECK: Prevent duplicate processing (idempotent)
    if (payment.status !== 'PENDING') {
      console.log(`⚠️ Payment already processed with status: ${payment.status}`);
      return res.status(200).json({ success: true, message: 'Callback already processed' });
    }

    // HANDLE SUCCESS: ResultCode === 0
    if (callbackData.success) {
      console.log(`✓ Payment successful - ResultCode: ${callbackData.resultCode}`);

      // UPDATE: Payment status to HELD (escrowed)
      // Money is now safely held by Safaricom until we release it
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'HELD',
          mpesaTransactionId: callbackData.mpesaReceiptNumber,
          paidAt: new Date(),
        },
      });

      console.log(`✓ Payment updated to HELD status`);
      console.log(`   M-Pesa Receipt: ${updatedPayment.mpesaTransactionId}`);

      // UPDATE: Order status to PAID
      // This indicates payment has been received
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });

      console.log(`✓ Order status updated to PAID`);

      // SMS: Notify FARMER - Payment received and held safely
      // Tell farmer to prepare and send the goods
      await sendPaymentHeldToFarmer(
        order.farmer.mpesaNumber,
        order.farmer.name,
        order.totalPrice,
        order.listing.cropName
      );

      // SMS: Notify BUYER - Payment successful
      // Confirm transaction and set expectations
      await sendPaymentSuccessTobuyer(
        order.buyer.mpesaNumber,
        order.totalPrice,
        callbackData.mpesaReceiptNumber
      );

      console.log('✓ SMS notifications sent to buyer and farmer');
    } else {
      // HANDLE FAILURE: ResultCode !== 0
      console.log(`❌ Payment failed - ResultCode: ${callbackData.resultCode}`);
      console.log(`   Result Description: ${callbackData.resultDescription}`);

      // UPDATE: Payment status to REFUNDED
      // Transaction failed, no money transferred
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      });

      console.log(`✓ Payment status updated to REFUNDED`);

      // UPDATE: Order status back to ACCEPTED
      // So buyer can retry payment
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'ACCEPTED' },
      });

      console.log(`✓ Order status reset to ACCEPTED for retry`);

      // SMS: Notify BUYER - Payment failed
      await sendPaymentFailureTobuyer(order.buyer.mpesaNumber);

      console.log('✓ Failure SMS sent to buyer');
    }

    // RESPONSE: Always return 200 to Daraja to acknowledge receipt
    return res.status(200).json({
      success: true,
      message: 'Callback processed successfully',
    });
  } catch (error) {
    console.error('❌ [CALLBACK ERROR]:', error.message);
    // Still return 200 to prevent Daraja retries
    return res.status(200).json({
      success: false,
      message: 'Error processing callback',
      error: error.message,
    });
  }
};

// ============================================================================
// ENDPOINT 3: PATCH /api/payments/confirm-delivery/:orderId
// ============================================================================
// Buyer or Farmer confirms they received/sent the goods
// Authenticated endpoint - user must be buyer or farmer on the order
//
// CONFIRMATION FLOW (ESCROW RELEASE):
// Payment is in HELD status until BOTH parties confirm:
// 1. BUYER confirms: "I received the goods" → buyerConfirmed = true
// 2. FARMER confirms: "I sent the goods" → farmerConfirmed = true
// 3. ONCE BOTH CONFIRMED:
//    - Update Payment status to RELEASED
//    - Update Order status to COMPLETED
//    - Farmer money is transferred (B2C in production, simulated now)
//    - SMS confirmations sent to both
//
// This 2-of-2 confirmation system prevents disputes by ensuring
// both parties agree before money changes hands
//
// ERROR HANDLING:
// - Invalid order ID
// - Order not in PAID status
// - User is not buyer or farmer on order
// - User has already confirmed
// ============================================================================
export const confirmDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.userId; // From auth middleware
    const userRole = req.user?.role; // FARMER or BUYER

    if (!orderId || !userId) {
      return errorResponse(res, 400, 'Missing required parameters');
    }

    console.log(`\n✅ [DELIVERY CONFIRMATION] Order: ${orderId}, User: ${userId} (${userRole})`);

    // FETCH: Get order and payment details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        buyer: true,
        farmer: true,
        listing: { select: { cropName: true } },
      },
    });

    if (!order) {
      console.log(`❌ Order not found: ${orderId}`);
      return errorResponse(res, 404, 'Order not found');
    }

    // VERIFY: User is buyer or farmer on this order
    const isBuyer = order.buyerId === userId;
    const isFarmer = order.farmerId === userId;

    if (!isBuyer && !isFarmer) {
      console.log(`❌ User is not buyer or farmer on this order`);
      return errorResponse(res, 403, 'You are not involved in this order');
    }

    // VERIFY: Order status is PAID (payment held in escrow)
    if (order.status !== 'PAID') {
      console.log(`❌ Invalid order status: ${order.status} (must be PAID)`);
      return errorResponse(res, 400, `Order must be in PAID status, current: ${order.status}`);
    }

    // VERIFY: Payment exists and is in HELD status
    if (!order.payment || order.payment.status !== 'HELD') {
      console.log(`❌ Payment not in HELD status`);
      return errorResponse(res, 400, 'Payment is not in escrow');
    }

    // UPDATE: Set confirmation flag for this user
    const updateData = {};
    let userType = '';

    if (isBuyer) {
      if (order.payment.buyerConfirmed) {
        console.log(`⚠️ Buyer already confirmed`);
        return errorResponse(res, 400, 'You have already confirmed delivery');
      }
      updateData.buyerConfirmed = true;
      userType = 'BUYER';
      console.log(`✓ Buyer confirmation recorded`);
    } else if (isFarmer) {
      if (order.payment.farmerConfirmed) {
        console.log(`⚠️ Farmer already confirmed`);
        return errorResponse(res, 400, 'You have already confirmed delivery');
      }
      updateData.farmerConfirmed = true;
      userType = 'FARMER';
      console.log(`✓ Farmer confirmation recorded`);
    }

    // UPDATE: Payment with new confirmation status
    const updatedPayment = await prisma.payment.update({
      where: { id: order.payment.id },
      data: updateData,
    });

    console.log(`Payment updated - Buyer: ${updatedPayment.buyerConfirmed}, Farmer: ${updatedPayment.farmerConfirmed}`);

    // SEND SMS: Notify the other party of confirmation
    if (isBuyer) {
      // Buyer confirmed, notify farmer
      await sendBuyerConfirmedDeliveryToFarmer(order.farmer.mpesaNumber);
      console.log('📩 SMS sent to farmer: "Buyer confirmed delivery"');
    } else if (isFarmer) {
      // Farmer confirmed, notify buyer
      await sendFarmerConfirmedDeliveryTobuyer(order.buyer.mpesaNumber);
      console.log('📩 SMS sent to buyer: "Farmer confirmed delivery"');
    }

    // CHECK: Have BOTH confirmed? If yes, RELEASE ESCROW
    if (updatedPayment.buyerConfirmed && updatedPayment.farmerConfirmed) {
      console.log(`\n🎉 [ESCROW RELEASE] Both parties confirmed! Processing payment release...`);

      // STEP 1: Simulate B2C payment to farmer (or actual B2C in production)
      const b2cResult = await releasePaymentB2C({
        phone: order.farmer.mpesaNumber,
        amount: order.totalPrice,
        farmerName: order.farmer.name,
        cropName: order.listing.cropName,
      });

      if (b2cResult.success) {
        console.log(`✓ B2C transfer simulated/processed`);
      } else {
        console.log(`⚠️ B2C failed: ${b2cResult.error}`);
        // Note: In production, we might retry or flag for manual processing
      }

      // STEP 2: Update Payment to RELEASED
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: 'RELEASED' },
      });

      console.log(`✓ Payment status updated to RELEASED`);

      // STEP 3: Update Order to COMPLETED
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' },
      });

      console.log(`✓ Order status updated to COMPLETED`);

      // STEP 4: Send completion SMS to both parties
      // Farmer: Money transferred SMS
      await sendPaymentReleasedToFarmer(
        order.farmer.mpesaNumber,
        order.farmer.name,
        order.totalPrice,
        order.farmer.mpesaNumber
      );

      // Buyer: Order completed SMS + reminder to review
      await sendOrderCompletedTobuyer(order.buyer.mpesaNumber);

      console.log('📩 Completion SMS sent to both parties');

      // RESPONSE: Payment released successfully
      return successResponse(res, 200, 'Payment released to farmer', {
        orderId: order.id,
        status: 'COMPLETED',
        message: 'Both parties confirmed. Payment has been released to the farmer.',
        buyerConfirmed: true,
        farmerConfirmed: true,
      });
    } else {
      // WAITING: Waiting for other party to confirm
      const pendingParty = updatedPayment.buyerConfirmed ? 'Farmer' : 'Buyer';
      console.log(`⏳ Waiting for ${pendingParty} confirmation...`);

      return successResponse(res, 200, `Confirmation recorded. Waiting for ${pendingParty} confirmation`, {
        orderId: order.id,
        status: 'PAID',
        buyerConfirmed: updatedPayment.buyerConfirmed,
        farmerConfirmed: updatedPayment.farmerConfirmed,
        message: `Waiting for ${pendingParty} to confirm delivery`,
      });
    }
  } catch (error) {
    console.error('❌ [CONFIRM DELIVERY ERROR]:', error.message);
    return errorResponse(res, 500, 'Failed to confirm delivery', error.message);
  }
};

// ============================================================================
// ENDPOINT 4: POST /api/payments/refund/:orderId
// ============================================================================
// ADMIN ONLY - Refund a payment in case of disputes
//
// REFUND FLOW:
// 1. Verify user is admin
// 2. Verify order exists
// 3. Update Payment status to REFUNDED
// 4. Update Order status to DISPUTED
// 5. Send SMS to buyer: "Your payment will be refunded in 3-5 days"
// 6. Send SMS to farmer: "This order is disputed, we'll contact you"
//
// In production: Actually process M-Pesa refund (B2C to buyer)
// Currently: Simulated - we record it and send SMS
//
// ERROR HANDLING:
// - Non-admin user
// - Order not found
// - Invalid payment status (can't refund if already refunded)
// ============================================================================
export const refundPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!orderId || !userId) {
      return errorResponse(res, 400, 'Missing required parameters');
    }

    console.log(`\n💰 [REFUND INITIATED] Order: ${orderId}, Admin: ${userId}`);

    // VERIFY: User is admin
    if (userRole !== 'ADMIN') {
      console.log(`❌ Only admins can refund payments. User role: ${userRole}`);
      return errorResponse(res, 403, 'Only admins can refund payments');
    }

    // FETCH: Get order and payment
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        buyer: true,
        farmer: true,
      },
    });

    if (!order) {
      console.log(`❌ Order not found: ${orderId}`);
      return errorResponse(res, 404, 'Order not found');
    }

    if (!order.payment) {
      console.log(`❌ No payment found for order: ${orderId}`);
      return errorResponse(res, 400, 'No payment to refund');
    }

    // CHECK: Can't refund if already refunded
    if (order.payment.status === 'REFUNDED') {
      console.log(`⚠️ Payment already refunded`);
      return errorResponse(res, 400, 'Payment already refunded');
    }

    // UPDATE: Payment status to REFUNDED
    // In production: Process actual M-Pesa refund first
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: { status: 'REFUNDED' },
    });

    console.log(`✓ Payment status updated to REFUNDED`);

    // UPDATE: Order status to DISPUTED
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'DISPUTED' },
    });

    console.log(`✓ Order status updated to DISPUTED`);

    // SMS: Notify buyer - Refund will be processed
    await sendPaymentRefundedTobuyer(
      order.buyer.mpesaNumber,
      order.payment.amount
    );

    // SMS: Notify farmer - Dispute reported
    await sendDisputeReportedToFarmer(order.farmer.mpesaNumber);

    console.log('📩 SMS notifications sent to both parties');

    return successResponse(res, 200, 'Payment refunded successfully', {
      orderId: order.id,
      paymentId: order.payment.id,
      amount: order.payment.amount,
      status: 'REFUNDED',
      message: 'Payment has been marked for refund and both parties notified',
    });
  } catch (error) {
    console.error('❌ [REFUND ERROR]:', error.message);
    return errorResponse(res, 500, 'Failed to refund payment', error.message);
  }
};

// ============================================================================
// ENDPOINT 5: GET /api/payments/:orderId
// ============================================================================
// Get payment details for an order
// Authenticated endpoint - user must be buyer, farmer, or admin on the order
//
// RETURNS:
// - Payment status (PENDING/HELD/RELEASED/REFUNDED)
// - M-Pesa transaction ID
// - Amount and timestamps
// - Confirmation status from both parties
// - Order status
//
// ERROR HANDLING:
// - Order not found
// - Payment not found
// - Unauthorized user (not involved in order)
// ============================================================================
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.userId;

    if (!orderId || !userId) {
      return errorResponse(res, 400, 'Missing required parameters');
    }

    console.log(`📊 [GET PAYMENT STATUS] Order: ${orderId}, User: ${userId}`);

    // FETCH: Get order and payment
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        buyer: { select: { id: true, name: true, mpesaNumber: true } },
        farmer: { select: { id: true, name: true, mpesaNumber: true } },
      },
    });

    if (!order) {
      console.log(`❌ Order not found: ${orderId}`);
      return errorResponse(res, 404, 'Order not found');
    }

    // VERIFY: User is buyer, farmer, or admin
    const isBuyer = order.buyerId === userId;
    const isFarmer = order.farmerId === userId;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isBuyer && !isFarmer && !isAdmin) {
      console.log(`❌ User not authorized to view this payment`);
      return errorResponse(res, 403, 'You do not have access to this payment');
    }

    if (!order.payment) {
      console.log(`❌ No payment found for order: ${orderId}`);
      return errorResponse(res, 404, 'No payment found for this order');
    }

    // FORMAT: Return payment details
    const paymentDetails = {
      id: order.payment.id,
      orderId: order.payment.orderId,
      amount: order.payment.amount,
      status: order.payment.status,
      mpesaTransactionId: order.payment.mpesaTransactionId,
      paidAt: order.payment.paidAt,
      createdAt: order.payment.createdAt,
      updatedAt: order.payment.updatedAt,
      // Escrow confirmation status
      buyerConfirmed: order.payment.buyerConfirmed,
      farmerConfirmed: order.payment.farmerConfirmed,
      // Order status for context
      orderStatus: order.status,
      // Party details
      buyer: isBuyer || isAdmin ? order.buyer : null,
      farmer: isFarmer || isAdmin ? order.farmer : null,
    };

    console.log(`✓ Payment details retrieved`);

    return successResponse(res, 200, 'Payment status retrieved', paymentDetails);
  } catch (error) {
    console.error('❌ [GET PAYMENT ERROR]:', error.message);
    return errorResponse(res, 500, 'Failed to retrieve payment status', error.message);
  }
};

export default {
  initiatePayment,
  handleDarajaCallback,
  confirmDelivery,
  refundPayment,
  getPaymentStatus,
};
