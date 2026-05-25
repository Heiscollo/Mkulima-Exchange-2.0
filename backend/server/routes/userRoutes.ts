import express from 'express';
import { getUsers, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteUser);

export default router;
