import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
}

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId; // One order per farmer typical for multi-vendor
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'accepted' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'shipped', 'delivered', 'cancelled'], 
      default: 'pending' 
    },
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, default: 'M-PESA' },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
