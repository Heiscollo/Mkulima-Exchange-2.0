import express from 'express';

const router = express.Router();

// POST /api/orders - Place an order
// GET /api/orders/:id - Get order details
// PATCH /api/orders/:id/accept - Farmer accepts order
// PATCH /api/orders/:id/negotiate - Counter offer on price
// PATCH /api/orders/:id/confirm - Buyer confirms before payment
// PATCH /api/orders/:id/deliver - Mark as delivered
// GET /api/orders - Get user's orders (buyer or farmer)

export default router;
