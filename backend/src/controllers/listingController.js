import { PrismaClient } from '@prisma/client';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

const prisma = new PrismaClient();

/**
 * POST /api/listings
 * Create a new listing (farmers only)
 * Accepts: multipart/form-data with up to 5 images
 */
export const createListing = async (req, res) => {
  try {
    const {
      crop_name,
      crop_category,
      quantity,
      unit,
      price_per_unit,
      county,
      description,
      available_date,
    } = req.body;
    const userId = req.user.userId;
    const files = req.files || [];

    // Validate required fields
    if (
      !crop_name ||
      !crop_category ||
      !quantity ||
      !unit ||
      !price_per_unit ||
      !county ||
      !available_date
    ) {
      return res.status(400).json({
        error: 'Missing required fields: crop_name, crop_category, quantity, unit, price_per_unit, county, available_date',
      });
    }

    // Validate numeric fields
    const quantityNum = parseFloat(quantity);
    const priceNum = parseFloat(price_per_unit);

    if (isNaN(quantityNum) || quantityNum <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({
        error: 'Price per unit must be a positive number',
      });
    }

    // Upload images to Cloudinary
    const imageUrls = [];

    for (const file of files) {
      const uploadResult = await uploadImage(file.path, 'listings');
      if (uploadResult.success) {
        imageUrls.push(uploadResult.url);
      } else {
        return res.status(500).json({
          error: 'Failed to upload image: ' + uploadResult.error,
        });
      }
    }

    // Create listing in database
    const listing = await prisma.listing.create({
      data: {
        farmerId: userId,
        cropName: crop_name,
        cropCategory: crop_category,
        quantity: quantityNum,
        unit: unit,
        pricePerUnit: priceNum,
        county: county,
        description: description || '',
        availableDate: new Date(available_date),
        images: imageUrls,
        status: 'ACTIVE',
      },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            county: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing,
    });
  } catch (error) {
    console.error('Create Listing Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/listings
 * Get all listings with optional filters (public)
 * Filters: crop_name, crop_category, county, min_price, max_price, page, limit
 */
export const getAllListings = async (req, res) => {
  try {
    const {
      crop_name,
      crop_category,
      county,
      min_price,
      max_price,
      page = 1,
      limit = 20,
    } = req.query;

    // Build where clause for filters
    const where = {
      status: 'ACTIVE', // Only show active listings
    };

    if (crop_name) {
      where.cropName = {
        contains: crop_name,
        mode: 'insensitive',
      };
    }

    if (crop_category) {
      where.cropCategory = crop_category;
    }

    if (county) {
      where.county = county;
    }

    if (min_price || max_price) {
      where.pricePerUnit = {};
      if (min_price) {
        where.pricePerUnit.gte = parseFloat(min_price);
      }
      if (max_price) {
        where.pricePerUnit.lte = parseFloat(max_price);
      }
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Get listings
    const listings = await prisma.listing.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            county: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total count for pagination
    const total = await prisma.listing.count({ where });

    return res.status(200).json({
      success: true,
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get Listings Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/listings/:id
 * Get a single listing by ID (public)
 */
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            county: true,
            farmerProfile: {
              select: {
                farmSizeAcres: true,
                cropsGrown: true,
              },
            },
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    return res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('Get Listing Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PUT /api/listings/:id
 * Update a listing (farmer only, owner only)
 */
export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      crop_name,
      crop_category,
      quantity,
      unit,
      price_per_unit,
      county,
      description,
      available_date,
    } = req.body;

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if user is the owner
    if (listing.farmerId !== userId) {
      return res.status(403).json({
        error: 'Forbidden - You can only update your own listings',
      });
    }

    // Check if listing is still active
    if (listing.status !== 'ACTIVE') {
      return res.status(400).json({
        error: 'Cannot update a listing that is not active',
      });
    }

    // Prepare update data
    const updateData = {};

    if (crop_name) updateData.cropName = crop_name;
    if (crop_category) updateData.cropCategory = crop_category;

    if (quantity !== undefined) {
      const quantityNum = parseFloat(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        return res
          .status(400)
          .json({ error: 'Quantity must be a positive number' });
      }
      updateData.quantity = quantityNum;
    }

    if (unit) updateData.unit = unit;

    if (price_per_unit !== undefined) {
      const priceNum = parseFloat(price_per_unit);
      if (isNaN(priceNum) || priceNum <= 0) {
        return res
          .status(400)
          .json({ error: 'Price per unit must be a positive number' });
      }
      updateData.pricePerUnit = priceNum;
    }

    if (county) updateData.county = county;
    if (description) updateData.description = description;
    if (available_date) updateData.availableDate = new Date(available_date);

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            county: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Update Listing Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /api/listings/:id
 * Delete (soft delete) a listing - set status to CANCELLED (farmer only, owner only)
 */
export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if user is the owner
    if (listing.farmerId !== userId) {
      return res.status(403).json({
        error: 'Forbidden - You can only delete your own listings',
      });
    }

    // Soft delete - set status to CANCELLED
    const deletedListing = await prisma.listing.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return res.status(200).json({
      success: true,
      message: 'Listing cancelled successfully',
      listing: deletedListing,
    });
  } catch (error) {
    console.error('Delete Listing Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
