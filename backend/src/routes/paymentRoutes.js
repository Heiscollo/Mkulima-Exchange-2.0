import express from 'express';

const router = express.Router();

// POST /api/payments/initiate/:orderId - Initiate M-Pesa STK Push
// POST /api/payments/callback - Daraja callback endpoint (webhook)
// GET /api/payments/:orderId - Get payment status
// POST /api/payments/:orderId/release - Release payment to farmer

export default router;
