import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../config/multer.js';
import {
  getUserProfile,
  getUserReviews,
  updateOwnProfile,
} from '../controllers/userController.js';

const router = express.Router();

// Public reputation surface for a user.
router.get('/:id/reviews', getUserReviews);
router.get('/:id/profile', getUserProfile);

// Personal profile maintenance for the authenticated account holder.
router.put('/profile', authenticateToken, uploadAvatar, updateOwnProfile);

export default router;