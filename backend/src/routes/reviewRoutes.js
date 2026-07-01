import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { postReview } from '../controllers/reviewController.js';
import { getUserReviews } from '../controllers/userController.js';

const router = express.Router();

// POST /api/reviews - Post a review after a COMPLETED order
// GET /api/reviews/:userId - Legacy public alias for user reviews

router.post('/', authenticateToken, postReview);
router.get('/:userId', getUserReviews);

export default router;
