import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  farmerId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  unit: string; // e.g., 'kg', 'piece', 'bunch', 'bag'
  quantityAvailable: number;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Dairy' | 'Poultry' | 'Tubers';
  images: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    quantityAvailable: { type: Number, required: true },
    category: { 
      type: String, 
      enum: ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Poultry', 'Tubers'],
      required: true 
    },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
