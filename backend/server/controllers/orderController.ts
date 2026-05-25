import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, paymentMethod, farmerId } = req.body;

    if (items && items.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    let totalAmount = 0;
    
    // Verify prices and calculate total
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            res.status(404).json({ message: `Product ${item.productId} not found` });
            return;
        }
        if (product.quantityAvailable < item.quantity) {
             res.status(400).json({ message: `Insufficient quantity for ${product.name}` });
             return;
        }
        
        item.priceAtPurchase = product.price;
        totalAmount += product.price * item.quantity;
        
        // Deduct quantity
        product.quantityAvailable -= item.quantity;
        await product.save();
    }

    const order = new Order({
      buyerId: req.user!._id,
      farmerId,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ buyerId: req.user!._id })
        .populate('farmerId', 'name')
        .populate('items.productId', 'name images')
        .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFarmerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({ farmerId: req.user!._id })
            .populate('buyerId', 'name phone email')
            .populate('items.productId', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
             res.status(404).json({ message: 'Order not found' });
             return;
        }

        // Only the farmer of the order or admin can update status
        if (order.farmerId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
            res.status(403).json({ message: 'Not authorized to update this order' });
            return;
        }

        order.status = status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllOrdersAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({})
            .populate('buyerId', 'name')
            .populate('farmerId', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error: any) {
         res.status(500).json({ message: error.message });
    }
}
