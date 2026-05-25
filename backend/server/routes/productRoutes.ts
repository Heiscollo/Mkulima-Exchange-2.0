import express from 'express';
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    createProductReview
} from '../controllers/productController';
import { protect, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('farmer', 'admin'), upload.array('images', 5), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('farmer', 'admin'), upload.array('images', 5), updateProduct)
  .delete(protect, authorize('farmer', 'admin'), deleteProduct);

router.post('/:id/reviews', protect, authorize('buyer', 'farmer', 'admin'), createProductReview);

export default router;
