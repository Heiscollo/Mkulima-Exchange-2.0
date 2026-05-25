import express from 'express';

const router = express.Router();

// GET /api/admin/stats - Platform statistics (admin only)
// GET /api/admin/disputes - Get disputes (admin only)
// POST /api/admin/disputes/:id/resolve - Resolve a dispute

export default router;
