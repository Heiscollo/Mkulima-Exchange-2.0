import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { FarmerProfile } from '../models/FarmerProfile';
import { inMemoryDB } from '../config/inMemoryDB';

const isMongoConnected = () => mongoose.connection.readyState === 1;

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role, farmName, county, location } = req.body;
    console.log(`[REGISTER] Attempt: ${email}, Role: ${role}`);

    // Validate required fields
    if (!name || !email || !password) {
      console.log('[REGISTER] Missing required fields');
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    let userExists;
    
    if (isMongoConnected()) {
      userExists = await User.findOne({ email });
    } else {
      userExists = await inMemoryDB.findUserByEmail(email);
    }

    if (userExists) {
      console.log(`[REGISTER] User already exists: ${email}`);
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let user;
    if (isMongoConnected()) {
      user = await User.create({
        name,
        email,
        passwordHash,
        phone,
        role: role || 'buyer',
      });

      if (user.role === 'farmer') {
        if (!farmName || !county || !location) {
          res.status(400).json({ message: 'Farmer profile details (farmName, county, location) are required' });
          await User.findByIdAndDelete(user._id);
          return;
        }
        await FarmerProfile.create({
          userId: user._id,
          farmName,
          county,
          location,
        });
      }
    } else {
      // Use in-memory fallback
      user = await inMemoryDB.createUser({
        name,
        email,
        passwordHash,
        phone,
        role: role || 'buyer',
      });
    }

    const userId = (user._id || '').toString();
    const token = generateToken(userId);
    console.log(`[REGISTER] Success: ${email} (ID: ${userId})`);
    res.status(201).json({
      _id: userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl || undefined,
      token: token,
    });
  } catch (error: any) {
    console.error('[REGISTER] Error:', error.message || error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN] Attempt: ${email}`);

    if (!email || !password) {
      console.log('[LOGIN] Missing email or password');
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    let user;
    
    if (isMongoConnected()) {
      user = await User.findOne({ email });
    } else {
      user = await inMemoryDB.findUserByEmail(email);
    }

    if (!user) {
      console.log(`[LOGIN] User not found: ${email}`);
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      console.log(`[LOGIN] Invalid password: ${email}`);
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const userId = (user._id || '').toString();
    const token = generateToken(userId);
    console.log(`[LOGIN] Success: ${email} (ID: ${userId})`);
    res.json({
      _id: userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl || undefined,
      token: token,
    });
  } catch (error: any) {
    console.error('[LOGIN] Error:', error.message || error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    let profile = null;
    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ userId: user._id });
    }

    res.json({ user, profile });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
