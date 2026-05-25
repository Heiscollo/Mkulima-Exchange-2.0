import mongoose, { Document, Schema } from 'mongoose';

export interface IFarmerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  farmName: string;
  county: string;
  location: string;
  bio?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const farmerProfileSchema = new Schema<IFarmerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    farmName: { type: String, required: true },
    county: { type: String, required: true },
    location: { type: String, required: true },
    bio: { type: String },
    verificationStatus: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected'], 
      default: 'pending' 
    },
    verificationDocuments: [{ type: String }],
  },
  { timestamps: true }
);

export const FarmerProfile = mongoose.model<IFarmerProfile>('FarmerProfile', farmerProfileSchema);
