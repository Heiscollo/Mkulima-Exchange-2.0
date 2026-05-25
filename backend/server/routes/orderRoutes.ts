import express from 'express';
import { 
    createOrder, 
    getMyOrders, 
    getFarmerOrders, 
    updateOrderStatus,
    getAllOrdersAdmin
} from '../controllers/orderController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
    .post(protect, authorize('buyer', 'admin'), createOrder)
    .get(protect, authorize('admin'), getAllOrdersAdmin);

router.get('/myorders', protect, authorize('buyer', 'farmer', 'admin'), getMyOrders);
router.get('/farmer', protect, authorize('farmer', 'admin'), getFarmerOrders);

router.put('/:id/status', protect, authorize('farmer', 'admin'), updateOrderStatus);

export default router;
