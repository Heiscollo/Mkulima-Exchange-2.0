import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB, { disconnectDB } from './server/config/db';
import { User } from './server/models/User';
import { Product } from './server/models/Product';
import { FarmerProfile } from './server/models/FarmerProfile';
import bcrypt from 'bcrypt';

dotenv.config();

export const importData = async () => {
  try {
    // Check if MongoDB is actually connected
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected. Skipping seed.');
      return;
    }

    const { Order } = await import('./server/models/Order');
    
    // Check if data already exists to avoid duplicate seeding
    const usersCount = await User.countDocuments().maxTimeMS(5000) as any;
    if (usersCount > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await FarmerProfile.deleteMany();
    
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('password123', salt);

    const createdUsers = await User.insertMany([
      { name: 'Admin User', email: 'admin@mkulima.com', passwordHash: pass, role: 'admin', isVerified: true },
      { name: 'John Kamau', email: 'kamau@mkulima.com', passwordHash: pass, phone: '254712345678', role: 'farmer', isVerified: true },
      { name: 'Jane Buyer', email: 'jane@buyer.com', passwordHash: pass, phone: '254700000000', role: 'buyer', isVerified: true },
    ]);

    const adminUser = createdUsers[0]._id;
    const farmerUser = createdUsers[1]._id;

    await FarmerProfile.create({
        userId: farmerUser,
        farmName: 'Kamau Green Farms',
        county: 'Kiambu',
        location: 'Kikuyu',
        bio: 'We grow the freshest organic vegetables in Kiambu county.',
        verificationStatus: 'verified'
    });

    await Product.insertMany([
      {
        farmerId: farmerUser,
        name: 'Fresh Tomatoes',
        description: 'Organic Roma tomatoes freshly hand-picked.',
        price: 150,
        unit: 'kg',
        quantityAvailable: 100,
        category: 'Vegetables',
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop'],
      },
      {
        farmerId: farmerUser,
        name: 'Hass Avocados',
        description: 'Large, creamy, and ready to eat avocados.',
        price: 50,
        unit: 'piece',
        quantityAvailable: 200,
        category: 'Fruits',
        images: ['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=600&auto=format&fit=crop'],
      },
    ]);

    console.log('Data Imported!');
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const runSeed = async () => {
    await connectDB();
    await importData();
    await disconnectDB();
    process.exit();
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
   runSeed();
}
