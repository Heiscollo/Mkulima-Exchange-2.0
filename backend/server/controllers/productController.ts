import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { Review } from '../models/Review';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: String(req.query.keyword),
            $options: 'i',
          },
        }
      : {};
      
    const categoryQuery = req.query.category ? { category: String(req.query.category) } : {};

    const filter: any = { ...keyword, ...categoryQuery, isAvailable: true };

    const count = await Product.countDocuments(filter);
    
    const products = await Product.find(filter)
      .populate('farmerId', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
        .populate('farmerId', 'name phone');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, unit, quantityAvailable, category } = req.body;

    const images = req.files ? (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`) : [];

    const product = new Product({
      name,
      description,
      price,
      unit,
      quantityAvailable,
      category,
      images,
      farmerId: req.user!._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, price, unit, quantityAvailable, category, isAvailable } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        if (product.farmerId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
            res.status(403).json({ message: 'Not authorized to update this product' });
            return;
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.unit = unit || product.unit;
        product.quantityAvailable = quantityAvailable !== undefined ? quantityAvailable : product.quantityAvailable;
        product.category = category || product.category;
        product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;

        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const newImages = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
            product.images = [...product.images, ...newImages];
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        if (product.farmerId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
            res.status(403).json({ message: 'Not authorized to delete this product' });
            return;
        }

        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createProductReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
             res.status(404).json({ message: 'Product not found' });
             return;
        }
        
        const alreadyReviewed = await Review.findOne({
            productId: req.params.id,
            userId: req.user!._id
        });

        if (alreadyReviewed) {
             res.status(400).json({ message: 'Product already reviewed' });
             return;
        }

        const review = await Review.create({
            productId: req.params.id,
            userId: req.user!._id,
            rating: Number(rating),
            comment
        });

        res.status(201).json({ message: 'Review added', review });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
