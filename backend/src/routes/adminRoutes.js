import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getDisputes,
  getStats,
  resolveDisputedOrder,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/disputes', getDisputes);
router.patch('/orders/:id/resolve', resolveDisputedOrder);
router.get('/stats', getStats);

export default router;
