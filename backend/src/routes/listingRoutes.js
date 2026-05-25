import express from 'express';

const router = express.Router();

// GET /api/listings - Get all listings with filters (cropType, county)
// GET /api/listings/:id - Get single listing details
// POST /api/listings - Create new listing (authenticated, farmer only)
// PATCH /api/listings/:id - Update listing (owner only)
// DELETE /api/listings/:id - Delete listing (owner only)

export default router;
