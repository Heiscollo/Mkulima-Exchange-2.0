import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from '../controllers/listingController.js';
import { authenticateToken, requireFarmer, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadListingImages } from '../config/multer.js';

const router = express.Router();

// Validation middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

/**
 * POST /api/listings
 * Create new listing (farmers only)
 */
router.post(
  '/',
  authenticateToken,
  requireFarmer,
  uploadListingImages,
  [
    body('crop_name')
      .trim()
      .notEmpty()
      .withMessage('Crop name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Crop name must be between 2 and 100 characters'),
    body('crop_category')
      .trim()
      .notEmpty()
      .withMessage('Crop category is required')
      .isIn([
        'CEREALS_AND_GRAINS',
        'LEGUMES_AND_PULSES',
        'VEGETABLES',
        'FRUITS',
        'ROOT_CROPS_AND_TUBERS',
        'CASH_CROPS',
        'HERBS_AND_SPICES',
        'NUTS_AND_SEEDS',
        'DAIRY_AND_LIVESTOCK_PRODUCTS',
        'FISH_AND_SEAFOOD',
        'TREE_CROPS_AND_OTHERS',
      ])
      .withMessage('Invalid crop category'),
    body('quantity')
      .trim()
      .notEmpty()
      .withMessage('Quantity is required')
      .isFloat({ min: 0.01 })
      .withMessage('Quantity must be a positive number'),
    body('unit')
      .trim()
      .notEmpty()
      .withMessage('Unit is required')
      .isIn(['KG', 'BAG', 'CRATE', 'TONNE', 'LITRE', 'BUNCH', 'SACK'])
      .withMessage('Invalid unit'),
    body('price_per_unit')
      .trim()
      .notEmpty()
      .withMessage('Price per unit is required')
      .isFloat({ min: 0.01 })
      .withMessage('Price per unit must be a positive number'),
    body('county')
      .trim()
      .notEmpty()
      .withMessage('County is required'),
    body('available_date')
      .trim()
      .notEmpty()
      .withMessage('Available date is required')
      .isISO8601()
      .withMessage('Available date must be a valid date'),
    body('description')
      .trim()
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
  ],
  handleValidationErrors,
  createListing
);

/**
 * GET /api/listings
 * Get all listings with filters (public)
 */
router.get(
  '/',
  [
    query('crop_name')
      .trim()
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Crop name must be between 1 and 100 characters'),
    query('crop_category')
      .optional({ checkFalsy: true })
      .trim()
      .isIn([
        'CEREALS_AND_GRAINS',
        'LEGUMES_AND_PULSES',
        'VEGETABLES',
        'FRUITS',
        'ROOT_CROPS_AND_TUBERS',
        'CASH_CROPS',
        'HERBS_AND_SPICES',
        'NUTS_AND_SEEDS',
        'DAIRY_AND_LIVESTOCK_PRODUCTS',
        'FISH_AND_SEAFOOD',
        'TREE_CROPS_AND_OTHERS',
      ])
      .withMessage('Invalid crop category'),
    query('county')
      .trim()
      .optional(),
    query('farmer_id')
      .trim()
      .optional(),
    query('min_price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Min price must be a positive number'),
    query('max_price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max price must be a positive number'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  handleValidationErrors,
  getAllListings
);

/**
 * GET /api/listings/:id
 * Get single listing by ID (public)
 */
router.get(
  '/:id',
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('Listing ID is required'),
  ],
  handleValidationErrors,
  getListingById
);

/**
 * PUT /api/listings/:id
 * Update listing (farmer only, owner only)
 */
router.put(
  '/:id',
  authenticateToken,
  requireFarmer,
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('Listing ID is required'),
    body('crop_name')
      .trim()
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Crop name must be between 2 and 100 characters'),
    body('crop_category')
      .trim()
      .optional()
      .isIn([
        'CEREALS_AND_GRAINS',
        'LEGUMES_AND_PULSES',
        'VEGETABLES',
        'FRUITS',
        'ROOT_CROPS_AND_TUBERS',
        'CASH_CROPS',
        'HERBS_AND_SPICES',
        'NUTS_AND_SEEDS',
        'DAIRY_AND_LIVESTOCK_PRODUCTS',
        'FISH_AND_SEAFOOD',
        'TREE_CROPS_AND_OTHERS',
      ])
      .withMessage('Invalid crop category'),
    body('quantity')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Quantity must be a positive number'),
    body('unit')
      .trim()
      .optional()
      .isIn(['KG', 'BAG', 'CRATE', 'TONNE', 'LITRE', 'BUNCH', 'SACK'])
      .withMessage('Invalid unit'),
    body('price_per_unit')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Price per unit must be a positive number'),
    body('county')
      .trim()
      .optional(),
    body('available_date')
      .optional()
      .isISO8601()
      .withMessage('Available date must be a valid date'),
    body('description')
      .trim()
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
  ],
  handleValidationErrors,
  updateListing
);

/**
 * DELETE /api/listings/:id
 * Delete (soft delete) listing (farmer only, owner only)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireFarmer,
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('Listing ID is required'),
  ],
  handleValidationErrors,
  deleteListing
);

export default router;
